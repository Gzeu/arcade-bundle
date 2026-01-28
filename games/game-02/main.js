import {
  GameLoop,
  Input,
  World2D,
  Camera2D,
  Collider,
  Tilemap,
  TilemapColliderBuilder,
  Atlas,
  Animator
} from '../../packages/engine2d/src/index.js';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

// --- Config ---
const GRAVITY = 1000;
const MOVE_SPEED = 180;
const JUMP_FORCE = -420;
const COYOTE_TIME = 0.1; // seconds
const JUMP_BUFFER = 0.1; // seconds

// --- State ---
let map, world, camera, player;
let playerAnim, playerAtlas;

const state = {
  vy: 0,
  isGrounded: false,
  coyoteTimer: 0,
  jumpBufferTimer: 0,
  facingRight: true,
};

const input = new Input({
  binds: {
    left: ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
    jump: ['Space', 'ArrowUp', 'KeyW'],
    down: ['ArrowDown', 'KeyS'],
  },
});
input.attach();

// --- Init ---
async function init() {
  // 1. Load Assets (placeholders presumed)
  try {
    map = await Tilemap.load({ url: 'assets/map.json' });
    // Example atlas loading - replace with real paths
    // playerAtlas = await Atlas.load({ imageUrl: 'assets/hero.png', dataUrl: 'assets/hero.json' });
  } catch (e) {
    console.warn("Assets failed to load (expected if files missing):", e);
    // Fallback for demo without assets
    map = { 
      width: 40, height: 20, tileWidth: 32, tileHeight: 32, 
      drawLayer: () => {}, 
      getSolidRects: () => [
        { x: 0, y: 500, w: 1000, h: 40 }, // floor
        { x: 300, y: 400, w: 200, h: 20 }, // plat
      ]
    };
  }

  // 2. Setup World
  world = new World2D();
  
  // 3. Build Map Colliders
  if (map.getSolidRects) {
    // Uses the bridge helper
    TilemapColliderBuilder.build(map, world, { layerName: 'Terrain' });
  } else {
    // Fallback static rects
    world.addStaticRects([
       { x: 0, y: 500, w: 1000, h: 40 },
       { x: 300, y: 400, w: 200, h: 20 }
    ]);
  }

  // 4. Setup Player
  player = new Collider({
    x: 100, y: 300, w: 20, h: 32,
    kind: 'aabb',
    layer: 2, // Player layer
    mask: 1,  // Hits Terrain (layer 1)
  });
  world.add(player);

  // Setup Animation (mock)
  playerAnim = new Animator();
  playerAnim.define('idle', { frames: ['idle'], fps: 1, loop: true });
  playerAnim.define('run', { frames: ['run_0', 'run_1', 'run_2'], fps: 10, loop: true });
  playerAnim.define('jump', { frames: ['jump'], fps: 1, loop: false });
  playerAnim.play('idle');

  // 5. Setup Camera
  camera = new Camera2D({
    width: canvas.width, height: canvas.height,
    smoothing: 8
  });
  // Set bounds matching map size in pixels
  const mw = (map.width || 40) * (map.tileWidth || 32);
  const mh = (map.height || 20) * (map.tileHeight || 32);
  camera.setBounds(0, 0, mw, mh);
  camera.follow(player);

  resize();
}

// --- Loop ---
function update(dt) {
  input.beginFrame();
  const rawInput = input.snapshot();

  // Horizontal Movement
  const dx = rawInput.axis('move_x'); // -1 to 1
  const vx = dx * MOVE_SPEED;

  if (dx > 0) state.facingRight = true;
  if (dx < 0) state.facingRight = false;

  // Move X
  world.moveAABB(player, vx * dt, 0, (hit) => {
    // hit wall side
  });

  // Gravity & Jumping
  state.vy += GRAVITY * dt;

  // Jump Buffering
  if (rawInput.pressed('jump')) {
    state.jumpBufferTimer = JUMP_BUFFER;
  }
  if (state.jumpBufferTimer > 0) state.jumpBufferTimer -= dt;

  // Coyote Timer
  if (state.isGrounded) {
    state.coyoteTimer = COYOTE_TIME;
  } else {
    state.coyoteTimer -= dt;
  }

  // Jump Execution
  if (state.jumpBufferTimer > 0 && state.coyoteTimer > 0) {
    state.vy = JUMP_FORCE;
    state.jumpBufferTimer = 0;
    state.coyoteTimer = 0;
    state.isGrounded = false;
  }

  // Variable Jump Height (release space to cut jump)
  if (!rawInput.held('jump') && state.vy < -50) {
    state.vy *= 0.5;
  }

  // Move Y
  state.isGrounded = false;
  world.moveAABB(player, 0, state.vy * dt, (hit) => {
    // If we hit something and we were moving down, we landed
    if (state.vy > 0 && player.y + player.h <= hit.y + 5) {
      state.isGrounded = true;
      state.vy = 0;
    }
    // Head bonk
    if (state.vy < 0 && player.y >= hit.y + hit.h - 5) {
      state.vy = 0;
    }
  });

  // Animation State
  playerAnim.update(dt);
  if (!state.isGrounded) {
    playerAnim.play('jump', { reset: false });
  } else if (Math.abs(vx) > 10) {
    playerAnim.play('run', { reset: false });
  } else {
    playerAnim.play('idle', { reset: false });
  }

  // Camera
  camera.update(dt);
}

function render() {
  // Resize handling
  if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
    resize();
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply Camera
  ctx.translate(-camera.viewX, -camera.viewY);

  // Draw Map
  if (map.drawLayer) {
    map.drawLayer(ctx, { layerName: 'Background' });
    map.drawLayer(ctx, { layerName: 'Terrain' });
  }

  // Draw Player
  // Fallback rect if no atlas
  if (!playerAtlas) {
    ctx.fillStyle = '#ff0044';
    ctx.fillRect(player.x, player.y, player.w, player.h);
  } else {
    // Atlas drawing
    playerAtlas.draw(ctx, playerAnim.frameName, player.x + player.w/2, player.y + player.h, {
      pivotX: 0.5, pivotY: 1,
      flipX: !state.facingRight
    });
  }

  // Draw Foreground
  if (map.drawLayer) map.drawLayer(ctx, { layerName: 'Foreground' });

  // Debug Visualization
  // ctx.strokeStyle = 'yellow';
  // for(const c of world.colliders) ctx.strokeRect(c.x, c.y, c.w, c.h);
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (camera) {
      camera.width = canvas.width;
      camera.height = canvas.height;
  }
}

new GameLoop({ update, render }).start();
init();
