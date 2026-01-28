/**
 * Minimal Tiled JSON tilemap loader + helper methods.
 * Web-first (ESM), renderer-agnostic.
 */

async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

function getPropBool(props, name) {
  const p = Array.isArray(props) ? props.find((x) => x?.name === name) : null;
  if (!p) return false;
  return p.value === true || p.value === 1 || p.value === 'true';
}

function buildGidToProps(tileset) {
  // Tiled JSON: tileset.tiles[] with per-tile properties.
  // gid = firstgid + tile.id
  const map = new Map();
  if (!tileset || !Array.isArray(tileset.tiles)) return map;

  for (const t of tileset.tiles) {
    const gid = (tileset.firstgid ?? 1) + (t.id ?? 0);
    map.set(gid, { properties: t.properties ?? [] });
  }

  return map;
}

function normalizeTilesets(tiled) {
  const tilesets = Array.isArray(tiled.tilesets) ? tiled.tilesets : [];

  // Note: This is a minimal loader. It supports tilesets that have `image` directly
  // inside the tileset object (single-image tileset). TSX external tilesets are not handled.
  return tilesets.map((ts) => {
    const tileWidth = ts.tilewidth ?? tiled.tilewidth;
    const tileHeight = ts.tileheight ?? tiled.tileheight;

    const columns = ts.columns;
    const imageWidth = ts.imagewidth;
    const imageHeight = ts.imageheight;

    const inferredColumns = columns ?? (imageWidth ? Math.floor(imageWidth / tileWidth) : null);
    const inferredRows = ts.rows ?? (imageHeight ? Math.floor(imageHeight / tileHeight) : null);

    return {
      firstgid: ts.firstgid ?? 1,
      name: ts.name ?? 'tileset',
      image: ts.image ?? null,
      tileWidth,
      tileHeight,
      columns: inferredColumns,
      rows: inferredRows,
      tilecount: ts.tilecount ?? (inferredColumns && inferredRows ? inferredColumns * inferredRows : null),
      tiles: ts.tiles ?? [],
      _gidToTileMeta: buildGidToProps(ts),
    };
  });
}

function findTilesetForGid(tilesets, gid) {
  // Find tileset with max firstgid <= gid
  let best = null;
  for (const ts of tilesets) {
    if ((ts.firstgid ?? 1) <= gid) {
      if (!best || (ts.firstgid ?? 1) > (best.firstgid ?? 1)) best = ts;
    }
  }
  return best;
}

export class Tilemap {
  constructor({ tiled, tilesets, images }) {
    this.tiled = tiled;
    this.width = tiled.width;
    this.height = tiled.height;
    this.tileWidth = tiled.tilewidth;
    this.tileHeight = tiled.tileheight;

    this.layers = Array.isArray(tiled.layers) ? tiled.layers : [];

    this.tilesets = tilesets;
    this.images = images;
  }

  static async load({ url, baseUrl } = {}) {
    if (!url) throw new Error('Tilemap.load: missing url');

    const tiled = await fetch(url).then((r) => r.json());

    const resolvedBase = baseUrl ?? new URL('.', url).toString();
    const tilesets = normalizeTilesets(tiled);

    const images = new Map();
    await Promise.all(
      tilesets
        .filter((ts) => ts.image)
        .map(async (ts) => {
          const imgUrl = new URL(ts.image, resolvedBase).toString();
          const img = await loadImage(imgUrl);
          images.set(ts.name, { image: img, url: imgUrl });
        })
    );

    return new Tilemap({ tiled, tilesets, images });
  }

  getLayer(name) {
    const l = this.layers.find((x) => x?.name === name);
    if (!l) throw new Error(`Tilemap.getLayer: missing layer "${name}"`);
    return l;
  }

  /**
   * Draw a tile layer (Canvas2D helper).
   *
   * options:
   * - layerName: required, must be a tilelayer
   * - offsetX/offsetY: camera offset in pixels
   * - scale: default 1
   */
  drawLayer(ctx, { layerName, offsetX = 0, offsetY = 0, scale = 1 } = {}) {
    const layer = this.getLayer(layerName);
    if (layer.type !== 'tilelayer') {
      throw new Error(`Tilemap.drawLayer: layer is not a tilelayer ("${layerName}")`);
    }

    const data = layer.data;
    if (!Array.isArray(data)) return;

    const tw = this.tileWidth;
    const th = this.tileHeight;

    for (let y = 0; y < layer.height; y += 1) {
      for (let x = 0; x < layer.width; x += 1) {
        const idx = y * layer.width + x;
        const gid = data[idx] ?? 0;
        if (!gid) continue;

        const ts = findTilesetForGid(this.tilesets, gid);
        if (!ts) continue;

        const imgRec = this.images.get(ts.name);
        if (!imgRec?.image || !ts.columns) continue;

        const local = gid - ts.firstgid;
        const sx = (local % ts.columns) * ts.tileWidth;
        const sy = Math.floor(local / ts.columns) * ts.tileHeight;

        const dx = (x * tw - offsetX) * scale;
        const dy = (y * th - offsetY) * scale;

        ctx.drawImage(
          imgRec.image,
          sx,
          sy,
          ts.tileWidth,
          ts.tileHeight,
          dx,
          dy,
          ts.tileWidth * scale,
          ts.tileHeight * scale
        );
      }
    }
  }

  /**
   * Get simplified solid collision rectangles from a tile layer.
   *
   * A tile is considered solid when its tileset tile has property `solid=true`.
   * Returns an array of AABB rects: { x, y, w, h } in pixels (world coordinates).
   */
  getSolidRects({ layerName = 'Terrain', property = 'solid' } = {}) {
    const layer = this.getLayer(layerName);
    if (layer.type !== 'tilelayer') {
      throw new Error(`Tilemap.getSolidRects: layer is not a tilelayer ("${layerName}")`);
    }

    const rects = [];
    const data = layer.data;
    if (!Array.isArray(data)) return rects;

    const tw = this.tileWidth;
    const th = this.tileHeight;

    for (let y = 0; y < layer.height; y += 1) {
      for (let x = 0; x < layer.width; x += 1) {
        const idx = y * layer.width + x;
        const gid = data[idx] ?? 0;
        if (!gid) continue;

        const ts = findTilesetForGid(this.tilesets, gid);
        if (!ts) continue;

        const meta = ts._gidToTileMeta?.get(gid);
        const solid = getPropBool(meta?.properties, property);
        if (!solid) continue;

        rects.push({ x: x * tw, y: y * th, w: tw, h: th });
      }
    }

    return rects;
  }

  /**
   * Recommended conventional layer order (if you use these names).
   */
  getRecommendedLayerOrder() {
    return ['Background', 'Terrain', 'Props', 'Foreground'];
  }
}
