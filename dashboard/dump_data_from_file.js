const readline = require('readline');
const fs = require('fs');
const lineReader = require('line-reader');

var faunadb = require('faunadb');
q = faunadb.query;

DATABASE_URL = '54.245.218.63'

console.log('Node.js code is now running!')
var client = new faunadb.Client({ secret: 'secret', domain: DATABASE_URL, scheme: 'http', port: '8443'});

/*
client.query(
    q.CreateCollection({ name: 'matches_raw' })
).then((ret) => console.log(ret))

client.query(
    q.CreateIndex({
        name: 'all_raw_matches',
        source: q.Collection('matches_raw')
    })
).then((ret) => console.log(ret))
*/

var stream = fs.createWriteStream("error.txt", {flags:'a'});
var procesed = 0
var attempted = 0
var success = 0 
var failure = 0

lineReader.eachLine('match_details.log', function(line) {

    procesed = procesed + 1

    line = line.replace(/'/g, '"')
    line = line.replace(/True/g, 'true')
    line = line.replace(/False/g, 'false')

    jsonLine = {}

    if (isJson(line)) {
        jsonLine = JSON.parse(line)

        attempted = attempted + 1

        console.log('Writing match to database: ' + jsonLine.result.match_id)
        client.query(
            q.Create(
                q.Ref(
                    q.Collection('matches_raw'), jsonLine.result.match_id
                ),
                { data: jsonLine}
            )
        ).then(
            function(ret) {
                success = success + 1
                console.log('Match written to database: ' + ret.ref)
                console.log('Processed: ' + procesed + ', Attempted: ' + attempted + ', Success: ' + success + ', Failure: ' + failure)
            },
            function(err) {
                failure = failure + 1
                stream.write(jsonLine.result.match_id + "\n")
                console.log('Processed: ' + procesed + ', Attempted: ' + attempted + ', Success: ' + success + ', Failure: ' + failure)
            }
        )
    } else {
        console.log('Error: ' + line)
    }
    
})

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}