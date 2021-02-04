/* eslint-disable max-classes-per-file */

class Entity {
  constructor(x, y, type) {
    this.pos = {
      x,
      y,
    };
    this.type = type || 'O';
  }
}

/**
 * Level stores all sprite types available
 */
class Level {
  constructor({ width, height }) {
    this.width = width;
    this.height = height;
    this.entities = [];
  }

  get(x, y) {
    return this.entities[x * this.width + y];
  }

  query(predicate) {
    return this.entities.filter(predicate);
  }
}

function loadLevel(levelStr) {
  // validate levelStr
  const strTrim = levelStr.trim();
  const lines = strTrim.split('\n');

  // Check all lines have the same length
  const lineLen = lines[0].length;
  lines.forEach((line, index) => {
    if (line.length !== lineLen) {
      throw new Error(`Invalid line length: ${index + 1} : '${line}'`);
    }
  });

  const level = new Level({
    width: lineLen,
    height: lines.length,
  });

  lines.forEach((line, yIndex) => {
    Array.from(line).forEach((type, xIndex) => {
      level.entities.push(new Entity(xIndex, yIndex, type));
    });
  });

  return level;
}

export {
  Entity,
  Level,
  loadLevel,
};
