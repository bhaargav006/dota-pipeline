export const data_processed_per_second = [];

export function fetch_per_second_processes() {
  if (data_processed_per_second.length === 10) {
    data_processed_per_second.shift()
  }
  const data_processed = Math.random();
  data_processed_per_second.push(data_processed);
}