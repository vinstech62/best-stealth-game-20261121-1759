// Shadow Gallery — the thief: WASD/arrows to move, Shift to sneak, picking
// up artifacts and reaching the exit once every artifact is collected.
import {
  ARTIFACT_PICKUP_RADIUS,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  SNEAK_SPEED,
} from './config.js';
import { isPlayerHidden, moveCircleWithCollision } from './world.js';

export function createPlayer(start) {
  return {
    x: start.x,
    y: start.y,
    sneaking: false,
    hidden: false,
    moving: false,
  };
}

export function updatePlayer(player, dt, input, level, guards) {
  let dx = 0;
  let dy = 0;
  if (input.isDown('ArrowLeft') || input.isDown('KeyA')) dx -= 1;
  if (input.isDown('ArrowRight') || input.isDown('KeyD')) dx += 1;
  if (input.isDown('ArrowUp') || input.isDown('KeyW')) dy -= 1;
  if (input.isDown('ArrowDown') || input.isDown('KeyS')) dy += 1;

  player.sneaking = input.isDown('ShiftLeft') || input.isDown('ShiftRight');
  player.moving = dx !== 0 || dy !== 0;

  if (player.moving) {
    const length = Math.hypot(dx, dy);
    const speed = player.sneaking ? SNEAK_SPEED : PLAYER_SPEED;
    const moved = moveCircleWithCollision(
      player.x,
      player.y,
      (dx / length) * speed * dt,
      (dy / length) * speed * dt,
      PLAYER_RADIUS,
      level,
    );
    player.x = moved.x;
    player.y = moved.y;
  }

  player.hidden = isPlayerHidden(player, guards, level);
}

// Take any artifact the player is standing on. Returns the artifact taken.
export function tryPickupArtifact(player, level, sound) {
  for (const artifact of level.artifacts) {
    if (artifact.taken) continue;
    const dist = Math.hypot(artifact.x - player.x, artifact.y - player.y);
    if (dist < ARTIFACT_PICKUP_RADIUS) {
      artifact.taken = true;
      sound.playChime();
      return artifact;
    }
  }
  return null;
}

export function artifactsRemaining(level) {
  return level.artifacts.filter((a) => !a.taken).length;
}

export function artifactsCollected(level) {
  return level.artifacts.filter((a) => a.taken).length;
}

// The exit opens only after every artifact is collected.
export function isExitOpen(level) {
  return artifactsRemaining(level) === 0;
}

export function isPlayerOnExit(player, level) {
  if (!isExitOpen(level)) return false;
  const e = level.def.exit;
  return player.x >= e.x && player.x <= e.x + e.w && player.y >= e.y && player.y <= e.y + e.h;
}
