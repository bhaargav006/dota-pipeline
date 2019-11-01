const faunadb = require('faunadb')
const moment = require('moment')

q = faunadb.query;
DATABASE_URL = '54.245.218.63'

console.log('Node.js code is now running!')
var client = new faunadb.Client({ secret: 'secret', domain: DATABASE_URL, scheme: 'http', port: '8443', timeout: 500});

// // Introduction to FQL - Get Match Data
// var startTime = Date.now()
// client.query(
//     q.Get(
//         q.Ref(
//             q.Collection('matches'), 
//             '4931268777'
//         )
//     )
// ).then(
//     (ret) => console.log('Match Data: ', ret['data']),
//     (err) => console.log(err)
// )

// Easy Business Question 1 - Max match duraion
client.query(
    q.Get(
        q.Ref(
            q.Collection('match_aggregate_info'),
            1911
        )
    )
).then(
    (ret) => console.log('Max game duration: ' + (ret.data.data / 60).toFixed(2) + ' minutes'),
    (err) => console.log(err)
)

// Easy Business Question 2 - Mean match duration
client.query(
    q.Get(
        q.Ref(
            q.Collection('match_aggregate_info'),
            2002
        )
    )
).then(
    (ret) => console.log('Mean game duration: ' + (ret.data.data / 60).toFixed(2) + ' minutes'),
    (err) => console.log(err)
)

// Easy Business Question 3 - Mean First Blood time
client.query(
    q.Get(
        q.Ref(
            q.Collection('match_aggregate_info'),
            2114
        )
    )
).then(
    (ret) => console.log('Mean FB Time: ' + (ret.data.data / 60).toFixed(2) + ' minutes'),
    (err) => console.log(err)
)

// Easy Business Question 4 - Has a match been abandoned
var match_id_to_check = 4929685690
client.query(
    q.Get(
        q.Ref(
            q.Collection('matches'),
            match_id_to_check
        )
    )
).then(
    (ret) => console.log('Is match abandoned: ' + ret.data.abandoned_status),
    (err) => console.log(err)
)

// Easy Business Question 5 - Number of matches played with a time frame - Last 4 months
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

// Extra Easy Business Question - Min match duraion
client.query(
    q.Get(
        q.Ref(
            q.Collection('match_aggregate_info'),
            1909
        )
    )
).then(
    (ret) => console.log('Min game duration: ' + (ret.data.data / 60).toFixed(2) + ' minutes'),
    (err) => console.log(err)
)

// Medium Business Question 1 - Number of games played of a hero over a given time - Last 5 months
var today = moment().utc().format('YYYY-MM-DDTHH:mm:ssZ');
var beforeFourMonths = moment().subtract(5, 'months').utc().format('YYYY-MM-DDTHH:mm:ssZ');
var hero_id_to_check = 47
client.query(
    q.Count(
        q.Range(
            q.Union(
                q.Match(
                    q.Index("heroes_temporal_winrate"),
                    hero_id_to_check,
                    true
                ),
                q.Match(
                    q.Index("heroes_temporal_winrate"),
                    hero_id_to_check,
                    false
                )
            ), 
            q.Time(beforeFourMonths), 
            q.Time(today)
        )
    )
).then(
    (ret) => console.log('Number of games played: ', ret),
    (err) => console.log(err)
)

// Medium Business Question 2 - Win rate of a hero over a given time - Last 5 months
var today = moment().utc().format('YYYY-MM-DDTHH:mm:ssZ');
var beforeFourMonths = moment().subtract(5, 'months').utc().format('YYYY-MM-DDTHH:mm:ssZ');
var hero_id_to_check = 47
client.query(
    q.Count(
        q.Range(
            q.Match(
                q.Index("heroes_temporal_winrate"),
                hero_id_to_check,
                true
            ), 
            q.Time(beforeFourMonths), 
            q.Time(today)
        )
    )
).then(
    (ret) => {
        num_of_wins = ret

        client.query(
            q.Count(
                q.Range(
                    q.Union(
                        q.Match(
                            q.Index("heroes_temporal_winrate"),
                            hero_id_to_check,
                            true
                        ),
                        q.Match(
                            q.Index("heroes_temporal_winrate"),
                            hero_id_to_check,
                            false
                        )
                    ), 
                    q.Time(beforeFourMonths), 
                    q.Time(today)
                )
            )
        ).then(
            (ret) => console.log('Win Rate: ', ((num_of_wins/ret).toFixed(4) * 100) ),
            (err) => console.log(err)
        )
    },
    (err) => console.log(err)
)

// Medium Business Questin 3 - Overall win-rate of a hero
var hero_id_to_check = 47
client.query(
    q.Get(
        q.Ref(
            q.Collection('heroes'),
            hero_id_to_check
        )
    )
).then(
    (ret) => console.log('Overall win-rate of a hero: ', ((ret.data.wins / ret.data.games).toFixed(4) * 100) ),
    (err) => console.log(err)
)

// Medium Business Question 4 - Preferred Items for a Hero
var hero_id_to_check = 47
var top_how_many = 2

client.query(
    q.Get(
        q.Ref(
            q.Collection('heroes'),
            hero_id_to_check
        )
    )
).then(
    (ret) => {
        item_data = ret['data']['items']
        item_list = []

        for (var i = 1; i<item_data.length; i++) {
            item_dict = {}

            item_dict.item_id = i
            item_dict.item_count = item_data[i]

            item_list.push(item_dict)
        }

        item_list.sort(function(x, y) {
            if (x.item_count > y.item_count) {
                return -1;
            }
            if (x.item_count < y.item_count) {
                return 1;
        }
            return 0;
        })

        console.log('Top Item Preferrences: ', item_list.slice(0, top_how_many))
    },
    (err) => console.log(err)
)

// Best Hero Pairs
var hero_id_to_check = 47
var top_how_many = 2
key_list = []
id_list = []

for (var i = 1; i<hero_id_to_check; i++) {
    key = ('000' + i).substr(-3) + ('000' + hero_id_to_check).substr(-3)
    key_list.push(key)
    id_list.push(i)
}

for (var k = hero_id_to_check + 1; k < 130; k++) {
    key = ('000' + hero_id_to_check).substr(-3) + ('000' + k).substr(-3)
    key_list.push(key)
    id_list.push(k)
}

client.query(
    q.Map(
        key_list,
        q.Lambda(
            'hero_pair',
            q.Get(
                q.Ref(
                    q.Collection('hero_pairs'), 
                    q.Var('hero_pair')
                )
            )
        )
    )
).then(
    (res) => {
        hero_data_list = res
        hero_team_list = []

        for (var i = 0; i < hero_data_list.length; i++) {
            hero_team_dictionary = {} 
            hero_team_dictionary.partner_id = id_list[i]

            if (hero_data_list[i]['data']['games'] > 0) {
                hero_team_dictionary['win_rate'] = (hero_data_list[i]['data']['wins'] / hero_data_list[i]['data']['games']).toFixed(4)
            } else {
                hero_team_dictionary['win_rate'] = '0.0000'
            }
            hero_team_list.push(hero_team_dictionary)
        }

        hero_team_list.sort(function(x, y) {
            if (x.win_rate > y.win_rate) {
                return -1;
            }
            if (x.win_rate < y.win_rate) {
                return 1;
            }
            return 0;
        })
        console.log(hero_team_list.splice(0, top_how_many))
    },
    (err) => console.log(err)
)

// // Count of records
// var startTime = Date.now()
// client.query(
//     q.Count(
//         q.Match(
//             q.Index('all_matches_raw')
//         )
//     )
// ).then(
//     (ret) => console.log('Number of matches in DB: ' + ret + ' and time to fetch: ' + (Date.now() - startTime) + 'ms at ' + new Date().toISOString()),
//     (err) => console.log(err)
// )