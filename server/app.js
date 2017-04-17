const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let idCount = 0;
let time = new Date();

const GameState = {
	players: [],
	projectiles: [],
  mapSize: [512, 512]
};

class Vector {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}
}

class Player {
	constructor(id, socket) {
		this.id = id;
		this.socket = socket;
		this.connected = true;
		this.position = new Vector();
		this.playerInput;
		this.lastFiredProjectileTime;

		socket.on('disconnect', () => {
			this.connected = false;
		});

		socket.on('input', input => {
			this.playerInput = input;
		});
	}

	handlePlayerInput() {
    this.position.x = this.playerInput.x;
    this.position.y = this.playerInput.y;
	}
}

class Projectile {
	constructor(x, y, vx, vy) {
		this.position = new Vector(x, y);
		this.velocity = new Vector(vx, vy);
	}
}

io.on('connection', function(socket) {
	GameState.players.push(new Player(socket.id, socket));
	idCount += 1;
});

app.use(express.static(__dirname + '/../client'));

function formatGameState() {
	return {
		players: GameState.players.map(p => {
      return {
				id: p.id,
				position: p.position
			};
    }),
		projectiles: GameState.projectiles.map(p => {
      return {
				position: p.position
			};
    })
	};
}

setInterval(function() {
  let newTime = new Date();
  const delta_t = newTime - time;
  time = newTime;
	GameState.players = GameState.players.filter(p => p.connected);
	GameState.players.forEach(function(p) {
		p.socket.emit('gameState', formatGameState());
		if (p.playerInput) p.handlePlayerInput();
	});
}, 20);

http.listen(8080, function() {
	console.log("Server listening on port 8080.");
});

module.exports = GameState;
