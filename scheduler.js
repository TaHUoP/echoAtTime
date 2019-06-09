const config = require('./config');
const redisClient = require('./redis-client');

const processQueue = async () => {
    try {
        let item = await redisClient.async.zrange(config.redis.queueName, 0, 0, 'withscores');

        if (item.length <= 0)
            return;

        let scheduledTime = parseInt(item[1]);

        if (scheduledTime > Math.floor(Date.now() / 1000))
            return;

        let message = item[0];
        let lockId = await redisClient.acquireLock(message);

        if (lockId === null)
            return;

        let removed = await redisClient.zrem(config.redis.queueName, message);

        if (removed) {
            message = JSON.parse(message);
            console.log(message.text);
        }

        redisClient.releaseLock(message, lockId);
    } catch (e) {
        console.log(e);
    }
}

const scheduleMessage = async (time, text) => {
    let message = JSON.stringify({'time': time, 'text': text});

    let isScheduled = await redisClient.async.zadd(config.redis.queueName, time, message);

    if (isScheduled !== 1)
        throw new Error('Message already exists');
}

module.exports = {
    processQueue,
    scheduleMessage
}