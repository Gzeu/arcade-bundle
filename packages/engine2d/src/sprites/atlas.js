/**
 * Minimal sprite atlas helper (web-first, Canvas2D).
 *
 * Frames format (recommended):
 * {
 *   frames: {
 *     "player_idle_0": { x:0, y:0, w:32, h:32 },
 *     ...
 *   }
 * }
 */

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

export class Atlas {
  constructor(image, frames) {
    this.image = image;
    this.frames = frames?.frames ?? frames ?? {};
  }

  static async load({ imageUrl, dataUrl, frames } = {}) {
    if (!imageUrl) throw new Error('Atlas.load: missing imageUrl');

    const [img, data] = await Promise.all([
      loadImage(imageUrl),
      dataUrl ? fetch(dataUrl).then((r) => r.json()) : Promise.resolve(null),
    ]);

    const resolvedFrames = frames ?? (data?.frames ?? data ?? {});
    return new Atlas(img, resolvedFrames);
  }

  getFrame(name) {
    const f = this.frames?.[name];
    if (!f) throw new Error(`Atlas.getFrame: missing frame "${name}"`);
    return {
      x: f.x ?? f.frame?.x ?? 0,
      y: f.y ?? f.frame?.y ?? 0,
      w: f.w ?? f.width ?? f.frame?.w ?? f.frame?.width ?? 0,
      h: f.h ?? f.height ?? f.frame?.h ?? f.frame?.height ?? 0,
    };
  }

  /**
   * Draw a named frame on a CanvasRenderingContext2D.
   *
   * options:
   * - pivotX/pivotY: 0..1 (default 0.5/0.5)
   * - scaleX/scaleY: default 1
   * - rotation: radians, default 0
   * - flipX/flipY: boolean
   * - alpha: 0..1
   */
  draw(ctx, name, x, y, options = {}) {
    const f = this.getFrame(name);

    const pivotX = clamp01(options.pivotX ?? 0.5);
    const pivotY = clamp01(options.pivotY ?? 0.5);
    const scaleX = options.scaleX ?? 1;
    const scaleY = options.scaleY ?? 1;
    const rotation = options.rotation ?? 0;
    const flipX = !!options.flipX;
    const flipY = !!options.flipY;
    const alpha = options.alpha;

    const dx = -pivotX * f.w;
    const dy = -pivotY * f.h;

    ctx.save();

    if (typeof alpha === 'number') {
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    }

    ctx.translate(x, y);
    if (rotation) ctx.rotate(rotation);

    ctx.scale((flipX ? -1 : 1) * scaleX, (flipY ? -1 : 1) * scaleY);

    ctx.drawImage(this.image, f.x, f.y, f.w, f.h, dx, dy, f.w, f.h);

    ctx.restore();
  }
}
