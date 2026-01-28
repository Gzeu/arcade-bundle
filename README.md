# arcade-bundle

Monorepo pentru un "arcade bundle" (10 mini-jocuri) + un `engine2d` comun (web-first, ESM).

## Ce include acum
- `packages/engine2d/`: core (game loop fixed timestep, input actions, coliziuni simple, cameră).
- `apps/launcher/`: launcher static (meniul care deschide jocurile).
- `games/game-01/`: demo minimal care folosește engine2d.

## Rulare locală (fără build tools)
1. Clone:
   ```bash
   git clone https://github.com/Gzeu/arcade-bundle
   cd arcade-bundle
   ```
2. Pornește un server static din root (oricare):
   - Python:
     ```bash
     python -m http.server 5173
     ```
   - Node:
     ```bash
     npx serve .
     ```
3. Deschide:
   - `http://localhost:5173/apps/launcher/`

## Next
- Adăugăm `games/game-02..10` prin copierea unui `game-template/`.
- Dacă vrei Phaser/Pixi, păstrăm `engine2d` ca layer comun (input/loop/camera) și schimbăm doar renderer-ul.
