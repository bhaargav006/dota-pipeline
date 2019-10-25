var faunadb = require('faunadb'),
q = faunadb.query;

DATABASE_URL = 'ec2-52-32-20-76.us-west-2.compute.amazonaws.com'

console.log('Node.js code is now running!')
var client = new faunadb.Client({ secret: 'secret', domain: DATABASE_URL, scheme: 'http', port: '8443'});

client.query(q.Get(q.Ref(q.Collection('matches'), '4931268777'))).then((ret) => console.log('Able to query: ' + ret['data']['result']['match_id']))

client.query(q.Count(q.Match(q.Index('all_matches')))).then((ret) => console.log('Number of matches in DB: ' + ret))