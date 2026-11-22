// Velvet Vault rules: thief, patrolling guards with vision cones, sweeping
// cameras, loot, a rising alarm meter, noise coins and the escape door.
// Pure state + step(); no drawing, no browser globals.
import { ALARM, CAMERA, CAMERAS, EXIT, FIELD, GUARD, LOOT, PATROLS, PLAYER, TIME_LIMIT, WALLS } from './config.js';
export const EVENT_LOOT = 1, EVENT_CROWN = 2, EVENT_CAUGHT = 4, EVENT_WIN = 8, EVENT_SPOTTED = 16, EVENT_COIN = 32;

function segHitsRect(x1, y1, x2, y2, r) {
  // Segment vs AABB via slab test.
  const dx = x2 - x1, dy = y2 - y1; let t0 = 0, t1 = 1;
  for (const [p, q] of [[-dx, x1 - r.x], [dx, r.x + r.w - x1], [-dy, y1 - r.y], [dy, r.y + r.h - y1]]) {
    if (p === 0) { if (q < 0) return false; }
    else { const t = q / p; if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; } }
  }
  return true;
}
export function losBlocked(x1, y1, x2, y2) {
  for (const w of WALLS) if (segHitsRect(x1, y1, x2, y2, w)) return true;
  return false;
}
function collide(x, y, rad) {
  for (const w of WALLS) {
    const nx = Math.max(w.x, Math.min(x, w.x + w.w)), ny = Math.max(w.y, Math.min(y, w.y + w.h));
    if ((x - nx) ** 2 + (y - ny) ** 2 < rad * rad) return true;
  }
  return x < rad || y < rad || x > FIELD.width - rad || y > FIELD.height - rad;
}
function moveActor(a, dx, dy, rad) {
  if (!collide(a.x + dx, a.y, rad)) a.x += dx;
  if (!collide(a.x, a.y + dy, rad)) a.y += dy;
}
function angDiff(a, b) { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return Math.abs(d); }
function seenBy(ox, oy, dir, vision, half, p, sneak) {
  const d = Math.hypot(p.x - ox, p.y - oy);
  const v = vision * (sneak ? 0.72 : 1);
  if (d > v || d < 24) return d <= 26 ? 1 : 0;
  if (angDiff(Math.atan2(p.y - oy, p.x - ox), dir) > half) return 0;
  if (losBlocked(ox, oy, p.x, p.y)) return 0;
  return 1 - d / v;
}

export function createWorld(random) {
  const player = { x: 150, y: 610, radius: PLAYER.radius };
  const guards = PATROLS.map((path, i) => ({ x: path[0].x, y: path[0].y, dir: 0, path, wp: 1, wait: 0, alert: 0, radius: GUARD.radius, seed: random() * 10 + i }));
  const cameras = CAMERAS.map((c) => ({ ...c, dir: c.base }));
  const loot = LOOT.map((l) => ({ ...l, taken: false }));
  const state = { player, guards, cameras, loot, alarm: 0, score: 0, taken: 0, hasCrown: false, coins: ALARM.noiseCoins, noise: null, timeLeft: TIME_LIMIT, elapsed: 0, caught: false, won: false, spotted: 0, msg: '' };
  function reset() {
    player.x = 150; player.y = 610;
    guards.forEach((g, i) => { g.x = PATROLS[i][0].x; g.y = PATROLS[i][0].y; g.wp = 1; g.wait = 0; g.alert = 0; g.dir = Math.atan2(PATROLS[i][1].y - g.y, PATROLS[i][1].x - g.x); });
    cameras.forEach((c, i) => { c.dir = CAMERAS[i].base; });
    loot.forEach((l) => { l.taken = false; });
    Object.assign(state, { alarm: 0, score: 0, taken: 0, hasCrown: false, coins: ALARM.noiseCoins, noise: null, timeLeft: TIME_LIMIT, elapsed: 0, caught: false, won: false, spotted: 0, msg: 'Grab the Star Crown in the Vault, then escape through the green door.' });
  }
  function throwCoin(pos) {
    if (state.coins <= 0 || !pos) return 0;
    state.coins -= 1; state.noise = { x: pos.x, y: pos.y, t: 3.2 };
    return EVENT_COIN;
  }
  function step(dt, move, sneak) {
    let events = 0;
    if (state.caught || state.won) return 0;
    state.elapsed += dt; state.timeLeft = Math.max(0, TIME_LIMIT - state.elapsed);
    if (state.timeLeft <= 0) { state.caught = true; state.msg = 'Time up — the museum sealed its doors.'; return EVENT_CAUGHT; }
    const speed = sneak ? PLAYER.sneakSpeed : PLAYER.speed;
    if (move.active) moveActor(player, move.x * speed * dt, move.y * speed * dt, player.radius);
    // Noise distraction
    if (state.noise) { state.noise.t -= dt; if (state.noise.t <= 0) state.noise = null; }
    // Guards
    let detection = 0;
    for (const g of guards) {
      const seen = seenBy(g.x, g.y, g.dir, GUARD.vision, GUARD.halfAngle, player, sneak);
      g.alert = seen > 0 ? Math.min(1, g.alert + dt * 2.2) : Math.max(0, g.alert - dt * 0.7);
      if (seen > 0) detection = Math.max(detection, 0.35 + seen * 0.65);
      let target = null, spd = GUARD.patrolSpeed;
      if (g.alert > 0.55) { target = player; spd = GUARD.chaseSpeed; }
      else if (state.noise && Math.hypot(state.noise.x - g.x, state.noise.y - g.y) < 300) target = state.noise;
      else {
        const wp = g.path[g.wp];
        if (Math.hypot(wp.x - g.x, wp.y - g.y) < 8) { g.wp = (g.wp + 1) % g.path.length; g.wait = 0.7; }
        target = g.path[g.wp];
        if (g.wait > 0) { g.wait -= dt; target = null; }
      }
      if (target) {
        const dx = target.x - g.x, dy = target.y - g.y, d = Math.hypot(dx, dy) || 1;
        const stepLen = Math.min(d, spd * dt);
        const px = g.x, py = g.y;
        moveActor(g, dx / d * stepLen, dy / d * stepLen, g.radius);
        if (g.x !== px || g.y !== py) g.dir = Math.atan2(g.y - py, g.x - px);
        else if (target === player || target === state.noise) g.dir = Math.atan2(dy, dx);
      }
      if (Math.hypot(player.x - g.x, player.y - g.y) < GUARD.catchDist) { state.caught = true; state.msg = 'A guard grabbed you!'; return events | EVENT_CAUGHT; }
    }
    // Cameras
    for (const c of cameras) {
      c.dir = c.base + Math.sin(state.elapsed * (2 * Math.PI / CAMERA.period) + c.phase) * CAMERA.sweep;
      const seen = seenBy(c.x, c.y, c.dir, CAMERA.vision, CAMERA.halfAngle, player, sneak);
      if (seen > 0) detection = Math.max(detection, (0.35 + seen * 0.65) * 0.8);
    }
    state.spotted = detection;
    if (detection > 0) { state.alarm = Math.min(1, state.alarm + dt * (detection > 0.8 ? ALARM.rise : ALARM.camRise) * detection); events |= EVENT_SPOTTED; }
    else state.alarm = Math.max(0, state.alarm - dt * ALARM.decay);
    if (state.alarm >= 1) { state.caught = true; state.msg = 'ALARM! The guards sealed the museum.'; return events | EVENT_CAUGHT; }
    // Loot
    for (const l of loot) {
      if (!l.taken && Math.hypot(player.x - l.x, player.y - l.y) < PLAYER.reach + 12) {
        l.taken = true; state.score += l.value; state.taken += 1;
        if (l.kind === 'crown') { state.hasCrown = true; state.msg = 'You have the Star Crown! Get to the green EXIT door!'; events |= EVENT_CROWN; }
        else state.msg = `Stole the ${l.label} (+$${l.value}).`;
        events |= EVENT_LOOT;
      }
    }
    // Exit
    if (state.hasCrown && player.x > EXIT.x && player.x < EXIT.x + EXIT.w && player.y > EXIT.y && player.y < EXIT.y + EXIT.h) {
      state.won = true;
      state.score += Math.round(state.timeLeft) * 5 + Math.round((1 - state.alarm) * 500);
      return events | EVENT_WIN;
    }
    return events;
  }
  reset();
  return { state, reset, step, throwCoin };
}
