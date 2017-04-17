const io = require('socket.io-client');
const socket = io();
const PIXI = require('pixi.js');

const stage = new PIXI.Container();
const renderer = PIXI.autoDetectRenderer(512, 512);
document.body.appendChild(renderer.view);

let playerId;
let time = new Date();

function drawPlayer(x, y) {
  let p = new PIXI.Graphics();
  p.beginFill(0xd77466);
  p.drawCircle(0, 0, 32);
  p.endFill();
  p.x = x;
  p.y = y;
  return p;
}

socket.on('connect', function() {
  playerId = socket.id;
  console.log("Connected with player ID: " + socket.id);
});

socket.on('gameState', function(gameState) {
  requestAnimationFrame(function() {
    renderGame(gameState);
  });
  socket.emit('input', renderer.plugins.interaction.mouse.global);
});

function renderGame(gameState) {
  stage.removeChildren();
  gameState.players.forEach(p => {
    stage.addChild(drawPlayer(p.position.x, p.position.y));
  });
  const newTime = new Date();
  const delta_t = newTime - time;
  time = newTime;
  renderer.render(stage);
}
