const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 8080;

let idCount = 0;
let time = new Date();

const GameState = {
  players: [],
  projectiles: [],
  mapSize: {
    x: 2000,
    y: 1200,
  }
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
    this.position = new Vector(Math.random() * 512, Math.random() * 512);
		this.maxVelocity = 300;
    this.mousePosition;
    this.mouseDown = false;
    this.lastFiredProjectileTime = new Date();

    socket.on('disconnect', () => {
      this.connected = false;
    });

    socket.on('mousePosition', mousePosition => {
      this.mousePosition = mousePosition;
    });

    socket.on('mouseDown', mouseDown => {
      this.mouseDown = mouseDown;
			const currentTime = new Date();
			if (currentTime - this.lastFiredProjectileTime > 700) {
				const delta_x = this.mousePosition.x - this.position.x;
		    const delta_y = this.mousePosition.y - this.position.y;
				const magnitude = Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));
				const vx = (delta_x / magnitude) * 1200;
				const vy = (delta_y / magnitude) * 1200;
				this.fireProjectile(this.position.x, this.position.y, vx, vy);
				this.lastFiredProjectileTime = currentTime;
			}
    });
  }

  handlePlayerInput(delta_t) {
		const currentTime = new Date();
		if (currentTime - this.lastFiredProjectileTime < 400) return;
    const delta_x = this.mousePosition.x - this.position.x;
    const delta_y = this.mousePosition.y - this.position.y;
		if (Math.abs(delta_x) < 3 && Math.abs(delta_y) < 3) return;
		const magnitude = Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));
		this.position.x += (delta_x / magnitude) * this.maxVelocity * delta_t;
		this.position.y += (delta_y / magnitude) * this.maxVelocity * delta_t;
  }

  fireProjectile(x, y, vx, vy) {
    GameState.projectiles.push(new Projectile(this.id, x, y, vx, vy));
  }
}

class Projectile {
  constructor(shooterId, x, y, vx, vy) {
		this.shooterId = shooterId;
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
				shooterId: p.shooterId,
				position: p.position
			};
    })
  };
}

setInterval(function() {
  let newTime = new Date();
  const delta_t = (newTime - time) / 1000;
  time = newTime;

  GameState.players = GameState.players.filter(p => p.connected);

  GameState.projectiles = GameState.projectiles.filter(p => {
    return (0 < p.position.x && p.position.x < GameState.mapSize.x) &&
		(0 < p.position.y && p.position.y < GameState.mapSize.y);
  });

  GameState.players.forEach(function(p) {
    p.socket.emit('gameState', formatGameState());
    if (p.mousePosition) p.handlePlayerInput(delta_t);
		if (p.position.x < 0) p.position.x = 0;
		if (p.position.x > 2000) p.position.x = 2000;
		if (p.position.y < 0) p.position.y = 0;
		if (p.position.y > 1200) p.position.y = 1200;
  });

	GameState.projectiles.forEach(function(p) {
		p.position.x += p.velocity.x * delta_t;
		p.position.y += p.velocity.y * delta_t;
		GameState.players.forEach(player => {
			if (collision(player, p)) {
				player.socket.emit('lose');
				player.connected = false;
			}
		});
	});
}, 20);

function collision(player, projectile) {
	if (projectile.shooterId === player.id) return false;
	const delta_x = Math.abs(projectile.position.x + 5 - player.position.x);
	const delta_y = Math.abs(projectile.position.y + 5 - player.position.y);
	return (delta_x <= 26) && (delta_y <= 26);
}

http.listen(port, function() {
  console.log("Server listening on port 8080.");
});

module.exports = GameState;
