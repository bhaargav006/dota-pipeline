import { get_total_match_count } from './queries'
import moment from 'moment'

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

export function fetch_match_count() {
  get_total_match_count().then(count => {
    previous_match_count = total_match_count;
    total_match_count = count;
    calculate_data_processed_per_second();
  });
}
// Per second jobs are added here
setInterval(function () {
  console.log('running per second jobs')
  fetch_match_count();
}, 1000)