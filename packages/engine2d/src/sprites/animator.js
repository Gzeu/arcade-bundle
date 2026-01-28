export class Animator {
  constructor() {
    this._anims = new Map();

    this._current = null;
    this._t = 0;
    this._frameIndex = 0;
  }

  define(name, { frames, fps = 12, loop = true } = {}) {
    if (!name) throw new Error('Animator.define: missing name');
    if (!Array.isArray(frames) || frames.length === 0) {
      throw new Error(`Animator.define: frames must be a non-empty array ("${name}")`);
    }
    if (!Number.isFinite(fps) || fps <= 0) {
      throw new Error(`Animator.define: fps must be > 0 ("${name}")`);
    }

    this._anims.set(name, { name, frames, fps, loop });
    return this;
  }

  play(name, { reset = true } = {}) {
    const anim = this._anims.get(name);
    if (!anim) throw new Error(`Animator.play: missing animation "${name}"`);

    if (this._current?.name !== name) {
      this._current = anim;
      this._t = 0;
      this._frameIndex = 0;
      return this;
    }

    if (reset) {
      this._t = 0;
      this._frameIndex = 0;
    }

    return this;
  }

  stop() {
    this._current = null;
    this._t = 0;
    this._frameIndex = 0;
    return this;
  }

  update(dt) {
    if (!this._current) return;

    this._t += dt;

    const anim = this._current;
    const frameDur = 1 / anim.fps;

    while (this._t >= frameDur) {
      this._t -= frameDur;
      this._frameIndex += 1;

      if (this._frameIndex >= anim.frames.length) {
        if (anim.loop) {
          this._frameIndex = 0;
        } else {
          this._frameIndex = anim.frames.length - 1;
          break;
        }
      }
    }
  }

  get frameName() {
    if (!this._current) return null;
    return this._current.frames[this._frameIndex] ?? null;
  }

  get isPlaying() {
    return !!this._current;
  }
}
