import Victor from 'victor';
import './style.css';

import Input from './input';
import { Entity, loadLevel } from './components/LevelGen';
import MENU from './components/Menu';
import LEVELS from './components/levels';

function random(from, to) {
  return Math.floor(Math.random() * (Math.floor(to) - Math.ceil(from)) + Math.ceil(from));
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
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

let snakeSpawns = level.query((entity) => entity.type === ENTITY_TYPE.SNAKE_SPAWN);
let appleSpawns = level.query((entity) => entity.type === ENTITY_TYPE.APPLE_SPAWN);
let allBrown = level.query((entity) => entity.type === ENTITY_TYPE.BROWN);
let allWall = level.query((entity) => entity.type === ENTITY_TYPE.WALL);
let allGreen = level.query((entity) => entity.type === ENTITY_TYPE.GREEN);
let lvlcollison = allBrown.concat(allWall, allGreen);

function updateArrays(array) {
  snakeSpawns = level.query((entity) => entity.type === ENTITY_TYPE.SNAKE_SPAWN);
  appleSpawns = array.query((entity) => entity.type === ENTITY_TYPE.APPLE_SPAWN);
  allBrown = array.query((entity) => entity.type === ENTITY_TYPE.BROWN);
  allWall = array.query((entity) => entity.type === ENTITY_TYPE.WALL);
  allGreen = array.query((entity) => entity.type === ENTITY_TYPE.GREEN);
  lvlcollison = allBrown.concat(allWall, allGreen);
}

function setActiveView(view) {
  activeView = view;
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
const apple = new Entity((width / 2) + 5, (width / 2) - 5, 'G'); // creation of apple object

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

function red() {
  ctx.fillStyle = 'red';
  ctx.strokeStyle = 'black';
}

function green() {
  ctx.fillStyle = 'green';
  ctx.strokeStyle = 'black';
}

function brown() {
  ctx.fillStyle = 'brown';
  ctx.strokeStyle = 'black';
}

function white() {
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
}

function o() {
  ctx.fillStyle = 'rgba(150, 150, 150)';
  ctx.strokeStyle = 'black';
}

const drawSingleEntity = (entity) => {
  const callback = {
    R: red,
    G: green,
    '#': brown,
    _: white,
    O: o,
    B: brown,
  }[entity.type];
  callback?.();

  ctx.strokeRect(entity.pos.x * 10, entity.pos.y * 10, 10, 10);
  ctx.fillRect(entity.pos.x * 10, entity.pos.y * 10, 10, 10);
};

const drawLevel = (insert) => {
  if (insert.entities) {
    insert.entities.forEach(drawSingleEntity);
    setActiveView(insert);
  } else {
    insert.forEach(drawSingleEntity);
  }
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

const checkSnakeColision = () => {
  for (let i = 4; i < snake.length; i += 1) {
    if (posEq(snake[0], snake[i])) {
      dead = true;
    }
  }
};

const update = () => {
  const newSprite = new Entity(snake[0].pos.x, snake[0].pos.y, 'R');
  snake.unshift(newSprite); // attache new sprite to existing snake

  if (posEq(snake[0], apple)) { // check if not picking up apple
    apple.pos = appleSpawns[random(1, appleSpawns.length)].pos;
    sizeOfSnake += 1; // increment size of the snake
    score += 20;
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
  tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initialState();
    ctx.font = '24px serif';
    ctx.fillText('Level up!!!', canvas.width / 2 - 60, canvas.height / 2);
    ctx.fillText('Next level !!!', canvas.width / 2 - 65, canvas.height / 2 + 25);
    ctx.fillText('Press Enter to continue ', canvas.width / 2 - 120, canvas.height / 2 + 50);

    document.addEventListener('keyup', (event) => {
      if (event.key === 'Enter' && menuState === 0) {
        setState(STATE_GAME);
      }
    });
  },
};

function lvlUp() {
  if (score === 1000) {
    currentLevel = random(0, 4);
    setState(STATE_LEVEL_UP);
  }
}

/* const input = new Input();

function tick() {
  const actions = {
    ARROW_UP: moveUp,
    ARROW_DOWN: moveDown,
    ARROW_LEFT: moveLeft,
    ARROW_RIGHT: moveRight,
  };
  const action = actions[input.lastEvent] || (() => undefined);
  action();

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  input.clear();
} */

/*
class GameStateBase {
  constructor(setState) {
    this.setState = setState;
  }
  tick() {
    throw new Error("Must overload .tick()");
  }
}

class StateGame extends GameStateBase {
  tick() {
    this.setState();
  }
}
{
  'GAME': 'game'
}
const STATE = {
  GAME: 'game',
  GAME_OVER: 'game_over',
};

const gameStates = {
  [STATE.GAME]: StateGame,
  [STATE.GAME_OVER]: StateGameOver,
}
setState(STATE.GAME)
*/
function event(act) {
  const callback = {
    ArrowLeft: moveLeft,
    ArrowRight: moveRight,
    ArrowUp: moveUp,
    ArrowDown: moveDown,
    w: moveUp,
    s: moveDown,
    a: moveLeft,
    d: moveRight,
  }[act.key];
  callback?.();
}

const STATE_GAME = {

  tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateCanvasSize(activeView);
    level = loadLevel(LEVELS[currentLevel]);
    drawLevel(level);
    updateArrays(level);
    document.addEventListener('keydown', event);
    checkColision();
    checkSnakeColision();
    update(); // game logic
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
    ctx.font = '24px serif';
    ctx.fillText(`score : ${score}`, 10, canvas.height - 15);
    ctx.fillText(`next level : ${(((1000 / 20)) - (score / 20))}`, canvas.width - 170, canvas.height - 15);
    if (dead) {
      setState(STATE_GAME_OVER);
      document.removeEventListener('keydown', STATE_GAME.event);
    }
    lvlUp();
  },
};

const STATE_MENU = {
  action(action) {
    if (action.key === 'Enter' && menuState === 0 && currentState === STATE_MENU) {
      document.removeEventListener('keydown', STATE_MENU.action);
      setState(STATE_GAME);
    }
    if (action.key === 'ArrowDown' || action.key === 's') {
      k = 1;
    }
    if (action.key === 'ArrowUp' || action.key === 'w') {
      k = 2;
    }
  },
  tick() {
    initialState();
    updateCanvasSize(activeView);
    ctx.clearRect(0, 0, width, height + 40);
    drawLevel(menu);
    document.addEventListener('keydown', STATE_MENU.action);
    changeMenuCursorPosition();
    if (menuState === 0) {
      drawLevel(menu);
    } if (menuState === 1) {
      drawLevel(menu2);
    }
    k = 0;
  },
};

const STATE_GAME_OVER = {
  event(action) {
    if (action.key === 'Enter' && currentState === STATE_GAME_OVER) {
      document.removeEventListener('keydown', STATE_GAME_OVER.event);
      setState(STATE_MENU);
    }
  },
  tick() {
    ctx.clearRect(0, 0, width, height);
    updateCanvasSize(activeView);
    drawLevel(gameOver);
    document.addEventListener('keydown', STATE_GAME_OVER.event);
  },
};

currentState = STATE_MENU;

/* for (let i = 0, j = 0, k = 0, l = 0; i < 240; i++) {
  if ( i <= 60 ) {
    lvl[1][i] = new Sprite(i*10, 0);
  }
  if ( i > 60 && i <= 120) {
    lvl[1][i] = new Sprite(0, j*10);
    j++;
  }
  if (i > 120 && i <= 180) {
    lvl[1][i] = new Sprite(590, k*10);
    k++;
  }
  if (i > 180 && i <= 240) {
    j = 0;
    lvl[1][i] = new Sprite(l*10, 590);
    l++;
  }
} */
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
