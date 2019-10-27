var faunadb = require('faunadb'),
q = faunadb.query;

DATABASE_URL = '54.245.218.63'

console.log('Node.js code is now running!')
var client = new faunadb.Client({ secret: 'secret', domain: DATABASE_URL, scheme: 'http', port: '8443'});

<<<<<<< HEAD
// ## WIP
// var startTime = Date.now()
// client.query(q.Max(q.Match(q.Index('matches_duration')))).then((ret) => console.log(ret))

// Query Match Duration
var startTime = Date.now()
client.query(
    q.Get(
        q.Ref(
            q.Collection('matches'), 
            '4931268777'
        )
    )
).then(
    (ret) => console.log('Match Duration: ' + ret['data']['result']['duration'] + ' and time to fetch: ' + (Date.now() - startTime) + 'ms')
)

// Mean match duraion
=======
// ## Create index for duration of matches
// client.query(
//     q.CreateIndex(
//         {
//             name: 'matches_raw_duration', 
//             source: q.Collection('matches_raw'), 
//             terms: [], 
//             values: [{ field: ['data', 'result', 'duration'] }]
//         }
//     )
// ).then(
//     (ret) => console.log(ret)
// )

// ## Create index for provenance of api_call_type
client.query(
    q.CreateIndex(
        {
            name: 'matches_raw_prov_api_duration', 
            source: q.Collection('matches_raw'), 
            terms: [], 
            values: [{ field: ['data', 'provenance', 'dataFetchStage', 'apiCallDuration'] }]
        }
    )
).then(
    (ret) => console.log(ret),
    (err) => console.log(err)
)

// ## Create index for average first blood
// client.query(
//     q.CreateIndex(
//         {
//             name: 'matches_raw_fb_time', 
//             source: q.Collection('matches_raw'), 
//             terms: [], 
//             values: [{ field: ['data', 'results', 'first_blood_time'] }]
//         }
//     )
// ).then(
//     (ret) => console.log(ret),
//     (err) => console.log(err)
// )

// ## Raw Data Count index
// client.query(
//     q.CreateIndex({
//         name: 'all_raw_matches',
//         source: q.Collection('matches_raw')
//     })
// ).then((ret) => console.log(ret))

// ## Query Match Duration
// var startTime = Date.now()
// client.query(
//     q.Get(
//         q.Ref(
//             q.Collection('matches'), 
//             '4931268777'
//         )
//     )
// ).then(
    // (ret) => console.log('Match Duration: ' + ret['data']['result']['duration'] + ' and time to fetch: ' + (Date.now() - startTime) + 'ms')
// )

// ## WIP
// var startTime = Date.now()
// client.query(q.Max(q.Match(q.Index('matches_duration')))).then((ret) => console.log(ret))

// ## Mean match duraion
>>>>>>> Adds alert processor and extra keys
client.query(
    q.Mean(
        q.Match(
            q.Index('matches_raw_duration')
        )
    )
).then(
    (ret) => console.log('Mean game duration: ' + (ret / 60).toFixed(2) + ' minutes')
)

<<<<<<< HEAD
// Max match duraion
=======
// ## Max match duraion
>>>>>>> Adds alert processor and extra keys
client.query(
    q.Max(
        q.Match(
            q.Index('matches_raw_duration')
        )
    )
).then(
    (ret) => console.log('Max game duration: ' + (ret / 60).toFixed(2) + ' minutes')
)

<<<<<<< HEAD
// Max match duraion
=======
// ## Max match duraion
>>>>>>> Adds alert processor and extra keys
client.query(
    q.Min(
        q.Match(
            q.Index('matches_raw_duration')
        )
    )
).then(
    (ret) => console.log('Min game duration: ' + (ret / 60).toFixed(2) + ' minutes')
)

<<<<<<< HEAD
// Mean First Blood time
=======
// ## Mean First Blood time
>>>>>>> Adds alert processor and extra keys
client.query(
    q.Mean(
        q.Match(
            q.Index('matches_raw_fb_time')
        )
    )
).then(
    (ret) => console.log('Mean FB Time: ' + (ret / 60).toFixed(2) + ' minutes')
)

<<<<<<< HEAD
// Count of records
=======
// client.query(
//     q.Paginate(
//         q.Match(
//             q.Index('matches_duration')
//         )    
//     )
// )
// .then((ret) => console.log(ret))

// ## Count of records
>>>>>>> Adds alert processor and extra keys
var startTime = Date.now()
client.query(
    q.Count(
        q.Match(
            q.Index('all_matches_raw')
        )
    )
).then(
    (ret) => console.log('Number of matches in DB: ' + ret + ' and time to fetch: ' + (Date.now() - startTime) + 'ms at ' + new Date().toISOString()),
    (err) => console.log(err)
<<<<<<< HEAD
)
=======
)
>>>>>>> Adds alert processor and extra keys
