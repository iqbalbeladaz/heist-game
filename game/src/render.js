// Drawing only: floor plan, vision cones, cameras, guards, thief, loot, HUD
// (score, timer and the ALARM meter) and the title / pause / end panels.
import { CAMERA, EXIT, FIELD, FONT, GUARD, PALETTE, ROOMS, WALLS } from './config.js';
export const SCREEN_TITLE = 'title', SCREEN_PLAY = 'play', SCREEN_PAUSED = 'paused', SCREEN_OVER = 'over', SCREEN_WIN = 'win';
export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0, ratio: 1 };
  function resize() {
    view.ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * view.ratio); canvas.height = Math.round(window.innerHeight * view.ratio);
    view.scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
    view.x = (canvas.width - FIELD.width * view.scale) / 2; view.y = (canvas.height - FIELD.height * view.scale) / 2;
  }
  window.addEventListener('resize', resize); resize();
  function toField(cx, cy) { return { x: (cx * view.ratio - view.x) / view.scale, y: (cy * view.ratio - view.y) / view.scale }; }
  function text(v, x, y, size, color, align = 'center', bold = false) { ctx.font = `${bold ? '700 ' : ''}${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(v, x, y); }
  function cone(x, y, dir, range, half, hot) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, range, dir - half, dir + half); ctx.closePath();
    ctx.fillStyle = hot ? PALETTE.coneHot : PALETTE.cone; ctx.fill();
    ctx.strokeStyle = hot ? 'rgba(255,80,60,.55)' : 'rgba(242,201,76,.35)'; ctx.stroke();
  }
  function drawWorld(s) {
    ctx.fillStyle = PALETTE.floor; ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.floorAlt;
    for (let x = 56; x < 1224; x += 48) for (let y = 86; y < 664; y += 48) if (((x + y) / 48) % 2 === 0) ctx.fillRect(x, y, 48, 48);
    ctx.fillStyle = PALETTE.carpet; ctx.fillRect(452, 102, 356, 336); ctx.fillRect(852, 272, 356, 376);
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.textAlign = 'center';
    for (const r of ROOMS) text(r.label, r.x, r.y, 15, 'rgba(220,228,240,.35)', 'center', true);
    // Exit door
    ctx.fillStyle = s.hasCrown ? PALETTE.exit : '#2c4a3a'; ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
    ctx.strokeStyle = PALETTE.exit; ctx.lineWidth = 3; ctx.strokeRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
    text('EXIT', EXIT.x + EXIT.w / 2, EXIT.y + 48, 16, '#0b0e14', 'center', true);
    // Cameras' cones, then guards' cones
    for (const c of s.cameras) cone(c.x, c.y, c.dir, CAMERA.vision, CAMERA.halfAngle, s.spotted > 0.5);
    for (const g of s.guards) cone(g.x, g.y, g.dir, GUARD.vision, GUARD.halfAngle, g.alert > 0.3);
    // Loot
    for (const l of s.loot) {
      if (l.taken) continue;
      ctx.save(); ctx.translate(l.x, l.y);
      if (l.kind === 'crown') { ctx.fillStyle = PALETTE.gold; ctx.beginPath(); ctx.moveTo(-18, 10); ctx.lineTo(-18, -10); ctx.lineTo(-8, 0); ctx.lineTo(0, -16); ctx.lineTo(8, 0); ctx.lineTo(18, -10); ctx.lineTo(18, 10); ctx.closePath(); ctx.fill(); ctx.fillStyle = PALETTE.ruby; ctx.beginPath(); ctx.arc(0, 2, 4, 0, 7); ctx.fill(); }
      else if (l.kind === 'painting') { ctx.fillStyle = PALETTE.trim; ctx.fillRect(-20, -15, 40, 30); ctx.fillStyle = '#35507a'; ctx.fillRect(-16, -11, 32, 22); ctx.fillStyle = '#dfe9ff'; ctx.beginPath(); ctx.arc(7, -4, 5, 0, 7); ctx.fill(); }
      else if (l.kind === 'gold') { ctx.fillStyle = PALETTE.gold; ctx.fillRect(-16, -4, 30, 10); ctx.fillRect(-11, -14, 30, 10); }
      else { ctx.fillStyle = l.kind === 'ruby' ? PALETTE.ruby : PALETTE.gem; ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(11, 0); ctx.lineTo(0, 13); ctx.lineTo(-11, 0); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      if (l.kind === 'crown') text('STAR CROWN', l.x, l.y + 34, 13, PALETTE.gold, 'center', true);
    }
    // Noise coin
    if (s.noise) { ctx.strokeStyle = PALETTE.gold; ctx.lineWidth = 2; const r = 12 + (3.2 - s.noise.t) * 14; ctx.beginPath(); ctx.arc(s.noise.x, s.noise.y, r % 46, 0, 7); ctx.stroke(); ctx.fillStyle = PALETTE.gold; ctx.beginPath(); ctx.arc(s.noise.x, s.noise.y, 6, 0, 7); ctx.fill(); }
    // Walls
    for (const w of WALLS) { ctx.fillStyle = PALETTE.wall; ctx.fillRect(w.x, w.y, w.w, w.h); ctx.fillStyle = PALETTE.wallTop; ctx.fillRect(w.x, w.y, w.w, 4); }
    // Cameras
    for (const c of s.cameras) { ctx.fillStyle = PALETTE.cam; ctx.beginPath(); ctx.arc(c.x, c.y, 10, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(c.x + Math.cos(c.dir) * 5, c.y + Math.sin(c.dir) * 5, 4, 0, 7); ctx.fill(); }
    // Guards
    for (const g of s.guards) {
      ctx.fillStyle = g.alert > 0.55 ? '#ff3b30' : PALETTE.guard; ctx.beginPath(); ctx.arc(g.x, g.y, g.radius, 0, 7); ctx.fill();
      ctx.fillStyle = PALETTE.guardDark; ctx.beginPath(); ctx.arc(g.x, g.y, g.radius, Math.PI, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(g.x + Math.cos(g.dir) * 6 - 4, g.y + Math.sin(g.dir) * 6, 2.5, 0, 7); ctx.arc(g.x + Math.cos(g.dir) * 6 + 4, g.y + Math.sin(g.dir) * 6, 2.5, 0, 7); ctx.fill();
      if (g.alert > 0.15) text(g.alert > 0.55 ? '!' : '?', g.x, g.y - 24, 22, g.alert > 0.55 ? '#ff3b30' : PALETTE.gold, 'center', true);
    }
    // Thief
    const p = s.player;
    ctx.fillStyle = PALETTE.thiefDark; ctx.beginPath(); ctx.arc(p.x + 10, p.y + 8, 9, 0, 7); ctx.fill();
    ctx.fillStyle = PALETTE.thief; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, 7); ctx.fill();
    ctx.fillStyle = '#0b0e14'; ctx.fillRect(p.x - 11, p.y - 5, 22, 7);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x - 5, p.y - 1, 2, 0, 7); ctx.arc(p.x + 5, p.y - 1, 2, 0, 7); ctx.fill();
  }
  function drawHud(s) {
    ctx.fillStyle = '#121722'; ctx.fillRect(0, 0, FIELD.width, 62);
    text(`LOOT $${s.score}`, 24, 40, 24, PALETTE.gold, 'left', true);
    text(s.hasCrown ? '👑 Crown stolen — ESCAPE!' : `Loot ${s.taken}/8 · Steal the 👑 Star Crown`, 400, 40, 19, PALETTE.text, 'left');
    const mm = Math.floor(s.timeLeft / 60), ss = String(Math.floor(s.timeLeft % 60)).padStart(2, '0');
    text(`⏱ ${mm}:${ss}`, 900, 40, 22, s.timeLeft < 30 ? '#ff6b81' : PALETTE.text, 'center', true);
    text(`Coins 🪙×${s.coins}`, 1010, 40, 18, PALETTE.muted, 'left');
    // Alarm meter
    text('ALARM', 1090, 24, 13, PALETTE.muted, 'left', true);
    ctx.fillStyle = '#2a3040'; ctx.fillRect(1090, 30, 166, 16);
    ctx.fillStyle = s.alarm > 0.66 ? '#ff3b30' : s.alarm > 0.33 ? '#ff9f43' : PALETTE.gold;
    ctx.fillRect(1090, 30, 166 * Math.min(1, s.alarm), 16);
    ctx.strokeStyle = '#66738c'; ctx.strokeRect(1090, 30, 166, 16);
    if (s.msg) text(s.msg, FIELD.width / 2, 706, 17, PALETTE.muted);
  }
  function panel(title, lines, prompt, color = PALETTE.text) {
    const w = 680, h = 170 + lines.length * 32, x = (FIELD.width - w) / 2, y = (FIELD.height - h) / 2;
    ctx.fillStyle = 'rgba(5,8,14,.55)'; ctx.fillRect(0, 62, FIELD.width, FIELD.height - 62);
    ctx.fillStyle = PALETTE.panel; ctx.fillRect(x, y, w, h); ctx.strokeStyle = PALETTE.trim; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
    text(title, FIELD.width / 2, y + 72, 44, color, 'center', true);
    lines.forEach((l, i) => text(l, FIELD.width / 2, y + 122 + i * 32, 20, PALETTE.muted));
    text(prompt, FIELD.width / 2, y + h - 28, 22, PALETTE.gold, 'center', true);
  }
  function draw(s, screen, best) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PALETTE.backdrop; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawWorld(s); drawHud(s);
    if (screen === SCREEN_TITLE) panel('🕵️ VELVET VAULT', ['Sneak through the night museum. Dodge guard vision cones', 'and sweeping cameras — being seen fills the ALARM meter.', 'WASD / arrows move · Shift sneaks · Click throws a noise coin', `Best haul: $${best}`], 'Press Space or click to start the heist', PALETTE.gold);
    else if (screen === SCREEN_PAUSED) panel('Paused', ['The guards hold their breath…'], 'Press P or Space to resume');
    else if (screen === SCREEN_OVER) panel('🚨 BUSTED!', [s.msg, `You escaped with $${s.score} of loot.`, `Best haul: $${best}`], 'Press Space or click to try again', '#ff6b81');
    else if (screen === SCREEN_WIN) panel('💎 CLEAN GETAWAY!', [`The Star Crown is yours! Total haul: $${s.score}`, `Finished with ${Math.ceil(s.timeLeft)}s to spare.`, `Best haul: $${best}`], 'Press Space or click to play again', PALETTE.exit);
  }
  return { draw, toField };
}
