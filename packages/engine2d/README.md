# @arcade/engine2d

Core minimal pentru jocuri 2D web (ESM), gândit să fie reutilizat în 10 mini-jocuri.

## Include
- Game loop (fixed timestep)
- Input pe actions
- Coliziuni simple (AABB + layer/mask filtering)
- Cameră (follow + smoothing + clamp + shake)

## Utilizare (în browser)
În demo-ul `games/game-01` importăm direct din `packages/engine2d/src/index.js`.

Dacă vrei, următorul pas este să-l publicăm ca package și să facem import prin `@arcade/engine2d` (cu un bundler).
