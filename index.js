const express = require('express');
const async = require('async');
const config = require('./config');
const scheduler = require('./scheduler');
const utils = require('./utils');
const app = express();

async.forever(async () => {
    await scheduler.processQueue();
    await utils.sleep(config.redis.pollingDelayMs);
});

app.use(express.urlencoded());
app.use(express.json());

app.post('/echoAtTime', async (req, res) => {
    let time = parseInt(req.body.time);

    if (isNaN(time)) {
        res.status(400).send('Bad time');
        return;
    }

    if (!req.body.text) {
        res.status(400).send('Bad text');
        return;
    }

    try {
        await scheduler.scheduleMessage(time, req.body.text);
        res.send('Scheduled');
    } catch (e) {
        res.status(500).send('Error occurred');
    }
});

app.listen(config.port, () => {
    console.log(`EchoAtTime server listening on port ${config.port}`);
});