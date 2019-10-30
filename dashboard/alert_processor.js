const faunadb = require('faunadb');
const request = require('request');
const fs = require('fs')

var q = faunadb.query;
var DATABASE_URL = '54.245.218.63'
var client = new faunadb.Client({ secret: 'secret', domain: DATABASE_URL, scheme: 'http', port: '8443'});

request('http://' + DATABASE_URL + ':8443/ping', { json: true }, (err, res, body) => {
    if ('Scope write is OK' != body.resource) {
        fs.writeFile('/home/ec2-user/dota-pipeline/log/dbDownError.txt', 'true', (err) => console.log(err))
    } else {
        fs.writeFile('/home/ec2-user/dota-pipeline/log/dbDownError.txt', 'false', (err) => console.log(err))
    }
});

var total = 0;
client.query(
    q.Reduce(
        q.Lambda(
            (acc, value) => q.Add(acc, q.ToNumber(q.SubString(value, 8)))
        ),
        0,
        q.Match(
            q.Index('matches_raw_prov_api_duration')
        )
    )
).then(
    (ret) => {
        total = ret;
        client.query(
            q.Count(
                q.Match(
                    q.Index('all_matches_raw')
                )
            )
        ).then(
            (ret) => {
                average = Math.ceil(total/ret)
                
                if (average > 500000) {
                    fs.writeFile('/home/ec2-user/dota-pipeline/log/provenanceError.txt', 'true', (err) => console.log(err))
                } else {
                    fs.writeFile('/home/ec2-user/dota-pipeline/log/provenanceError.txt', 'false', (err) => console.log(err))
                }
            },
            (err) => console.log(err)
        )
    },
    (err) => console.log(err)
)

// echo "FaunaDB failed to respond to the HealthCheck ping at `date`" | mailx -v -s "FaunaDB is DOWN" suresh.siddharth@gmail.com srira048@umn.edu prabhjotsinghrai1@gmail.com mishr167@umn.edu
// echo "Steam APIs are showing higher response time than normal" | mailx -s "Urgent: Steam API response time spike\!" suresh.siddharth@gmail.com srira048@umn.edu prabhjotsinghrai1@gmail.com mishr167@umn.edu