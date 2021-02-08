export default class Input {
  constructor() {
    this.lastEvent = null;
    document.addEventListener('keydown', (key) => {
      this.onKeyPress(key);
    });
  }

  onKeyPress(keyEvent) {
    this.lastEvent = keyEvent;
  }

  isPressed(keyCode) {
    return this.keyEvents[keyCode] !== undefined;
  }

  clear() {
    this.lastEvent = null;
  }
}
