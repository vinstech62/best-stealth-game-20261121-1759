// Shadow Gallery — world queries: loading a level, moving a circle through
// walls/crates, testing cover, and raycasting line of sight.
import { HIDE_CLOSE_RANGE, PLAYER_RADIUS } from './config.js';

// Deep-copy a level definition into live state (artifacts get a taken flag).
export function loadLevel(levelDef) {
  return {
    def: levelDef,
    artifacts: levelDef.artifacts.map((a) => ({ x: a.x, y: a.y, taken: false })),
  };
}

export function allSolidRects(level) {
  return [...level.def.walls, ...level.def.crates];
}

function circleHitsRect(x, y, radius, rect) {
  const nearestX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - nearestX;
  const dy = y - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

export function circleCollidesWithWorld(x, y, radius, level) {
  return allSolidRects(level).some((rect) => circleHitsRect(x, y, radius, rect));
}

// Move a circle by (dx, dy), sliding along walls: resolve X first, then Y.
export function moveCircleWithCollision(x, y, dx, dy, radius, level) {
  let nextX = x + dx;
  if (circleCollidesWithWorld(nextX, y, radius, level)) nextX = x;
  let nextY = y + dy;
  if (circleCollidesWithWorld(nextX, nextY, radius, level)) nextY = y;
  return { x: nextX, y: nextY };
}

// --- Line of sight -------------------------------------------------------
// True when the segment (x1,y1)-(x2,y2) is NOT blocked by any wall or crate.
export function hasLineOfSight(x1, y1, x2, y2, level) {
  return !allSolidRects(level).some((rect) => segmentHitsRect(x1, y1, x2, y2, rect));
}

// Slab-method segment vs axis-aligned rectangle test.
export function segmentHitsRect(x1, y1, x2, y2, rect) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tMin = 0;
  let tMax = 1;
  // Clip the segment's parameter range against one axis at a time.
  const clipAxis = (origin, delta, low, high) => {
    if (Math.abs(delta) < 1e-9) return origin >= low && origin <= high;
    let t1 = (low - origin) / delta;
    let t2 = (high - origin) / delta;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    return tMin <= tMax;
  };
  if (!clipAxis(x1, dx, rect.x, rect.x + rect.w)) return false;
  if (!clipAxis(y1, dy, rect.y, rect.y + rect.h)) return false;
  return true;
}

// --- Cover ---------------------------------------------------------------
export function isPointInBush(x, y, level) {
  return level.def.bushes.some((b) => {
    const dx = x - b.x;
    const dy = y - b.y;
    return dx * dx + dy * dy <= b.r * b.r;
  });
}

export function isPointInShadow(x, y, level) {
  return level.def.shadows.some(
    (s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h,
  );
}

export function isPlayerHidden(player, guards, level) {
  const inCover =
    isPointInBush(player.x, player.y, level) || isPointInShadow(player.x, player.y, level);
  if (!inCover) return false;
  // A guard standing almost on top of the hiding spot still sees the player.
  return !guards.some((g) => distanceBetween(g.x, g.y, player.x, player.y) < HIDE_CLOSE_RANGE);
}

export function distanceBetween(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function clampToCanvas(x, y) {
  return {
    x: Math.max(PLAYER_RADIUS, Math.min(960 - PLAYER_RADIUS, x)),
    y: Math.max(PLAYER_RADIUS, Math.min(640 - PLAYER_RADIUS, y)),
  };
}
