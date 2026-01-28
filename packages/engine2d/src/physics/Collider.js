export const Layers = {
  DEFAULT: 1 << 0,
  PLAYER: 1 << 1,
  WALL: 1 << 2,
  TRIGGER: 1 << 3,
};

export const aabb = ({ x, y, w, h, layer = Layers.DEFAULT, mask = 0xffffffff, isTrigger = false }) => ({
  kind: 'aabb',
  x,
  y,
  w,
  h,
  layer,
  mask,
  isTrigger,
});

export const aabbIntersects = (A, B) =>
  A.x < B.x + B.w &&
  A.x + A.w > B.x &&
  A.y < B.y + B.h &&
  A.y + A.h > B.y;

export const canCollide = (A, B) => ((A.mask & B.layer) !== 0) && ((B.mask & A.layer) !== 0);
