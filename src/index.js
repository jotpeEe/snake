import Victor from 'victor';
import './style.css';
import bg from '../assets/Background.png';
import play from '../assets/play.png';
import inst from '../assets/instructions.png';
import settings from '../assets/settings.png';
import credits from '../assets/credits.png';
import ship from '../assets/ship.png';
import g_o from '../assets/game_over.jpg';


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const right = new Victor(1, 0);
const down = new Victor(0, 1);
const left = new Victor(-1, 0);
const up = new Victor(0, -1);

const bgImage = new Image();
const playImage = new Image();
const instructImage = new Image();
const settingsImage = new Image();
const creditsImage = new Image();
const shipImage = new Image();
const game_over = new Image();

shipImage.src = ship;
bgImage.src = bg;
playImage.src = play;
instructImage.src = inst;
settingsImage.src = settings;
creditsImage.src = credits;
game_over.src = g_o;

let score = 0;

let buttonX = [255, 167, 205, 217];
let buttonY = [100, 140, 180, 220];
let buttonWidth = [96, 260, 182, 160];
let buttonHeight = [40, 40, 40, 40];

let backgroundY = 0;
let spd = 1;

const moveBackground = () => {
  backgroundY -= spd;
  if (backgroundY == -1 * height){
    backgroundY = 0;
  }
};


let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
let width = canvas.width;
let height = canvas.height-40;
let dir = (0, 0);
let progress = 10;
let sizeOfSnake = 4;
let randCorGen = Math.floor(Math.random() * 57)*10;           // random coordinate generator within the level bounds (width/height)
let speed = 100;                                                   // delta time
let lvl = [];
let dead = false;
let menu_state = 0;
let k = 0;
let currentLevel = 0;

function drawPointer(i) {
  ctx.drawImage(shipImage, (buttonX[i]-40), (buttonY[i]+5), 30, 30);
  ctx.drawImage(shipImage, (buttonX[i]+buttonWidth[i])+5, (buttonY[i]+5), 30, 30);
}

const STATE_LEVEL_UP = {
  tick: function() {
    ctx.clearRect(0, 0, width, height);
    initialState();
    ctx.font = '24px serif';
    
    ctx.fillText('Level up!!!', width/2 - 60, height/2);
    ctx.fillText('Next level : '+currentLevel, width/2 - 65, height/2+25);
    ctx.fillText('Press Enter to continue ', width/2 - 120, height/2+50);

    document.addEventListener('keyup', (event) => {
      if (event.key == "Enter" && menu_state == 0) {
        setState(STATE_GAME);
      } 
    });
  }
}

const STATE_MENU = {
  tick: function(){
    
    currentLevel = 0;
    initialState(); 
    ctx.clearRect(0, 0, width, height+40);                       
    moveBackground(); 
    ctx.drawImage(bgImage, 0, backgroundY, 600, 1200);
    ctx.drawImage(playImage, buttonX[0], buttonY[0]);
    ctx.drawImage(instructImage, buttonX[1], buttonY[1]); 
    ctx.drawImage(settingsImage, buttonX[2], buttonY[2]);
    ctx.drawImage(creditsImage, buttonX[3], buttonY[3]);
    changeMenuCursorPosition();    
    if (menu_state == 0) {
      drawPointer(menu_state);
    } if (menu_state == 1) {
      drawPointer(menu_state);
    } if (menu_state == 2) {
      drawPointer(menu_state);
    } if (menu_state == 3) {
      drawPointer(menu_state);
    }

    document.addEventListener('keyup', (event) => {
      if (event.key == "Enter" && menu_state == 0) {
        setState(STATE_GAME);
      } 
      if (event.key == "ArrowDown" || event.key == "s") {
        k = 1;
      } 
      if (event.key == "ArrowUp" || event.key == "w") {
        k = 2;
      }
    });
    k = 0;
  }
}

function changeMenuCursorPosition () {
  if (k == 1) {
    if (menu_state == 3) {
      menu_state = -1;
    }
    menu_state += 1;
  }
  if (k == 2) {
    if (menu_state == 0){
      menu_state = 4;
    }
    menu_state -= 1;
  }
}

const STATE_GAME = {
  tick: function() {
    ctx.clearRect(0, 0, width, height+40);                       
    ctx.beginPath();
    ctx.moveTo(0, 600);
    ctx.lineTo(600, 600);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.font = '24px serif';
    ctx.fillText('score : '+score, 10, 625);
    ctx.fillText('next level : '+((1000/20)-(score/20)), 430, 625);
    drawSingle(apple_example);
    
    createLvl(currentLevel);
    input();
    checkColision();
    checkSnakeColision();
    update();                                                // game logic
    drawWhole(lvl);
    drawWhole(snake);                                         // renders
    drawSingle(apple);
    
    if(dead){
      setState(STATE_GAME_OVER);
    }
    lvlUp();
  }
}

const initialState = () => {
  
  score = 0;
  speed = 100;
  snake.splice(0, snake.length);
  snake.push(new Sprite(width / 2, height / 2, 'red'));
  apple.pos.x = randCorGen;
  apple.pos.y = randCorGen;
  sizeOfSnake = 4;
  dead = false;
  lvl.length = 0;

}

const STATE_GAME_OVER = {
  tick: function() {
    
    ctx.clearRect(0, 0, width, height);                       
    ctx.drawImage(game_over, 0, 0, 600, 600);
    
    document.addEventListener('keyup', (event) => {
      if (event.key == "Enter") {
        setState(STATE_MENU);
      }
    });
  }
}

class Sprite {
  constructor(x, y, color) {
    this.pos = {
      x: x,
      y: y 
    }
    this.color = color || 'rgba(150, 150, 150)';
  }
}

let currentState = STATE_MENU;

/*for (let i = 0, j = 0, k = 0, l = 0; i < 240; i++) {
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
}*/

function lvlUp(){
  if (score == 100){
    currentLevel++;
    setState(STATE_LEVEL_UP);
  }
}

function random(from, to) {
  from = Math.ceil(from);
  to = Math.floor(to);
  return Math.floor(Math.random() * (to - from) + from)*10;
}

function createLvl(num){
  if (lvl.length == 0){
    for (let i = 0; i < num*num; i++){
      lvl[i] = new Sprite(random(1, 58), random(1, 58));
    }
  }
}

const snake = [ new Sprite(width / 2, height / 2, 'red') ];   // creation snake array
const apple = new Sprite(randCorGen, randCorGen, 'green');    // creation of apple object
const apple_example = new Sprite(570, 613, 'green');

const posEq = (vector1, vector2) => {
  if (vector1.pos.x == vector2.pos.x && vector1.pos.y == vector2.pos.y) {
    return true;
  }
  return false;
}

const drawWhole = (sprites) => {                                  // draw set of sprites
  sprites.forEach(drawSingle);
}

const drawSingle = (sprite) => {                                 // draw single sprite
  // x, y, width, height
  ctx.fillStyle = sprite.color;
  ctx.strokeStyle = 'black';
  ctx.strokeRect(sprite.pos.x, sprite.pos.y, 10, 10);
  ctx.fillRect(sprite.pos.x, sprite.pos.y, 10, 10);
}

const update = () => {

  let newSprite = new Sprite(snake[0].pos.x, snake[0].pos.y, 'red');  // create sprite for next moveBackground
    
  snake.unshift(newSprite);                                      // attache new sprite to existing snake
  
  if (posEq(snake[0], apple)) {                                // check if not picking up apple
    let s = lvl.concat(snake);
    apple.pos.x = Math.floor(Math.random() * 55)*10;
    apple.pos.y = Math.floor(Math.random() * 55)*10;
    ++sizeOfSnake;
    score += 20;                                               // increment size of the snake
    if (speed > 40) {
      speed = speed - speed * 0.05;                      // speed up snake with speed limit
    }                     
  }

  snake[0].dir = dir;                                            // set direction for head of the snake from previous update
  snake[1].color = 'rgba(150, 150, 150)';
  
  if (dir == left) {                                            // running all the checks on newly created snake sprite
    if (snake[0].pos.x <= 0) {
      snake[0].pos.x = width;
    }
    snake[0].pos.x -= progress;
  }
  
  if (dir == right) {
    if (snake[0].pos.x >= width-10) {
      snake[0].pos.x = 0-10;
    }    
    snake[0].pos.x += progress;
  }
  
  if (dir == up) {
    if ( snake[0].pos.y <= 0 ) {
      snake[0].pos.y = height;
    }
    snake[0].pos.y -= progress;
  }
  
  if (dir == down) {
    if (snake[0].pos.y >= height-10) {
      snake[0].pos.y = 0-10;
    }
    snake[0].pos.y += progress;
  }
  
  if (snake.length > sizeOfSnake) {                             // setting minimal size of the snake
    snake.pop();
  }
}

const checkSnakeColision = () => {
  for (let i = 4; i < snake.length; i++) {
    if (posEq(snake[0], snake[i])){
      dead = true;
    }
  }
}

const checkColision = () => {
  for (let i = 0; i < lvl.length ; i++) {
    if (posEq(lvl[i], snake[0])) {
      dead = true;
    }
  }
}
  
const moveLeft = () => {                                             // handlers for button on click event
  if (snake[0].dir != right) {
    dir = left;
  }
}

const moveRight = () => {
  if (snake[0].dir != left) {
    dir = right;
  }
}

const moveUp = () => {
  if (snake[0].dir != down) {
    dir = up;
  } 
}

const moveDown = () => {
  if (snake[0].dir != up) {
    dir = down;
  }
}

const setState = (state) => {
  currentState = state;
}

const input = () => {
  document.addEventListener('keydown', (event) => {
  const callback = {
    "ArrowLeft": moveLeft,
    "ArrowRight": moveRight,
    "ArrowUp": moveUp,
    "ArrowDown": moveDown,
    "w" : moveUp,
    "s" : moveDown,
    "a" : moveLeft,
    "d" : moveRight
  }[event.key]
  callback?.()
  });
};


const loop = (timestamp) => {                                     // main loop
    
  const dt = timestamp - lastUpdate;
  if (dt > speed) {
    lastUpdate = timestamp;
    currentState.tick(); 
  }
  requestAnimationFrame(loop);
}

let lastUpdate = 0;
requestAnimationFrame(loop);

