import { Collider } from '../physics/Collider.js';

export class TilemapColliderBuilder {
  /**
   * Converts simple rects (from Tilemap.getSolidRects) into physics Colliders
   * and adds them to a World2D instance.
   *
   * @param {Tilemap} tilemap
   * @param {World2D} world
   * @param {object} options
   * @param {string} options.layerName - Tilemap layer to scan (default: 'Terrain')
   * @param {string} options.property - Tile property to check (default: 'solid')
   * @param {number} options.layerMask - Physics layer (default: 1)
   */
  static build(tilemap, world, { layerName = 'Terrain', property = 'solid', layerMask = 1 } = {}) {
    const rects = tilemap.getSolidRects({ layerName, property });
    const bodies = [];

    for (const r of rects) {
      // Create a static AABB collider
      const c = new Collider({
        x: r.x,
        y: r.y,
        w: r.w,
        h: r.h,
        kind: 'aabb',
        layer: layerMask,
        mask: 0, // static things usually don't need to check collisions themselves
        isStatic: true,
      });
      world.add(c);
      bodies.push(c);
    }

    return bodies;
  }
}
