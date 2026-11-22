// Shadow Gallery — deterministic screenshot scenes. Each scene builds a
// real game state (a loaded level, a placed player, guards with fixed
// positions, facings and detection meters) and renders one frame from it.
// No autoplay simulation: the picture is exactly the state described here,
// so the same seed always produces the same screenshot.
import { LEVELS } from './levels.js';
import { loadLevel } from './world.js';
import { createGuard } from './guard.js';
import { createPlayer } from './player.js';

function buildBaseState(levelIndex, screen = 'playing') {
  const levelDef = LEVELS[levelIndex];
  const level = loadLevel(levelDef);
  return {
    screen,
    levelIndex,
    level,
    guards: levelDef.guards.map((def) => createGuard(def, level)),
    player: createPlayer(levelDef.playerStart),
    lives: 3,
    elapsedSeconds: 0,
    totalSeconds: 0,
    timeSeconds: 0,
  };
}

function placeGuard(guard, x, y, facingDegrees, detection, stateName) {
  guard.x = x;
  guard.y = y;
  guard.facing = (facingDegrees * Math.PI) / 180;
  guard.detection = detection;
  guard.state = stateName;
  guard.lastSeen = { x: guard.x + 60, y: guard.y };
}

// cover — Level 1 mid-play: the thief crouched in a bush, a guard cone
// sweeping close by, one artifact glowing, the locked exit visible.
export function buildCoverScene() {
  const state = buildBaseState(0);
  state.player.x = 180;
  state.player.y = 180;
  state.player.sneaking = true;
  state.player.hidden = true;
  state.elapsedSeconds = 42;
  state.timeSeconds = 1.5;
  placeGuard(state.guards[0], 360, 240, 180, 42, 'suspicious');
  placeGuard(state.guards[1], 760, 420, 270, 8, 'patrol');
  return state;
}

// hide — the thief deep inside a bush while a guard cone passes right over
// it; the meter is falling, the player is safe.
export function buildHideScene() {
  const state = buildBaseState(0);
  state.player.x = 480;
  state.player.y = 520;
  state.player.sneaking = true;
  state.player.hidden = true;
  state.elapsedSeconds = 88;
  state.timeSeconds = 2.4;
  state.level.artifacts[0].taken = true;
  placeGuard(state.guards[0], 480, 380, 90, 18, 'patrol');
  placeGuard(state.guards[1], 790, 470, 180, 0, 'patrol');
  return state;
}

// alert — a guard fully alerted ("!"), chasing the thief across the hall.
export function buildAlertScene() {
  const state = buildBaseState(1);
  state.player.x = 480;
  state.player.y = 300;
  state.player.sneaking = false;
  state.elapsedSeconds = 134;
  state.timeSeconds = 3.1;
  state.level.artifacts[2].taken = true;
  placeGuard(state.guards[0], 380, 300, 0, 92, 'alerted');
  placeGuard(state.guards[1], 760, 300, 180, 55, 'suspicious');
  placeGuard(state.guards[2], 600, 240, 135, 20, 'patrol');
  return state;
}

// level3 — Level 3 overview: all four guards on patrol, three artifacts,
// the locked exit glowing in the corner.
export function buildLevel3Scene() {
  const state = buildBaseState(2);
  state.player.x = 60;
  state.player.y = 320;
  state.player.sneaking = true;
  state.elapsedSeconds = 12;
  state.timeSeconds = 0.8;
  placeGuard(state.guards[0], 340, 180, 0, 0, 'patrol');
  placeGuard(state.guards[1], 590, 210, 90, 0, 'patrol');
  placeGuard(state.guards[2], 840, 300, 180, 0, 'patrol');
  placeGuard(state.guards[3], 330, 540, 0, 0, 'patrol');
  return state;
}

export const SHOT_SCENES = {
  cover: buildCoverScene,
  hide: buildHideScene,
  alert: buildAlertScene,
  level3: buildLevel3Scene,
};

export function buildShotScene(name) {
  const builder = SHOT_SCENES[name];
  return builder ? builder() : null;
}
