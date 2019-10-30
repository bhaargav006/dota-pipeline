import { data_processed_per_second, fetch_per_second_processes, total_match_count } from './src/real_time_data'

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

const PORT = 4000

// Declare variables

const channels_client = new Pusher({
  appId: '889880',
  key: 'd548e35711c3a1082e31',
  secret: '1e3ba2961897e1e2255e',
  cluster: 'us2',
  encrypted: true
});


app.get('/', function(req, res) {
  setInterval(() => {
    channels_client.trigger('my-channel', 'my-event', {
      "match_count": total_match_count,
      "data_processed_per_second": data_processed_per_second
    });
  }, 1000)
  res.status(200).send('Real time event started!');
});

app.listen(PORT, function() {
  console.log('Server is running on PORT:',PORT);
});