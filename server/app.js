var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/../client'));

io.on('connection', function(client) {
  console.log('a user has connected!');
  client.on('disconnect', {
    console.log('a user has disconnected!');
  });
});

http.listen(8080, function() {
  console.log('listening on port 8080');
});
