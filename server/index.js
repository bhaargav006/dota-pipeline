import { data_processed_per_second, total_match_count } from './src/real_time_data'

const express = require('express');
const faunadb = require('faunadb');
const moment = require('moment');
const winston = require('winston');
const uuidv1 = require('uuid/v1');

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

app.listen(PORT, function() {
  console.log('Server is running on PORT:',PORT);
});