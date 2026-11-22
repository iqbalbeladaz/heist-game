// Velvet Vault — tuning, palette and the museum floor plan in one place.
// Logical field is a fixed 1280x720; the renderer scales it to the window.
export const FIELD = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const TIME_LIMIT = 180;
export const PLAYER = { radius: 15, speed: 232, sneakSpeed: 128, reach: 26 };
export const GUARD = { radius: 16, patrolSpeed: 82, chaseSpeed: 158, vision: 178, halfAngle: 0.62, catchDist: 30 };
export const CAMERA = { vision: 196, halfAngle: 0.5, sweep: 0.85, period: 5.2 };
export const ALARM = { rise: 0.85, camRise: 0.62, decay: 0.10, noiseCoins: 3 };
export const BEST_KEY = 'velvet-vault.best';
export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
export const PALETTE = {
  backdrop: '#0b0e14', floor: '#232838', floorAlt: '#202635', carpet: '#3d2438',
  wall: '#4a5468', wallTop: '#66738c', trim: '#c9a86a', panel: '#171c28ee',
  text: '#eef1f5', muted: '#9aa5b5', gold: '#f2c94c', gem: '#5ee0d2', ruby: '#ff6b81',
  guard: '#d9534f', guardDark: '#8e2f2c', cam: '#ffb454', thief: '#7ee787', thiefDark: '#17351f',
  cone: 'rgba(242,201,76,0.20)', coneHot: 'rgba(255,70,60,0.34)', exit: '#58d68a',
};
// Walls: {x,y,w,h}. Gaps between segments are the doorways.
export const WALLS = [
  { x: 40, y: 70, w: 1200, h: 16 }, { x: 40, y: 664, w: 1200, h: 16 },
  { x: 40, y: 70, w: 16, h: 610 }, { x: 1224, y: 70, w: 16, h: 610 },
  { x: 420, y: 86, w: 16, h: 238 }, { x: 420, y: 392, w: 16, h: 272 },
  { x: 824, y: 86, w: 16, h: 330 }, { x: 824, y: 484, w: 16, h: 180 },
  { x: 56, y: 356, w: 210, h: 16 }, { x: 330, y: 356, w: 90, h: 16 },
  { x: 436, y: 470, w: 220, h: 16 }, { x: 720, y: 470, w: 104, h: 16 },
  { x: 840, y: 240, w: 190, h: 16 }, { x: 1094, y: 240, w: 130, h: 16 },
];
export const ROOMS = [
  { label: 'ENTRY HALL', x: 230, y: 640 }, { label: 'WEST GALLERY', x: 230, y: 130 },
  { label: 'GRAND HALL', x: 628, y: 130 }, { label: 'ATRIUM', x: 628, y: 640 },
  { label: 'EAST WING', x: 1030, y: 450 }, { label: '★ THE VAULT', x: 1030, y: 130 },
];
export const EXIT = { x: 58, y: 566, w: 62, h: 82 };
export const LOOT = [
  { x: 150, y: 180, kind: 'gem', value: 150, label: 'teal gem' },
  { x: 300, y: 280, kind: 'painting', value: 300, label: 'moonlit painting' },
  { x: 540, y: 180, kind: 'gold', value: 200, label: 'gold ingots' },
  { x: 700, y: 300, kind: 'ruby', value: 250, label: 'ruby' },
  { x: 620, y: 580, kind: 'gem', value: 150, label: 'teal gem' },
  { x: 950, y: 560, kind: 'painting', value: 300, label: 'starlight painting' },
  { x: 1140, y: 380, kind: 'gold', value: 200, label: 'gold ingots' },
  { x: 1120, y: 140, kind: 'crown', value: 1000, label: 'THE STAR CROWN' },
];
export const PATROLS = [
  [{ x: 170, y: 240 }, { x: 700, y: 240 }],
  [{ x: 940, y: 580 }, { x: 940, y: 300 }, { x: 1150, y: 300 }],
  [{ x: 520, y: 420 }, { x: 760, y: 420 }, { x: 760, y: 560 }, { x: 520, y: 560 }],
];
export const CAMERAS = [
  { x: 436, y: 92, base: 0.9, phase: 0 },
  { x: 1218, y: 462, base: Math.PI, phase: 2.1 },
  { x: 840, y: 92, base: 1.7, phase: 4.0 },
];
