// Shadow Gallery — keyboard state. Tracks held keys by code and remembers
// single presses (Enter, R, P, M) so the game loop can consume them once.
export class KeyboardInput {
  constructor() {
    this.heldKeys = new Set();
    this.pressedKeys = new Set();
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  onKeyDown(event) {
    // Keep arrows / space from scrolling the page.
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
    if (!event.repeat) this.pressedKeys.add(event.code);
    this.heldKeys.add(event.code);
  }

  onKeyUp(event) {
    this.heldKeys.delete(event.code);
  }

  isDown(code) {
    return this.heldKeys.has(code);
  }

  // True once per physical press; the loop clears it every frame.
  wasPressed(code) {
    return this.pressedKeys.has(code);
  }

  clearPressed() {
    this.pressedKeys.clear();
  }
}
