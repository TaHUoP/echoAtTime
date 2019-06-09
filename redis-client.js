const config = require('./config');
const redis = require('redis');
const asyncRedis = require('async-redis');
const uuid = require('uuid/v4');
const utils = require('./utils');

const redisClient = redis.createClient({
    host: config.redis.host,
    port: config.redis.port
});

redisClient.async = asyncRedis.createClient({
    host: config.redis.host,
    port: config.redis.port
});

redisClient.on('error', err => {
    console.log('Redis Error: ' + err);
});

redisClient.acquireLock = async (lockname, lockTimeoutMs = 2000, acquireTimeoutMs = 1000) => {
    let id = uuid();
    let acquireTimeoutExpire = (new Date).getTime() + acquireTimeoutMs;
    let res = null;
    lockname = redisClient.getLockName(lockname);

    do {
        res = await redisClient.async.set(lockname, id, 'NX', 'PX', lockTimeoutMs);

        if (res !== null) {
            return id;
        }

        await utils.sleep(config.redis.pollingDelayMs);
    } while ((new Date).getTime() < acquireTimeoutExpire)

    return null;
}

redisClient.releaseLock = (lockname, id) => {
    lockname = redisClient.getLockName(lockname);

    try {
        redisClient.watch(lockname);
        redisClient.get(lockname, function(err, value) {
            if (err !== null && value === id) {
                redisClient.multi().
                del(lockname).
                exec();
            }
        });
    } catch (e) {
        console.log(e);
    }
}

redisClient.getLockName = (lockname) => {
    return `lock:${lockname}`;
}

module.exports = redisClient;