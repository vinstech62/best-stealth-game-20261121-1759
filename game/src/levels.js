// Shadow Gallery — the three museum levels. Every level fits the whole
// 960x640 canvas (no scrolling), so the player can learn each patrol at a
// glance. Coordinates are in canvas pixels; walls and crates block movement
// AND guard sight, bushes and shadow patches hide the player.
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';

function borderWalls() {
  return [
    { x: 0, y: 0, w: CANVAS_WIDTH, h: 20 },
    { x: 0, y: CANVAS_HEIGHT - 20, w: CANVAS_WIDTH, h: 20 },
    { x: 0, y: 0, w: 20, h: CANVAS_HEIGHT },
    { x: CANVAS_WIDTH - 20, y: 0, w: 20, h: CANVAS_HEIGHT },
  ];
}

export const LEVELS = [
  {
    name: 'Level 1 — Galeri',
    subtitle: 'Dua penjaga. Pelajari patroli mereka.',
    detectionMultiplier: 1.0,
    walls: [
      ...borderWalls(),
      { x: 300, y: 120, w: 20, h: 220 },
      { x: 600, y: 300, w: 20, h: 220 },
      { x: 420, y: 420, w: 180, h: 20 },
    ],
    crates: [
      { x: 500, y: 150, w: 36, h: 36 },
      { x: 700, y: 480, w: 36, h: 36 },
      { x: 200, y: 300, w: 36, h: 36 },
    ],
    bushes: [
      { x: 180, y: 180, r: 30 },
      { x: 760, y: 180, r: 30 },
      { x: 480, y: 520, r: 34 },
    ],
    shadows: [
      { x: 640, y: 120, w: 110, h: 70 },
      { x: 120, y: 420, w: 110, h: 70 },
    ],
    artifacts: [
      { x: 700, y: 120 },
      { x: 260, y: 540 },
    ],
    playerStart: { x: 60, y: 560 },
    exit: { x: 880, y: 40, w: 50, h: 50 },
    guards: [
      {
        waypoints: [
          { x: 360, y: 180 },
          { x: 560, y: 180 },
          { x: 560, y: 380 },
          { x: 360, y: 380 },
        ],
        speed: 55,
      },
      {
        waypoints: [
          { x: 760, y: 320 },
          { x: 860, y: 320 },
          { x: 860, y: 520 },
          { x: 760, y: 520 },
        ],
        speed: 55,
      },
    ],
  },
  {
    name: 'Level 2 — Aula',
    subtitle: 'Tiga penjaga. Lebih banyak tempat bersembunyi.',
    detectionMultiplier: 1.2,
    walls: [
      ...borderWalls(),
      { x: 250, y: 100, w: 20, h: 180 },
      { x: 500, y: 380, w: 20, h: 200 },
      { x: 650, y: 100, w: 180, h: 20 },
      { x: 150, y: 300, w: 140, h: 20 },
    ],
    crates: [
      { x: 400, y: 150, w: 36, h: 36 },
      { x: 800, y: 300, w: 36, h: 36 },
      { x: 300, y: 500, w: 36, h: 36 },
      { x: 620, y: 520, w: 36, h: 36 },
    ],
    bushes: [
      { x: 150, y: 150, r: 30 },
      { x: 820, y: 150, r: 30 },
      { x: 480, y: 300, r: 34 },
      { x: 180, y: 520, r: 30 },
      { x: 760, y: 520, r: 30 },
    ],
    shadows: [
      { x: 560, y: 120, w: 120, h: 70 },
      { x: 100, y: 400, w: 120, h: 70 },
      { x: 700, y: 420, w: 110, h: 70 },
    ],
    artifacts: [
      { x: 850, y: 120 },
      { x: 120, y: 560 },
      { x: 480, y: 180 },
    ],
    playerStart: { x: 60, y: 80 },
    exit: { x: 880, y: 560, w: 50, h: 50 },
    guards: [
      {
        waypoints: [
          { x: 320, y: 180 },
          { x: 320, y: 420 },
          { x: 460, y: 420 },
          { x: 460, y: 180 },
        ],
        speed: 60,
      },
      {
        waypoints: [
          { x: 700, y: 200 },
          { x: 850, y: 200 },
          { x: 850, y: 480 },
          { x: 700, y: 480 },
        ],
        speed: 60,
      },
      {
        waypoints: [
          { x: 560, y: 300 },
          { x: 640, y: 300 },
          { x: 640, y: 180 },
          { x: 560, y: 180 },
        ],
        speed: 60,
      },
    ],
  },
  {
    name: 'Level 3 — Ruang Harta',
    subtitle: 'Empat penjaga. Deteksi lebih cepat, patroli lebih rapat.',
    detectionMultiplier: 1.5,
    walls: [
      ...borderWalls(),
      { x: 200, y: 120, w: 20, h: 240 },
      { x: 450, y: 280, w: 20, h: 240 },
      { x: 700, y: 120, w: 20, h: 240 },
      { x: 320, y: 480, w: 200, h: 20 },
      { x: 600, y: 300, w: 180, h: 20 },
    ],
    crates: [
      { x: 350, y: 150, w: 36, h: 36 },
      { x: 800, y: 450, w: 36, h: 36 },
      { x: 150, y: 450, w: 36, h: 36 },
      { x: 560, y: 180, w: 36, h: 36 },
    ],
    bushes: [
      { x: 120, y: 200, r: 28 },
      { x: 880, y: 200, r: 28 },
      { x: 540, y: 400, r: 30 },
      { x: 240, y: 560, r: 28 },
    ],
    shadows: [
      { x: 300, y: 300, w: 110, h: 70 },
      { x: 700, y: 500, w: 110, h: 70 },
      { x: 100, y: 60, w: 110, h: 60 },
    ],
    artifacts: [
      { x: 880, y: 80 },
      { x: 80, y: 580 },
      { x: 480, y: 120 },
    ],
    playerStart: { x: 60, y: 320 },
    exit: { x: 880, y: 560, w: 50, h: 50 },
    guards: [
      {
        waypoints: [
          { x: 280, y: 180 },
          { x: 400, y: 180 },
          { x: 400, y: 420 },
          { x: 280, y: 420 },
        ],
        speed: 70,
      },
      {
        waypoints: [
          { x: 520, y: 160 },
          { x: 660, y: 160 },
          { x: 660, y: 260 },
          { x: 520, y: 260 },
        ],
        speed: 70,
      },
      {
        waypoints: [
          { x: 800, y: 180 },
          { x: 880, y: 180 },
          { x: 880, y: 420 },
          { x: 800, y: 420 },
        ],
        speed: 70,
      },
      {
        waypoints: [
          { x: 100, y: 540 },
          { x: 400, y: 540 },
          { x: 400, y: 580 },
          { x: 100, y: 580 },
        ],
        speed: 70,
      },
    ],
  },
];
