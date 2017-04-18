const io = require('socket.io-client');
const socket = io();
const PIXI = require('pixi.js');

const stage = new PIXI.Container();
const renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.view);

let playerId;
let time = new Date();

function drawPlayer(x, y, color) {
  let p = new PIXI.Graphics();
  color = color || 0xf47038;
  p.beginFill(color);
  p.drawCircle(0, 0, 26);
  p.endFill();
  p.x = x;
  p.y = y;
  return p;
}

function drawProjectile(x, y, color) {
  let p = new PIXI.Graphics();
  color = color || 0xf47038;
  p.beginFill(color);
  p.drawRect(0, 0, 10, 10);
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
  socket.emit('mousePosition', renderer.plugins.interaction.mouse.global);
});

socket.on('lose', function() {
  showLoseMessage();

  setTimeout(function() {
    location.reload();
  }, 3000);
});

function showLoseMessage() {
  requestAnimationFrame(showLoseMessage);
  stage.removeChildren();
  const message = new PIXI.Text(
    "You Lose!",
    {fontFamily: "Arial", fontSize: 32, fill: "white"}
  );
  message.anchor.set(0.5, 0.5);
  message.position.set(window.innerWidth / 2, window.innerHeight / 2);
  stage.addChild(message);
  renderer.render(stage);
}

function renderGame(gameState) {
  stage.removeChildren();
  gameState.players.forEach(p => {
    stage.addChild(drawPlayer(p.position.x, p.position.y, p.id === playerId ? 0xFFFFFF : null));
  });
  gameState.projectiles.forEach(p => {
    stage.addChild(drawProjectile(p.position.x, p.position.y, p.shooterId === playerId ? 0xFFFFFF : null));
  });
  const newTime = new Date();
  const delta_t = newTime - time;
  time = newTime;
  renderer.render(stage);
}

function handleMouseDown() {
  socket.emit('mouseDown', true);
}

function handleMouseUp() {
  socket.emit('mouseDown', false);
}

document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mouseup', handleMouseUp);
