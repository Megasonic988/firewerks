const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const players = [];
let idCount = 0;

class Player {
  constructor(id, socket) {
    this.id = id;
    this.socket = socket;
    this.connected = true;

    socket.on('disconnect', () => {
      this.connected = false;
    });
  }
}

io.on('connection', function(socket) {
  players.push(new Player(idCount, socket));
  idCount += 1;
});

app.use(express.static(__dirname + '/../client'));

http.listen(8080, function() {
  console.log("Server listening on port 8080.");
});

module.exports = {
  players: players
};
