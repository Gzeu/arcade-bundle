# 2d-games backlog

Derivat din skill-ul `2d-games` (Sprites, Tilemaps, Physics, Camera, Genre Patterns, Anti-patterns).

## 1. Sprite Systems

1.1 Atlas
- Implement: atlas loader (image + JSON/CSV mapping nume->rect), API: `atlas.get(name)`.
- Accept: pot desena 20+ sprites dintr-un singur atlas fără schimbări de texture.

1.2 Animation
- Implement: `Animator` (frame sequences), control FPS (8–24 FPS tipic), loop/once.
- Accept: animația rulează consistent la framerate variabil (bazat pe delta time).

1.3 Pivot
- Implement: anchor/pivot per sprite (0..1), aplicat la rotate/scale.
- Accept: rotirea se face în jurul pivotului setat (ex: centru / picioare).

1.4 Layering
- Implement: `zIndex` + `layer` (ex: background, world, foreground, ui).
- Accept: ordinea de randare e deterministă și ușor de controlat.

## 2. Tilemap Design

2.1 Tile sizes
- Adopt: 16x16 / 32x32 / 64x64 ca standard, configurabil per map.
- Accept: camera + collision scalează corect indiferent de tile size.

2.2 Tilemap loader
- Implement: loader pentru format (preferabil Tiled JSON), suport pentru multiple layers.
- Accept: map-ul se poate încărca și randa fără custom code per joc.

2.3 Layers + parallax
- Implement: Background/Terrain/Props/Foreground; parallax pe Background/Foreground.
- Accept: parallax nu afectează coliziunile (doar randare).

2.4 Collision simplificat
- Implement: tile properties (ex: `solid=true`, `oneWay=true`, `damage=true`) -> collider simplu.
- Accept: coliziunile sunt stabile și predictibile; fără “complex shapes” by default.

## 3. 2D Physics

3.1 Fixed timestep
- Enforce: fixed timestep pentru update de physics (consistență).
- Accept: aceleași input-uri produc rezultate similare pe mașini diferite.

3.2 Collision shapes
- Implement etapizat: Box (AABB) -> Circle -> Capsule (player) -> Polygon (opțional).
- Accept: API comun `Collider` + `Body`.

3.3 Layers filtering
- Implement: bitmask layers/masks (cine colizionează cu cine) + triggers.
- Accept: putem dezactiva coliziuni între categorii (ex: player vs pickup = trigger).

3.4 “One approach” policy
- Decide: pixel-perfect *sau* physics-based per joc; documentat în fiecare game template.
- Accept: evităm mix care generează jitter/inconsistențe.

## 4. Camera Systems

4.1 Follow
- Implement: follow cu smoothing + clamp la bounds.
- Accept: cameră stabilă, fără jitter.

4.2 Look-ahead
- Implement: offset dinamic în direcția vitezei/aim-ului.
- Accept: jucătorul vede mai mult “în față” la viteze mari.

4.3 Room-based
- Implement: camere/zone (metroidvania) definite în map data.
- Accept: tranzitii previzibile între camere.

4.4 Screen shake
- Implement: `shake(durationMs=100, intensity=1)` cu easing-out.
- Accept: default 50–200ms; intensitate descrescătoare; ușor de folosit “sparingly”.

## 5. Genre Patterns

5.1 Platformer template
- Add: coyote time, jump buffering, variable jump height.
- Accept: Game-02 demonstrează clar cele 3 mecanici.

5.2 Top-down template
- Add: 8-dir/free movement, aim/auto-aim toggle, rotation toggle.
- Accept: Game-03 demonstrează 2 moduri (aim-based + auto-aim).

## 6. Anti-patterns (reguli)

6.1 Atlases over separate textures
- Rule: asset pipeline preferă atlase.

6.2 Simplified collision
- Rule: coliziuni simple by default; shapes complexe doar când e necesar.

6.3 Smooth camera
- Rule: follow cu smoothing; fără snap/jitter.

6.4 Choose pixel-perfect OR physics
- Rule: nu combinăm fără un motiv foarte bun (documentat).
