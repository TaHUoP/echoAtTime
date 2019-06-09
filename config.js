const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    port: process.env.NODE_PORT,
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        pollingDelayMs: process.env.REDIS_POLLING_DELAY_MS,
        queueName: 'scheduled',
    }
}