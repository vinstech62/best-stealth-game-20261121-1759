// Shadow Gallery — everything drawn on the canvas: the museum floor, walls,
// cover, vision cones, guards, the thief, artifacts, the exit, the HUD and
// every screen (menu, pause, level clear, game over, victory). All screens
// are drawn on canvas so a screenshot captures them exactly as played.
import {
  ALERT_THRESHOLD,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLORS,
  CONE_HALF_ANGLE,
  CONE_RANGE,
  GUARD_RADIUS,
  PLAYER_RADIUS,
  SUSPICIOUS_THRESHOLD,
} from './config.js';
import { createSeededRandom } from './random.js';
import { artifactsCollected, artifactsRemaining, isExitOpen } from './player.js';

function drawVisionCone(ctx, guard) {
  const alerted = guard.state === 'alerted';
  ctx.fillStyle = alerted ? COLORS.coneAlert : COLORS.cone;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.arc(
    guard.x,
    guard.y,
    CONE_RANGE,
    guard.facing - CONE_HALF_ANGLE,
    guard.facing + CONE_HALF_ANGLE,
  );
  ctx.closePath();
  ctx.fill();
}

function drawFloor(ctx, level, seed) {
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // Checkerboard tiles, then deterministic dust specks (seeded, cosmetic).
  ctx.fillStyle = COLORS.floorTile;
  const tile = 80;
  for (let ty = 0; ty < CANVAS_HEIGHT / tile; ty++) {
    for (let tx = 0; tx < CANVAS_WIDTH / tile; tx++) {
      if ((tx + ty) % 2 === 0) ctx.fillRect(tx * tile, ty * tile, tile, tile);
    }
  }
  const rng = createSeededRandom(seed);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 90; i++) {
    const x = rng() * CANVAS_WIDTH;
    const y = rng() * CANVAS_HEIGHT;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawWalls(ctx, level) {
  for (const wall of level.def.walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = COLORS.wallTop;
    ctx.fillRect(wall.x, wall.y, wall.w, 4);
  }
}

function drawShadowPatches(ctx, level) {
  for (const shadow of level.def.shadows) {
    ctx.fillStyle = COLORS.shadow;
    ctx.fillRect(shadow.x, shadow.y, shadow.w, shadow.h);
    ctx.strokeStyle = 'rgba(120, 120, 180, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(shadow.x + 1, shadow.y + 1, shadow.w - 2, shadow.h - 2);
  }
}

function drawBushes(ctx, level) {
  for (const bush of level.def.bushes) {
    ctx.fillStyle = COLORS.bush;
    ctx.beginPath();
    ctx.arc(bush.x, bush.y, bush.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.bushLeaf;
    ctx.beginPath();
    ctx.arc(bush.x - bush.r * 0.3, bush.y - bush.r * 0.25, bush.r * 0.45, 0, Math.PI * 2);
    ctx.arc(bush.x + bush.r * 0.35, bush.y + bush.r * 0.2, bush.r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCrates(ctx, level) {
  for (const crate of level.def.crates) {
    ctx.fillStyle = COLORS.crate;
    ctx.fillRect(crate.x, crate.y, crate.w, crate.h);
    ctx.fillStyle = COLORS.crateTop;
    ctx.fillRect(crate.x, crate.y, crate.w, 5);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(crate.x + 1, crate.y + 1, crate.w - 2, crate.h - 2);
    ctx.beginPath();
    ctx.moveTo(crate.x, crate.y);
    ctx.lineTo(crate.x + crate.w, crate.y + crate.h);
    ctx.moveTo(crate.x + crate.w, crate.y);
    ctx.lineTo(crate.x, crate.y + crate.h);
    ctx.stroke();
  }
}

function drawArtifacts(ctx, level, timeSeconds) {
  for (const artifact of level.artifacts) {
    if (artifact.taken) continue;
    const pulse = 0.75 + 0.25 * Math.sin(timeSeconds * 3 + artifact.x);
    ctx.fillStyle = `rgba(255, 217, 74, ${0.25 * pulse})`;
    ctx.beginPath();
    ctx.arc(artifact.x, artifact.y, 22 * pulse + 6, 0, Math.PI * 2);
    ctx.fill();
    // A glowing gem: rotated square with a bright core.
    ctx.save();
    ctx.translate(artifact.x, artifact.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = COLORS.artifact;
    ctx.fillRect(-8, -8, 16, 16);
    ctx.fillStyle = '#fff3b0';
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();
  }
}

function drawExit(ctx, level) {
  const exit = level.def.exit;
  const open = isExitOpen(level);
  ctx.fillStyle = open ? COLORS.exitOpen : COLORS.exitLocked;
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(exit.x + 8, exit.y + 8, exit.w - 16, exit.h - 16);
  ctx.fillStyle = open ? '#eaffea' : '#c9c9d4';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(open ? 'EXIT' : 'LOCKED', exit.x + exit.w / 2, exit.y + exit.h / 2);
}

function drawGuard(ctx, guard) {
  const alerted = guard.state === 'alerted';
  const suspicious = guard.state === 'suspicious';
  ctx.fillStyle = alerted
    ? COLORS.guardAlerted
    : suspicious
      ? COLORS.guardSuspicious
      : COLORS.guard;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, GUARD_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  // Facing tick so the patrol direction reads at a glance.
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.lineTo(
    guard.x + Math.cos(guard.facing) * (GUARD_RADIUS + 7),
    guard.y + Math.sin(guard.facing) * (GUARD_RADIUS + 7),
  );
  ctx.stroke();
  // "?" while suspicious, "!" while alerted.
  if (suspicious || alerted) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(alerted ? '!' : '?', guard.x, guard.y - GUARD_RADIUS - 4);
  }
  // Small detection arc over the guard while the meter is rising.
  if (guard.detection > 2) {
    ctx.strokeStyle = guard.detection >= ALERT_THRESHOLD ? '#ff5a4a' : '#ffd94a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
      guard.x,
      guard.y,
      GUARD_RADIUS + 6,
      -Math.PI / 2,
      -Math.PI / 2 + (guard.detection / 100) * Math.PI * 2,
    );
    ctx.stroke();
  }
}

function drawPlayer(ctx, player) {
  ctx.fillStyle = player.sneaking ? COLORS.playerSneak : COLORS.player;
  ctx.beginPath();
  ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b2b33';
  ctx.beginPath();
  ctx.arc(player.x - 4, player.y - 3, 2.5, 0, Math.PI * 2);
  ctx.arc(player.x + 4, player.y - 3, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Hidden ring: the player is invisible to guards right now.
  if (player.hidden) {
    ctx.strokeStyle = '#7dff8a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, PLAYER_RADIUS + 5, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawHud(ctx, state) {
  const { level, player, guards, lives, elapsedSeconds, sound } = state;
  ctx.fillStyle = 'rgba(10, 10, 16, 0.78)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 44);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(level.def.name, 14, 22);

  const collected = artifactsCollected(level);
  const total = level.artifacts.length;
  ctx.fillText(`Artifacts ${collected}/${total}`, 250, 22);

  // Detection bar: the highest meter among all guards.
  const highest = guards.reduce((max, g) => Math.max(max, g.detection), 0);
  ctx.fillText('Seen', 420, 22);
  ctx.fillStyle = '#1c1c26';
  ctx.fillRect(470, 13, 140, 18);
  ctx.fillStyle =
    highest >= ALERT_THRESHOLD
      ? COLORS.hudBarDanger
      : highest >= SUSPICIOUS_THRESHOLD
        ? '#e67e22'
        : COLORS.hudBar;
  ctx.fillRect(470, 13, (highest / 100) * 140, 18);
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.strokeRect(470, 13, 140, 18);

  ctx.fillStyle = COLORS.hudText;
  ctx.fillText(`Lives ${'♥'.repeat(lives)}${'♡'.repeat(Math.max(0, 3 - lives))}`, 640, 22);
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = Math.floor(elapsedSeconds % 60);
  ctx.fillText(
    `Time ${minutes}:${String(seconds).padStart(2, '0')}`,
    790,
    22,
  );
  ctx.fillText(sound.muted ? 'MUTED' : player.sneaking ? 'SNEAK' : '', 880, 22);
}

function drawCenteredPanel(ctx, title, lines) {
  ctx.fillStyle = 'rgba(8, 8, 14, 0.82)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = COLORS.hudText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText(title, CANVAS_WIDTH / 2, 170);
  ctx.font = '17px sans-serif';
  lines.forEach((line, index) => {
    ctx.fillText(line, CANVAS_WIDTH / 2, 250 + index * 30);
  });
}

function drawMenuScreen(ctx) {
  drawCenteredPanel(ctx, 'SHADOW GALLERY', [
    'You are a thief in a night museum. Take every artifact,',
    'then slip out the exit — without ever being seen.',
    '',
    'Move: WASD or Arrow keys      Sneak: hold Shift (slower, harder to spot)',
    'Hide in green bushes and dark shadow patches. Crates block a guard’s sight.',
    'Watch the yellow vision cones. “?” means suspicious, “!” means run.',
    'M: mute    R: restart level    P: pause',
    '',
    'Press Enter to begin',
  ]);
}

function drawPausedScreen(ctx) {
  drawCenteredPanel(ctx, 'PAUSED', ['Press P to keep playing', 'R restarts the level']);
}

function drawLevelClearScreen(ctx, state) {
  drawCenteredPanel(ctx, 'GALLERY CLEARED', [
    `${state.level.def.name} — all artifacts taken, exit reached.`,
    `Time: ${Math.floor(state.elapsedSeconds / 60)}:${String(
      Math.floor(state.elapsedSeconds % 60),
    ).padStart(2, '0')}`,
    '',
    'Press Enter for the next gallery',
  ]);
}

function drawGameOverScreen(ctx, state) {
  drawCenteredPanel(ctx, 'CAUGHT!', [
    `The guards found you in ${state.level.def.name}.`,
    `Artifacts taken: ${artifactsCollected(state.level)}/${state.level.artifacts.length}`,
    '',
    'Press Enter to try again',
  ]);
}

function drawVictoryScreen(ctx, state) {
  drawCenteredPanel(ctx, 'MASTER THIEF', [
    'All three galleries emptied. Not a single alarm that mattered.',
    `Total time: ${Math.floor(state.totalSeconds / 60)}:${String(
      Math.floor(state.totalSeconds % 60),
    ).padStart(2, '0')}`,
    '',
    'Press Enter to play again',
  ]);
}

// The single render entry point: draws the world, then the HUD, then the
// screen overlay for the current state.
export function renderGame(ctx, state) {
  const { level, guards, player, timeSeconds } = state;
  drawFloor(ctx, level, 1234 + state.levelIndex * 77);
  drawShadowPatches(ctx, level);
  drawBushes(ctx, level);
  drawCrates(ctx, level);
  drawArtifacts(ctx, level, timeSeconds);
  drawExit(ctx, level);
  for (const guard of guards) drawVisionCone(ctx, guard);
  drawWalls(ctx, level);
  for (const guard of guards) drawGuard(ctx, guard);
  drawPlayer(ctx, player);
  drawHud(ctx, state);

  switch (state.screen) {
    case 'menu':
      drawMenuScreen(ctx);
      break;
    case 'paused':
      drawPausedScreen(ctx);
      break;
    case 'levelclear':
      drawLevelClearScreen(ctx, state);
      break;
    case 'gameover':
      drawGameOverScreen(ctx, state);
      break;
    case 'victory':
      drawVictoryScreen(ctx, state);
      break;
    default:
      break;
  }
}
