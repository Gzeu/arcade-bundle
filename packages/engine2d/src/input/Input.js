// Input abstraction pe actions (keyboard-first). Extinzi cu gamepad/touch.
export class Input {
  #keysDown = new Set();
  #keysPrev = new Set();

  constructor({ binds }) {
    this.binds = binds;
  }

  attach(target = window) {
    target.addEventListener('keydown', (e) => this.#keysDown.add(e.code));
    target.addEventListener('keyup', (e) => this.#keysDown.delete(e.code));
  }

  beginFrame() {
    this.#keysPrev = new Set(this.#keysDown);
  }

  snapshot() {
    const down = (action) => (this.binds[action] ?? []).some((k) => this.#keysDown.has(k));
    const pressed = (action) => down(action) && !(this.binds[action] ?? []).some((k) => this.#keysPrev.has(k));

    const axis = (name) => {
      if (name === 'move_x') return (down('move_right') ? 1 : 0) - (down('move_left') ? 1 : 0);
      if (name === 'move_y') return (down('move_down') ? 1 : 0) - (down('move_up') ? 1 : 0);
      return 0;
    };

    return { down, pressed, axis };
  }
}
