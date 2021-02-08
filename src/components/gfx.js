const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

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
  const paint = {
    R: red,
    G: green,
    '#': brown,
    _: white,
    O: o,
    B: brown,
  }[entity.type];
  paint?.();

  ctx.strokeRect(entity.pos.x * 10, entity.pos.y * 10, 10, 10);
  ctx.fillRect(entity.pos.x * 10, entity.pos.y * 10, 10, 10);
};

const drawLevel = (insert) => {
  if (insert.entities) {
    insert.entities.forEach(drawSingleEntity);
  } else {
    insert.forEach(drawSingleEntity);
  }
};

export {
  drawSingleEntity,
  drawLevel,
};
