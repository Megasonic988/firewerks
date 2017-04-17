const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let idCount = 0;

const GameState = {
	players: [],
	projectiles: []
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
			this.lastPlayerInput = input;
		});
	}

	handlePlayerInput() {

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
	GameState.players = GameState.players.filter(p => p.connected);
	GameState.players.forEach(function(p) {
		p.socket.emit('gameState', formatGameState());
		p.handlePlayerInput();
	});
}, 33);

http.listen(8080, function() {
	console.log("Server listening on port 8080.");
});

module.exports = GameState;
