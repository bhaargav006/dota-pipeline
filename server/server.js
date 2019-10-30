var express = require('express');

var app = express();

var PORT = 4000;

var Pusher = require('pusher');

var channels_client = new Pusher({
  appId: '889880',
  key: 'd548e35711c3a1082e31',
  secret: '1e3ba2961897e1e2255e',
  cluster: 'us2',
  encrypted: true
});

app.get('/', function(req, res) {
  channels_client.trigger('my-channel', 'my-event', {
    "message": "hello world"
  });
  res.status(200).send('Message Sent!');
});

app.listen(PORT, function() {
  console.log('Server is running on PORT:',PORT);
});