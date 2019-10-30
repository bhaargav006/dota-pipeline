const faunadb = require('faunadb')
const moment = require('moment')

q = faunadb.query;
DATABASE_URL = '54.245.218.63'

console.log('Node.js code is now running!')
var client = new faunadb.Client({ secret: 'secret', domain: DATABASE_URL, scheme: 'http', port: '8443'});

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

// Mean match duration
client.query(
    q.Mean(
        q.Match(
            q.Index('matches_raw_duration')
        )
    )
).then(
    (ret) => console.log('Mean game duration: ' + (ret / 60).toFixed(2) + ' minutes')
)

// Max match duraion
client.query(
    q.Max(
        q.Match(
            q.Index('matches_raw_duration')
        )
    )
).then(
    (ret) => console.log('Max game duration: ' + (ret / 60).toFixed(2) + ' minutes')
)

// Min match duraion
client.query(
    q.Min(
        q.Match(
            q.Index('matches_raw_duration')
        )
    )
).then(
    (ret) => console.log('Min game duration: ' + (ret / 60).toFixed(2) + ' minutes')
)

// Mean First Blood time
client.query(
    q.Mean(
        q.Match(
            q.Index('matches_raw_fb_time')
        )
    )
).then(
    (ret) => console.log('Mean FB Time: ' + (ret / 60).toFixed(2) + ' minutes')
)

// Number of matches in the last 4 months
var today = moment().utc().format('YYYY-MM-DDTHH:mm:ssZ');
var beforeFourMonths = moment().subtract(4, 'months').utc().format('YYYY-MM-DDTHH:mm:ssZ');

client.query(
    q.Count(
        q.Range(
            q.Match(
                q.Index("match_by_ts")
            ), 
            q.Time(beforeFourMonths), 
            q.Time(today)
        )
    )
).then(
    (ret) => console.log('Number of matches in the last 4 months: ' + ret),
    (err) => console.log(err)
)

// Number of wins in the last 4 months for one hero
var today = moment().utc().format('YYYY-MM-DDTHH:mm:ssZ');
var beforeFourMonths = moment().subtract(5, 'months').utc().format('YYYY-MM-DDTHH:mm:ssZ');

client.query(
    q.Count(
        q.Range(
            q.Match(
                q.Index("heroes_temporal_winrate"),
                47,
                true
            ), 
            q.Time(beforeFourMonths), 
            q.Time(today)
        )
    )
).then(
    (ret) => console.log('Number of wins in the last 4 months for one hero: ', ret),
    (err) => console.log(err)
)

// Number of games played in the last 4 months for one hero
var today = moment().utc().format('YYYY-MM-DDTHH:mm:ssZ');
var beforeFourMonths = moment().subtract(5, 'months').utc().format('YYYY-MM-DDTHH:mm:ssZ');
client.query(
    q.Count(
        q.Range(
            q.Union(
                q.Match(
                    q.Index("heroes_temporal_winrate"),
                    47,
                    true
                ),
                q.Match(
                    q.Index("heroes_temporal_winrate"),
                    47,
                    false
                )
            ), 
            q.Time(beforeFourMonths), 
            q.Time(today)
        )
    )
).then(
    (ret) => console.log('Number of games played in the last 4 months for one hero ', ret),
    (err) => console.log(err)
)

// Overall win-rate of a hero
client.query(
    q.Get(
        g.Ref(
            q.Collection('heroes'),
            '47'
        )
    )
).then(
    (ret) => console.log('Overall win-rate of a hero: ', ret),
    (err) => console.log(err)
)

// Count of records
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
)
