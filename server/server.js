import { data_processed_per_second, fetch_per_second_processes } from './src/real_time_data'

const express = require('express');
const faunadb = require('faunadb');
const moment = require('moment');
const winston = require('winston');
const uuidv1 = require('uuid/v1');
const Pusher = require('pusher');

// initialise the logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

const app = express();

const PORT = 4000 || process.env.SERVER_PORT

// Declare variables

const channels_client = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  encrypted: true
});


// Per second jobs are added here
setTimeout(function () {
  fetch_per_second_processes();
}, 1000)


app.get('/', function(req, res) {
  channels_client.trigger('my-channel', 'my-event', {
    "message": data_processed_per_second
  });
  res.status(200).send('Message Sent!');
});

app.listen(PORT, function() {
  console.log('Server is running on PORT:',PORT);
});