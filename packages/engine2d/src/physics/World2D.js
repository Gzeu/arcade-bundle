import { aabbIntersects, canCollide } from './Collider.js';

export class World2D {
  constructor() {
    this.colliders = [];
  }

  add(c) {
    this.colliders.push(c);
    return c;
  }

  remove(c) {
    const i = this.colliders.indexOf(c);
    if (i >= 0) this.colliders.splice(i, 1);
  }

  // Resolve foarte simplu: doar AABB vs AABB, separare pe axa cu penetrarea minimă.
  moveAABB(c, dx, dy, onHit) {
    c.x += dx;
    for (const o of this.colliders) {
      if (o === c) continue;
      if (!canCollide(c, o)) continue;
      if (o.isTrigger) continue;
      if (o.kind !== 'aabb') continue;
      if (!aabbIntersects(c, o)) continue;

      if (dx > 0) c.x = o.x - c.w;
      else if (dx < 0) c.x = o.x + o.w;

      onHit?.(o);
    }

    c.y += dy;
    for (const o of this.colliders) {
      if (o === c) continue;
      if (!canCollide(c, o)) continue;
      if (o.isTrigger) continue;
      if (o.kind !== 'aabb') continue;
      if (!aabbIntersects(c, o)) continue;

      if (dy > 0) c.y = o.y - c.h;
      else if (dy < 0) c.y = o.y + o.h;

      onHit?.(o);
    }
  }
}
