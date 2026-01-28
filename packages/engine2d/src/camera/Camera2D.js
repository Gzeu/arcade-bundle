export class Camera2D {
  constructor({ bounds, smoothing = 12 }) {
    this.x = 0;
    this.y = 0;
    this.bounds = bounds;
    this.smoothing = smoothing;
    this._shakeT = 0;
    this._shakeAmp = 0;
    this._shakeX = 0;
    this._shakeY = 0;
  }

  follow(targetX, targetY, dt) {
    const k = 1 - Math.exp(-this.smoothing * dt);
    this.x += (targetX - this.x) * k;
    this.y += (targetY - this.y) * k;

    this.x = Math.min(this.bounds.maxX, Math.max(this.bounds.minX, this.x));
    this.y = Math.min(this.bounds.maxY, Math.max(this.bounds.minY, this.y));

    if (this._shakeT > 0) {
      this._shakeT -= dt;
      const t = Math.max(0, this._shakeT);
      const amp = this._shakeAmp * (t / Math.max(0.0001, this._shakeT + dt));
      this._shakeX = (Math.random() * 2 - 1) * amp;
      this._shakeY = (Math.random() * 2 - 1) * amp;
    } else {
      this._shakeX = 0;
      this._shakeY = 0;
    }
  }

  shake(durationSec = 0.12, amplitude = 6) {
    this._shakeT = durationSec;
    this._shakeAmp = amplitude;
  }

  get offset() {
    return { ox: this.x + this._shakeX, oy: this.y + this._shakeY };
  }
}
