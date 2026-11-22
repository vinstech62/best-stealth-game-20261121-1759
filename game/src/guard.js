// Shadow Gallery — guard behaviour: a fixed, learnable patrol loop plus a
// suspicion / alert state machine driven by the detection meter.
//
// States: patrol -> suspicious (pauses, looks at the player) -> alerted
// (chases the last seen position) -> search (looks around, cools down) ->
// patrol. The meter rises only while the player is inside the vision cone
// with a clear line of sight and not hidden; it decays ~25/s otherwise,
// so a near-miss can always be recovered from.
import {
  ALERT_THRESHOLD,
  CAUGHT_THRESHOLD,
  CONE_HALF_ANGLE,
  CONE_RANGE,
  DETECTION_BASE_RATE,
  DETECTION_DECAY_RATE,
  GUARD_CHASE_SPEED_MULTIPLIER,
  GUARD_RADIUS,
  GUARD_TOUCH_CATCH_RADIUS,
  SEARCH_SECONDS,
  SNEAK_VISIBILITY,
  SUSPICIOUS_THRESHOLD,
  WAYPOINT_PAUSE_SECONDS,
} from './config.js';
import { distanceBetween, hasLineOfSight, isPlayerHidden, moveCircleWithCollision } from './world.js';

export function createGuard(def, level) {
  const start = def.waypoints[0];
  return {
    def,
    level,
    x: start.x,
    y: start.y,
    // Facing angle in radians; start looking toward the next waypoint.
    facing: Math.atan2(def.waypoints[1].y - start.y, def.waypoints[1].x - start.x),
    waypointIndex: 1,
    pauseTimer: 0,
    detection: 0,
    state: 'patrol', // patrol | suspicious | alerted | search
    lastSeen: null,
    searchTimer: 0,
    stepTimer: 0, // footstep sound clock
  };
}

function angleDifference(a, b) {
  let diff = a - b;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return diff;
}

// Can this guard see the player right now? Cone + range + line of sight +
// cover rules. Returns true only when the meter should rise.
export function guardCanSeePlayer(guard, player, level, guards) {
  const dist = distanceBetween(guard.x, guard.y, player.x, player.y);
  if (dist > CONE_RANGE) return false;
  const angleToPlayer = Math.atan2(player.y - guard.y, player.x - guard.x);
  if (Math.abs(angleDifference(angleToPlayer, guard.facing)) > CONE_HALF_ANGLE) return false;
  if (!hasLineOfSight(guard.x, guard.y, player.x, player.y, level)) return false;
  if (isPlayerHidden(player, guards, level)) return false;
  return true;
}

// How fast the meter rises while the player is seen: closer and walking is
// worse; sneaking and distance buy time. Level multiplier raises difficulty.
function detectionRiseRate(guard, player, level) {
  const dist = distanceBetween(guard.x, guard.y, player.x, player.y);
  const closeness = 1.6 - dist / CONE_RANGE; // 0.6 at max range, 1.6 at touch
  const sneakFactor = player.sneaking ? SNEAK_VISIBILITY : 1;
  return DETECTION_BASE_RATE * closeness * sneakFactor * level.def.detectionMultiplier;
}

function moveGuardToward(guard, targetX, targetY, speed, dt, level) {
  const dx = targetX - guard.x;
  const dy = targetY - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return true;
  const step = Math.min(dist, speed * dt);
  const moved = moveCircleWithCollision(
    guard.x,
    guard.y,
    (dx / dist) * step,
    (dy / dist) * step,
    GUARD_RADIUS,
    level,
  );
  guard.x = moved.x;
  guard.y = moved.y;
  guard.facing = Math.atan2(dy, dx);
  return dist - step < 2;
}

export function updateGuard(guard, dt, player, level, guards, sound) {
  const seesPlayer = guardCanSeePlayer(guard, player, level, guards);

  if (seesPlayer) {
    guard.detection = Math.min(
      CAUGHT_THRESHOLD,
      guard.detection + detectionRiseRate(guard, player, level) * dt,
    );
    guard.lastSeen = { x: player.x, y: player.y };
  } else {
    guard.detection = Math.max(0, guard.detection - DETECTION_DECAY_RATE * dt);
  }

  const wasAlerted = guard.state === 'alerted';
  if (guard.detection >= ALERT_THRESHOLD) {
    guard.state = 'alerted';
  } else if (guard.detection >= SUSPICIOUS_THRESHOLD) {
    if (guard.state === 'patrol') guard.state = 'suspicious';
  } else if (guard.state === 'suspicious' || guard.state === 'search') {
    guard.state = 'patrol';
  }
  if (!wasAlerted && guard.state === 'alerted') sound.playAlarm();

  switch (guard.state) {
    case 'patrol':
      updatePatrol(guard, dt, level, sound, player);
      break;
    case 'suspicious':
      // Freeze and stare at the last seen spot: a readable warning.
      if (guard.lastSeen) {
        guard.facing = Math.atan2(guard.lastSeen.y - guard.y, guard.lastSeen.x - guard.x);
      }
      break;
    case 'alerted':
      updateChase(guard, dt, level, sound, player);
      break;
    case 'search':
      updateSearch(guard, dt);
      break;
  }
}

function updatePatrol(guard, dt, level, sound, player) {
  if (guard.pauseTimer > 0) {
    guard.pauseTimer -= dt;
    return;
  }
  const target = guard.def.waypoints[guard.waypointIndex];
  const arrived = moveGuardToward(guard, target.x, target.y, guard.def.speed, dt, level);
  tickFootsteps(guard, dt, sound, player);
  if (arrived) {
    guard.waypointIndex = (guard.waypointIndex + 1) % guard.def.waypoints.length;
    guard.pauseTimer = WAYPOINT_PAUSE_SECONDS;
  }
}

function updateChase(guard, dt, level, sound, player) {
  if (!guard.lastSeen) {
    guard.state = 'search';
    guard.searchTimer = SEARCH_SECONDS;
    return;
  }
  const arrived = moveGuardToward(
    guard,
    guard.lastSeen.x,
    guard.lastSeen.y,
    guard.def.speed * GUARD_CHASE_SPEED_MULTIPLIER,
    dt,
    level,
  );
  tickFootsteps(guard, dt, sound, player);
  if (arrived) {
    guard.state = 'search';
    guard.searchTimer = SEARCH_SECONDS;
  }
}

function updateSearch(guard, dt) {
  guard.searchTimer -= dt;
  guard.facing += dt * 1.6; // slow sweep, looking around
  if (guard.searchTimer <= 0) {
    guard.state = 'patrol';
    guard.detection = Math.min(guard.detection, SUSPICIOUS_THRESHOLD);
  }
}

// Soft tick; quieter the farther the guard is from the player.
function tickFootsteps(guard, dt, sound, player) {
  guard.stepTimer -= dt;
  if (guard.stepTimer <= 0) {
    guard.stepTimer = 0.55;
    const dist = Math.hypot(player.x - guard.x, player.y - guard.y);
    const volume = Math.max(0.015, 0.09 * (1 - dist / 600));
    sound.playFootstep(volume);
  }
}

// The player is caught when any guard's meter hits 100, or an alerted
// guard physically reaches the player.
export function guardHasCaughtPlayer(guard, player) {
  if (guard.detection >= CAUGHT_THRESHOLD) return true;
  if (guard.state === 'alerted') {
    return distanceBetween(guard.x, guard.y, player.x, player.y) < GUARD_TOUCH_CATCH_RADIUS;
  }
  return false;
}
