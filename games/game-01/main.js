import { GameLoop, Input, World2D, Camera2D, aabb, Layers } from '../../packages/engine2d/src/index.js';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const DPR = Math.min(2, window.devicePixelRatio || 1);
const resize = () => {
  canvas.width = Math.floor(window.innerWidth * DPR);
  canvas.height = Math.floor(window.innerHeight * DPR);
};
window.addEventListener('resize', resize);
resize();

const input = new Input({
  binds: {
    move_left: ['ArrowLeft', 'KeyA'],
    move_right: ['ArrowRight', 'KeyD'],
    move_up: ['ArrowUp', 'KeyW'],
    move_down: ['ArrowDown', 'KeyS'],
    shake: ['Space'],
  },
});
input.attach();

const world = new World2D();

// World bounds (în coordonate world)
const WORLD_W = 1600;
const WORLD_H = 900;

// Walls
const walls = [
  aabb({ x: 0, y: 0, w: WORLD_W, h: 20, layer: Layers.WALL, mask: 0xffffffff }),
  aabb({ x: 0, y: WORLD_H - 20, w: WORLD_W, h: 20, layer: Layers.WALL, mask: 0xffffffff }),
  aabb({ x: 0, y: 0, w: 20, h: WORLD_H, layer: Layers.WALL, mask: 0xffffffff }),
  aabb({ x: WORLD_W - 20, y: 0, w: 20, h: WORLD_H, layer: Layers.WALL, mask: 0xffffffff }),
  aabb({ x: 420, y: 220, w: 260, h: 40, layer: Layers.WALL, mask: 0xffffffff }),
  aabb({ x: 900, y: 520, w: 360, h: 40, layer: Layers.WALL, mask: 0xffffffff }),
];
for (const w of walls) world.add(w);

// Player collider
const player = world.add(
  aabb({
    x: 120,
    y: 120,
    w: 28,
    h: 28,
    layer: Layers.PLAYER,
    mask: Layers.WALL, // lovește doar walls
  })
);

const camera = new Camera2D({
  bounds: { minX: 0, minY: 0, maxX: WORLD_W, maxY: WORLD_H },
  smoothing: 10,
});

const SPEED = 240; // px/s

const update = (dt) => {
  input.beginFrame();
  const s = input.snapshot();

  const mx = s.axis('move_x');
  const my = s.axis('move_y');
  const len = Math.hypot(mx, my) || 1;
  const vx = (mx / len) * SPEED;
  const vy = (my / len) * SPEED;

  world.moveAABB(player, vx * dt, vy * dt);

  if (s.pressed('shake')) camera.shake(0.12, 10);

  camera.follow(player.x + player.w / 2, player.y + player.h / 2, dt);
};

const render = () => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Center camera on screen
  const { ox, oy } = camera.offset;
  const cx = ox - (canvas.width / DPR) / 2;
  const cy = oy - (canvas.height / DPR) / 2;

  ctx.scale(DPR, DPR);
  ctx.translate(-cx, -cy);

  // Background grid
  ctx.fillStyle = '#070a12';
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  for (let x = 0; x <= WORLD_W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD_H);
    ctx.stroke();
  }
  for (let y = 0; y <= WORLD_H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD_W, y);
    ctx.stroke();
  }

  // Walls
  ctx.fillStyle = 'rgba(120,180,255,0.18)';
  for (const w of walls) ctx.fillRect(w.x, w.y, w.w, w.h);

  // Player
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Player outline
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.strokeRect(player.x + 0.5, player.y + 0.5, player.w - 1, player.h - 1);
};

new GameLoop({ fixedDt: 1 / 60, update, render }).start();
