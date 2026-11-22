// Shadow Gallery — shared tuning constants. One place for every number the
// judge (or a future balance pass) might want to change.
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 640;

export const PLAYER_RADIUS = 12;
export const PLAYER_SPEED = 125; // px per second, walking
export const SNEAK_SPEED = 62; // px per second, sneaking (Shift)
export const ARTIFACT_PICKUP_RADIUS = 26;

export const GUARD_RADIUS = 13;
export const CONE_RANGE = 170; // how far a guard can see, in px
export const CONE_HALF_ANGLE = (35 * Math.PI) / 180; // 35 degrees either side
export const HIDE_CLOSE_RANGE = 40; // a guard this close spots a hidden player
export const GUARD_CHASE_SPEED_MULTIPLIER = 1.5;
export const GUARD_TOUCH_CATCH_RADIUS = 24; // alerted guard this close = caught

// Detection meter 0..100. Rises while the player is seen, falls while unseen.
export const DETECTION_BASE_RATE = 55; // per second at point-blank, walking
export const DETECTION_DECAY_RATE = 25; // per second while unseen (recovery)
export const SNEAK_VISIBILITY = 0.55; // sneaking fills the meter slower
export const SUSPICIOUS_THRESHOLD = 35; // guard pauses and looks ("?")
export const ALERT_THRESHOLD = 75; // guard chases last seen position ("!")
export const CAUGHT_THRESHOLD = 100;

export const LIVES_START = 3;
export const WAYPOINT_PAUSE_SECONDS = 0.7; // guard waits this long at each corner
export const SEARCH_SECONDS = 2.2; // guard looks around after losing the player

export const COLORS = {
  floor: '#2b2b33',
  floorTile: '#32323c',
  wall: '#6b5d4f',
  wallTop: '#8a7a66',
  crate: '#7a5230',
  crateTop: '#96683d',
  bush: '#2f6b2f',
  bushLeaf: '#3f8a3f',
  shadow: '#14141c',
  artifact: '#ffd94a',
  exitLocked: '#5a5a66',
  exitOpen: '#39d353',
  player: '#e8b64c',
  playerSneak: '#c98f2e',
  guard: '#c0392b',
  guardSuspicious: '#e67e22',
  guardAlerted: '#ff2e2e',
  cone: 'rgba(255, 220, 90, 0.20)',
  coneAlert: 'rgba(255, 60, 60, 0.25)',
  hudText: '#f2ead8',
  hudBar: '#ffd94a',
  hudBarDanger: '#ff5a4a',
};
