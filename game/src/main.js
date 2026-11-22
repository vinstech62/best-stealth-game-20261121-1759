// Shadow Gallery — game loop and state machine. Screens: menu, playing,
// paused, levelclear, gameover, victory. A ?shot=cover|hide|alert|level3
// query parameter renders one deterministic screenshot scene instead of
// starting the game (used to capture the entry screenshots).
import { CANVAS_HEIGHT, CANVAS_WIDTH, LIVES_START } from './config.js';
import { LEVELS } from './levels.js';
import { loadLevel } from './world.js';
import { createGuard, guardHasCaughtPlayer, updateGuard } from './guard.js';
import {
  artifactsCollected,
  createPlayer,
  isPlayerOnExit,
  tryPickupArtifact,
  updatePlayer,
} from './player.js';
import { SoundEngine } from './audio.js';
import { KeyboardInput } from './input.js';
import { renderGame } from './render.js';
import { buildShotScene } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = new KeyboardInput();
const sound = new SoundEngine();

const state = {
  screen: 'menu', // menu | playing | paused | levelclear | gameover | victory
  levelIndex: 0,
  level: null,
  guards: [],
  player: null,
  lives: LIVES_START,
  elapsedSeconds: 0,
  totalSeconds: 0,
  timeSeconds: 0,
  sound,
};

function startLevel(levelIndex) {
  const levelDef = LEVELS[levelIndex];
  state.levelIndex = levelIndex;
  state.level = loadLevel(levelDef);
  state.guards = levelDef.guards.map((def) => createGuard(def, state.level));
  state.player = createPlayer(levelDef.playerStart);
  state.elapsedSeconds = 0;
  state.screen = 'playing';
}

function startNewGame() {
  state.lives = LIVES_START;
  state.totalSeconds = 0;
  startLevel(0);
}

function loseLife() {
  sound.playSting();
  state.lives -= 1;
  if (state.lives <= 0) {
    state.screen = 'gameover';
  } else {
    startLevel(state.levelIndex);
  }
}

function updatePlaying(dt) {
  state.elapsedSeconds += dt;
  state.timeSeconds += dt;
  updatePlayer(state.player, dt, input, state.level, state.guards);
  tryPickupArtifact(state.player, state.level, sound);
  for (const guard of state.guards) {
    updateGuard(guard, dt, state.player, state.level, state.guards, sound);
  }
  for (const guard of state.guards) {
    if (guardHasCaughtPlayer(guard, state.player)) {
      loseLife();
      return;
    }
  }
  if (isPlayerOnExit(state.player, state.level)) {
    sound.playFanfare();
    state.totalSeconds += state.elapsedSeconds;
    if (state.levelIndex + 1 >= LEVELS.length) {
      state.screen = 'victory';
    } else {
      state.screen = 'levelclear';
    }
  }
}

function handleScreenKeys() {
  if (input.wasPressed('KeyM')) sound.toggleMute();
  if (state.screen === 'menu' && input.wasPressed('Enter')) startNewGame();
  if (state.screen === 'levelclear' && input.wasPressed('Enter')) {
    startLevel(state.levelIndex + 1);
  }
  if (state.screen === 'gameover' && input.wasPressed('Enter')) startNewGame();
  if (state.screen === 'victory' && input.wasPressed('Enter')) startNewGame();
  if (state.screen === 'playing' && input.wasPressed('KeyP')) state.screen = 'paused';
  else if (state.screen === 'paused' && input.wasPressed('KeyP')) state.screen = 'playing';
  if (state.screen === 'playing' && input.wasPressed('KeyR')) startLevel(state.levelIndex);
}

function frame(timestamp) {
  // First frame: seed the clock instead of computing a huge first delta.
  if (!frame.lastTimestamp) frame.lastTimestamp = timestamp;
  const dt = Math.min(0.05, (timestamp - frame.lastTimestamp) / 1000);
  frame.lastTimestamp = timestamp;
  sound.ensureAudio();
  handleScreenKeys();
  if (state.screen === 'playing') updatePlaying(dt);
  renderGame(ctx, state);
  input.clearPressed();
  requestAnimationFrame(frame);
}
frame.lastTimestamp = 0;

// Screenshot mode: ?shot=cover&seed=1 renders one fixed scene and stops.
const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
if (shotName) {
  const scene = buildShotScene(shotName);
  if (scene) {
    Object.assign(state, scene, { sound });
    renderGame(ctx, state);
  } else {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Unknown shot: ${shotName}`, 20, 40);
  }
} else {
  state.level = loadLevel(LEVELS[0]);
  state.guards = LEVELS[0].guards.map((def) => createGuard(def, state.level));
  state.player = createPlayer(LEVELS[0].playerStart);
  requestAnimationFrame(frame);
}
