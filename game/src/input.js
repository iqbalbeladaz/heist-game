// Keyboard + mouse input. WASD/arrows move, Shift sneaks, Space/E interacts &
// confirms, P/Esc pauses, and a mouse click throws a noise coin to that spot.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
const KEYS = new Set();
const CONFIRM = new Set(['Space', 'Enter', 'KeyE']);
const PAUSE = new Set(['KeyP', 'Escape']);
export function createInput(target, view) {
  let actions = 0;
  let click = null;
  let mouse = { x: 640, y: 360 };
  window.addEventListener('keydown', (e) => {
    KEYS.add(e.code);
    if (CONFIRM.has(e.code)) { if (!e.repeat) actions |= ACTION_CONFIRM; }
    else if (PAUSE.has(e.code)) { if (!e.repeat) actions |= ACTION_PAUSE; }
    else if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight','Space'].includes(e.code)) return;
    e.preventDefault();
  });
  window.addEventListener('keyup', (e) => KEYS.delete(e.code));
  window.addEventListener('blur', () => KEYS.clear());
  target.addEventListener('pointermove', (e) => { mouse = view.toField(e.clientX, e.clientY); });
  target.addEventListener('pointerdown', (e) => { mouse = view.toField(e.clientX, e.clientY); click = { ...mouse }; actions |= ACTION_CONFIRM; });
  return {
    move() {
      const x = (KEYS.has('ArrowRight') || KEYS.has('KeyD') ? 1 : 0) - (KEYS.has('ArrowLeft') || KEYS.has('KeyA') ? 1 : 0);
      const y = (KEYS.has('ArrowDown') || KEYS.has('KeyS') ? 1 : 0) - (KEYS.has('ArrowUp') || KEYS.has('KeyW') ? 1 : 0);
      const len = Math.hypot(x, y) || 1;
      return { x: x / len * (x || y ? 1 : 0), y: y / len * (x || y ? 1 : 0), active: !!(x || y) };
    },
    sneak() { return KEYS.has('ShiftLeft') || KEYS.has('ShiftRight'); },
    takeActions() { const a = actions; actions = 0; return a; },
    takeClick() { const c = click; click = null; return c; },
    mouse() { return mouse; },
  };
}
