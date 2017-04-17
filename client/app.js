const io = require('socket.io-client');
const socket = io();
const PIXI = require('pixi.js');

const stage = new PIXI.Container();
const renderer = PIXI.autoDetectRenderer(512, 512);
document.body.appendChild(renderer.view);

let player;

function drawPlayer(x, y) {
  let p = new PIXI.Graphics();
  p.beginFill(0xd77466);
  p.drawCircle(0, 0, 32);
  p.endFill();
  p.x = x;
  p.y = y;
  return p;
}

function setup() {

  player = drawPlayer(256, 256);
  stage.addChild(player);

  gameLoop();
}

function gameLoop() {
  requestAnimationFrame(gameLoop);

  renderer.render(stage);
}

setup();
