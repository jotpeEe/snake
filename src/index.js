/* eslint-disable no-use-before-define */
import Victor from 'victor';
import './style.css';

import { Entity, loadLevel } from './components/LevelGen';
import MENU from './components/Menu';
import LEVELS from './components/levels';
import { drawLevel, drawSingleEntity } from './components/gfx';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function random(from, to) {
  return Math.floor(Math.random() * (Math.floor(to) - Math.ceil(from)) + Math.ceil(from));
}

let endscore = 0;
let currentLevel = random(0, 4);
let level = loadLevel(LEVELS[currentLevel]);
const menu = loadLevel(MENU[0]);
const menu2 = loadLevel(MENU[1]);
const gameOver = loadLevel(MENU[2]);
let activeView = menu;
let { width } = activeView;
let { height } = activeView;

function updateCanvasSize(active) {
  canvas.width = active.width * 10;
  canvas.height = active.height * 10 + 40;
  width = activeView.width;
  height = activeView.height;
}

function setActiveView(view) {
  activeView = view;
}

updateCanvasSize(activeView);

const ENTITY_TYPE = {
  EMPTY: '_',
  GREEN: 'G',
  BROWN: 'B',
  WALL: '#',
  SNAKE_SPAWN: 'S',
  APPLE_SPAWN: '.',
  SNAKE_BODY: 'O',
};

let appleSpawns = level.query((entity) => entity.type === ENTITY_TYPE.APPLE_SPAWN);
let allBrown = level.query((entity) => entity.type === ENTITY_TYPE.BROWN);
let allWall = level.query((entity) => entity.type === ENTITY_TYPE.WALL);
let allGreen = level.query((entity) => entity.type === ENTITY_TYPE.GREEN);
let lvlcollison = allBrown.concat(allWall, allGreen);

function updateArrays(array) {
  appleSpawns = array.query((entity) => entity.type === ENTITY_TYPE.APPLE_SPAWN);
  allBrown = array.query((entity) => entity.type === ENTITY_TYPE.BROWN);
  allWall = array.query((entity) => entity.type === ENTITY_TYPE.WALL);
  allGreen = array.query((entity) => entity.type === ENTITY_TYPE.GREEN);
  lvlcollison = allBrown.concat(allWall, allGreen);
}

const right = new Victor(1, 0);
const down = new Victor(0, 1);
const left = new Victor(-1, 0);
const up = new Victor(0, -1);

let score = 0;

const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame
|| window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
let dir = (0, 0);
let sizeOfSnake = 4;
let speed = 100; // delta time
let dead = false;
let menuState = 0;
let k = 0;
let currentState = {};

const snake = [new Entity(width / 2, height / 2, 'R')]; // creation snake array
const apple = new Entity((width / 2) + 1, (width / 2) - 1, 'A'); // creation of apple object

const initialState = () => {
  dir = (0, 0);
  score = 0;
  speed = 100;
  snake.splice(0, snake.length);
  snake.push(new Entity((width / 2), (height / 2), 'R'));
  // apple.pos.x = random(width + 1, height - 2);
  // apple.pos.y = random(width + 1, height - 2);
  sizeOfSnake = 4;
  dead = false;
};

const setState = (state) => {
  currentState = state;
};

const moveLeft = () => { // handlers for button on click event
  if (snake[0].dir !== right && snake[0].dir !== left) {
    dir = left;
  }
};

const moveRight = () => {
  if (snake[0].dir !== left && snake[0].dir !== right) {
    dir = right;
  }
};

const moveUp = () => {
  if (snake[0].dir !== down && snake[0].dir !== up) {
    dir = up;
  }
};

const moveDown = () => {
  if (snake[0].dir !== up && snake[0].dir !== down) {
    dir = down;
  }
};

const posEq = (vector1, vector2) => {
  if (vector1.pos.x === vector2.pos.x && vector1.pos.y === vector2.pos.y) {
    return true;
  }
  return false;
};

// const possible = allEmpty.filter((entity) => isSnake(entity.x, entity.y));

const checkColision = () => {
  for (let i = 0; i < lvlcollison.length; i += 1) {
    if (posEq(lvlcollison[i], snake[0])) {
      dead = true;
    }
  }
};

const checkSnakeColision = (creature) => {
  for (let i = 4; i < creature.length; i += 1) {
    if (posEq(creature[0], creature[i])) {
      dead = true;
    }
  }
};

const updateSnake = () => {
  const newSprite = new Entity(snake[0].pos.x, snake[0].pos.y, 'R');
  snake.unshift(newSprite); // attache new sprite to existing snake
  if (posEq(snake[0], apple)) { // check if not picking up apple
    apple.pos = appleSpawns[random(1, appleSpawns.length)].pos;
    sizeOfSnake += 1; // increment size of the snake
    score += 20;
    endscore += 20;
    if (speed > 40) {
      speed -= speed * 0.05; // speed up snake with speed limit
    }
  }

  snake[0].dir = dir; // set direction for head of the snake from previous update
  snake[1].type = 'O';

  if (dir === left) { // running all the checks on newly created snake sprite
    if (snake[0].pos.x <= 0) {
      snake[0].pos.x = width;
    }
    snake[0].pos.x -= 1;
  }

  if (dir === right) {
    if (snake[0].pos.x >= width - 1) {
      snake[0].pos.x = 0 - 1;
    }
    snake[0].pos.x += 1;
  }

  if (dir === up) {
    if (snake[0].pos.y <= 0) {
      snake[0].pos.y = height;
    }
    snake[0].pos.y -= 1;
  }

  if (dir === down) {
    if (snake[0].pos.y >= height - 1) {
      snake[0].pos.y = 0 - 1;
    }
    snake[0].pos.y += 1;
  }

  if (snake.length > sizeOfSnake) { // setting minimal size of the snake
    snake.pop();
  }
};

function changeMenuCursorPosition() {
  if (k === 1) {
    if (menuState === 1) {
      menuState = -1;
    }
    menuState += 1;
  }
  if (k === 2) {
    if (menuState === 0) {
      menuState = 2;
    }
    menuState -= 1;
  }
}

const STATE_LEVEL_UP = {
  event(event) {
    if (event.key === 'Enter') {
      document.removeEventListener('keydown', STATE_LEVEL_UP.event);
      setState(STATE_GAME);
    }
  },
  tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initialState();
    ctx.font = '24px serif';
    ctx.fillText('Level up!!!', canvas.width / 2 - 60, canvas.height / 2);
    ctx.fillText('Next level !!!', canvas.width / 2 - 65, canvas.height / 2 + 25);
    ctx.fillText('Press Enter to continue ', canvas.width / 2 - 120, canvas.height / 2 + 50);

    document.addEventListener('keydown', STATE_LEVEL_UP.event);
  },
};

function lvlUp() {
  if (score === 1000) {
    currentLevel = random(0, LEVELS.length);
    setState(STATE_LEVEL_UP);
  }
}

const STATE_GAME = {
  event(event) {
    const callback = {
      ArrowLeft: moveLeft,
      ArrowRight: moveRight,
      ArrowUp: moveUp,
      ArrowDown: moveDown,
      w: moveUp,
      s: moveDown,
      a: moveLeft,
      d: moveRight,
    }[event.key];
    callback?.();
  },
  tick() {
    // this.handleInput();
    document.addEventListener('keydown', STATE_GAME.event);
    checkColision();
    checkSnakeColision(snake);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (snake.length < 4) {
      level = loadLevel(LEVELS[currentLevel]);
      setActiveView(level);
      updateArrays(level);
      updateCanvasSize(activeView);
    }
    drawLevel(level);
    if (!dead) {
      updateSnake(); // game logic
    }
    drawLevel(snake);
    if (apple.pos.x > level.width || apple.pos.y > level.height) {
      apple.pos = appleSpawns[random(1, appleSpawns.length)].pos;
    }
    drawSingleEntity(apple);
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 40);
    ctx.lineTo(canvas.width, canvas.height - 40);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.font = '16px sans-serif';
    ctx.fillText(`score : ${score}`, 10, canvas.height - 15);
    ctx.fillText(`fruits : ${(score / 20)}/${(1000 / 20)}`, canvas.width - 110, canvas.height - 15);
    if (dead) {
      document.removeEventListener('keydown', STATE_GAME.event);
      setState(STATE_GAME_OVER);
    }
    lvlUp();
  },
};

const STATE_MENU = {
  event(event) {
    if (event.key === 'Enter' && menuState === 0) {
      document.removeEventListener('keydown', STATE_MENU.event);
      setState(STATE_GAME);
    }
    if (event.key === 'ArrowDown' || event.key === 's') {
      k = 1;
    }
    if (event.key === 'ArrowUp' || event.key === 'w') {
      k = 2;
    }
  },
  tick() {
    if (dead) {
      currentLevel = random(0, LEVELS.length);
      endscore = 0;
    }
    initialState();
    ctx.clearRect(0, 0, width, height + 40);
    setActiveView(menu);
    updateCanvasSize(activeView);
    drawLevel(menu);
    document.addEventListener('keydown', STATE_MENU.event);
    changeMenuCursorPosition();
    if (menuState === 0) {
      drawLevel(menu);
    } if (menuState === 1) {
      drawLevel(menu2);
    }
    k = 0;
    ctx.fillStyle = 'black';
    ctx.font = '16px sans-serif';
    ctx.fillText('Select: Enter', 10, canvas.height - 15);
    ctx.fillText('Up: Arrow up | w', canvas.width / 2 - 80, canvas.height - 15);
    ctx.fillText('Down: Arrow down | s', canvas.width - 165, canvas.height - 15);
  },
};

const STATE_GAME_OVER = {
  event(event) {
    if (event.key === 'Enter') {
      document.removeEventListener('keydown', STATE_GAME_OVER.event);
      setState(STATE_MENU);
    }
  },
  tick() {
    ctx.clearRect(0, 0, width, height);
    setActiveView(gameOver);
    updateCanvasSize(activeView);
    drawLevel(gameOver);
    document.addEventListener('keydown', STATE_GAME_OVER.event);
    ctx.fillStyle = 'black';
    ctx.font = '16px sans-serif';
    ctx.fillText('Press Enter', (canvas.width / 2) - 45, canvas.height - 15);
    ctx.fillText(`score : ${endscore}`, 10, canvas.height - 15);
  },
};

currentState = STATE_MENU;

let lastUpdate = 0;

const loop = (timestamp) => { // main loop
  const dt = timestamp - lastUpdate;
  if (dt > speed) {
    lastUpdate = timestamp;
    currentState.tick();
  }
  requestAnimationFrame(loop);
};

requestAnimationFrame(loop);
