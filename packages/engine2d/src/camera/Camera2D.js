export class Camera2D {
  constructor({ width, height, x = 0, y = 0, smoothing = 10 } = {}) {
    this.width = width;
    this.height = height;
    
    // Current position (center of the view)
    this.x = x;
    this.y = y;
    
    // Target to follow
    this.target = null;
    this.offset = { x: 0, y: 0 }; // manual offset or lookahead
    
    this.smoothing = smoothing;
    this.bounds = null; // { x, y, w, h }

    // Shake state
    this._shakeTime = 0;
    this._shakeDuration = 0;
    this._shakeIntensity = 0;
    this._shakeX = 0;
    this._shakeY = 0;
  }

  /**
   * Set the target object to follow. Must have x and y properties.
   */
  follow(target) {
    this.target = target;
  }

  /**
   * Set world bounds to clamp the camera.
   * Typically 0, 0, mapWidth, mapHeight.
   */
  setBounds(x, y, w, h) {
    this.bounds = { x, y, w, h };
  }

  /**
   * Trigger screen shake.
   * @param {number} duration - seconds
   * @param {number} intensity - pixels
   */
  shake(duration = 0.2, intensity = 5) {
    this._shakeDuration = duration;
    this._shakeTime = duration;
    this._shakeIntensity = intensity;
  }

  /**
   * Update camera position based on target, smoothing, and shake.
   * Call this every frame.
   */
  update(dt) {
    // 1. Follow logic
    if (this.target) {
      // Calculate desired position (centered on target + offset)
      const tx = this.target.x + this.offset.x;
      const ty = this.target.y + this.offset.y;

      // Exponential smoothing
      // x += (target - x) * (1 - exp(-speed * dt))
      const k = 1 - Math.exp(-this.smoothing * dt);
      this.x += (tx - this.x) * k;
      this.y += (ty - this.y) * k;
    }

    // 2. Clamp to bounds (keep viewport inside bounds)
    if (this.bounds) {
      // Half dimensions
      const hw = this.width / 2;
      const hh = this.height / 2;

      // Min/Max center positions
      const minX = this.bounds.x + hw;
      const maxX = this.bounds.x + this.bounds.w - hw;
      const minY = this.bounds.y + hh;
      const maxY = this.bounds.y + this.bounds.h - hh;

      // If bounds are smaller than view, center it
      if (minX > maxX) this.x = this.bounds.x + this.bounds.w / 2;
      else this.x = Math.max(minX, Math.min(maxX, this.x));

      if (minY > maxY) this.y = this.bounds.y + this.bounds.h / 2;
      else this.y = Math.max(minY, Math.min(maxY, this.y));
    }

    // 3. Shake logic
    if (this._shakeTime > 0) {
      this._shakeTime -= dt;
      // Damping: intensity reduces over time
      const strength = this._shakeIntensity * (this._shakeTime / this._shakeDuration);
      
      this._shakeX = (Math.random() * 2 - 1) * strength;
      this._shakeY = (Math.random() * 2 - 1) * strength;
    } else {
      this._shakeX = 0;
      this._shakeY = 0;
    }
  }

  /**
   * Get the top-left corner of the camera view (for rendering offset).
   * Includes shake.
   */
  get viewX() {
    return this.x - this.width / 2 + this._shakeX;
  }

  get viewY() {
    return this.y - this.height / 2 + this._shakeY;
  }
  
  /**
   * Helper to set lookahead based on velocity.
   * Call this manually if you want lookahead behavior.
   */
  setLookAhead(vx, vy, factor = 0.5) {
      this.offset.x = vx * factor;
      this.offset.y = vy * factor;
  }
}
