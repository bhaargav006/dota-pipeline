import { get_max_match_duration, get_mean_match_duration, get_total_match_count } from './queries'
import moment from 'moment'
const Pusher = require('pusher');

export const data_processed_per_second = [];
export let total_match_count = 0;
let previous_match_count = 0;

export function calculate_data_processed_per_second() {
  if (data_processed_per_second.length === 10) {
    data_processed_per_second.shift()
  }
  if (previous_match_count !== 0) {
    const data_processed = total_match_count - previous_match_count;
    data_processed_per_second.push({ processed: data_processed, time: moment().format()});
  }
}

const channels_client = new Pusher({
  appId: '889880',
  key: 'd548e35711c3a1082e31',
  secret: '1e3ba2961897e1e2255e',
  cluster: 'us2',
  encrypted: true
});


export function send_match_count() {
  get_total_match_count().then(count => {
    previous_match_count = total_match_count;
    total_match_count = count;
    calculate_data_processed_per_second();
    channels_client.trigger('my-channel', 'per-second-job', {
      "match_count": total_match_count,
      "data_processed_per_second": data_processed_per_second
    });
  });
}

export function send_max_and_mean_durations() {
  get_max_match_duration().then(max_match_duration => {
    get_mean_match_duration().then(mean_match_duration => {
      channels_client.trigger('my-channel', 'per-five-second-job', {
        "max_match_duration": max_match_duration,
        "mean_match_duration": mean_match_duration
      });
    })
  })
}

// Per second jobs are added here
setInterval(function () {
  console.log('running per second jobs')
  send_match_count();
}, 1000)

// Per 5 second jobs are added here
setInterval(function () {
  console.log('running per 5 second jobs')
  send_max_and_mean_durations();
}, 5000)