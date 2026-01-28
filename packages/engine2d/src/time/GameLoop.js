export class GameLoop {
  #acc = 0;
  #last = 0;

  constructor({ fixedDt = 1 / 60, update, render }) {
    this.fixedDt = fixedDt;
    this.update = update;
    this.render = render;
  }

  start() {
    this.#last = performance.now();
    requestAnimationFrame(this.#tick);
  }

  #tick = (now) => {
    const frameDt = Math.min((now - this.#last) / 1000, 0.25);
    this.#last = now;

    this.#acc += frameDt;
    while (this.#acc >= this.fixedDt) {
      this.update(this.fixedDt);
      this.#acc -= this.fixedDt;
    }

    const alpha = this.#acc / this.fixedDt;
    this.render(alpha);

    requestAnimationFrame(this.#tick);
  };
}
