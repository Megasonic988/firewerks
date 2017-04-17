const server = require('../server/app.js');
const io = require('socket.io-client');
let socket = io('http://localhost:8080');

describe('Socket connection', function() {

  it('server has one player connected', function(done) {
    socket.on('connect', function() {
      expect(server.players.length).toEqual(1);
      done();
    });
  });
});
