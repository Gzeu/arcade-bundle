## Tilemaps (Tiled JSON)

`engine2d` include un loader minimal pentru tilemaps exportate din Tiled (JSON) + helpers pentru randare pe Canvas2D și coliziuni simplificate.

- `Tilemap.load({ url })`
- `tilemap.drawLayer(ctx, { layerName, offsetX, offsetY, scale })`
- `tilemap.getSolidRects({ layerName, property: 'solid' })`
