export function get_int_value_from_key(key) {
  let sum = 0;
  for (let i=0; i<key.length;i++) {
    sum += key.charCodeAt(i)
  }
  return sum;
}
