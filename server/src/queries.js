import { Client, query } from "faunadb"
import { DATABASE_URL } from './constants'
import { get_int_value_from_key } from './library'

const client = new Client({ secret: 'secret', domain: DATABASE_URL, scheme: 'http', port: '8443'});

export const get_total_match_count = () => {
  return new Promise((resolve, reject) => {
    client.query(
      query.Get(
        query.Ref(
          query.Collection('match_aggregate_info'),
          get_int_value_from_key('match_count')
        )
      )
    ).then(
      (response) => {
        resolve(resolve(response['data']['data']))
      }
    ).catch(reject)
  })
}

export const get_data_processed_per_second = (previous_match_count) => {
  if (previous_match_count !== null && previous_match_count !== undefined) {
    return new Promise((resolve, reject) => {
      get_total_match_count().then(count => resolve(count - previous_match_count)).catch(reject)
    })
  } else {
    return new Promise(((resolve, reject) => {
      get_total_match_count().then(count => get_data_processed_per_second(count).then(resolve).catch(reject))
    }))
  }
}

export const get_mean_match_duration = () => new Promise((resolve, reject) => {
  client.query(
    query.Get(
      query.Ref(
        query.Collection('match_aggregate_info'),
        2002
      )
    )
  ).then(
    (ret) => resolve((ret.data.data / 60).toFixed(2)),
    reject
  )
})

export const get_max_match_duration = () => new Promise((resolve, reject) => {
  client.query(
    query.Get(
      query.Ref(
        query.Collection('match_aggregate_info'),
        1911
      )
    )
  ).then(
    (ret) => resolve((ret.data.data / 60).toFixed(2)),
    reject
  )
})