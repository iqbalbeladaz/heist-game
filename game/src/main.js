// Boot + loop: fixed-step simulation, WebAudio blips (procedural, no files),
// screens title → play → paused → busted / getaway.
// ?seed=N fixes patrols. ?shot=start|play|end stages a scene for screenshots.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_CAUGHT, EVENT_COIN, EVENT_CROWN, EVENT_LOOT, EVENT_SPOTTED, EVENT_WIN } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { stageShot } from './shots.js';
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);
const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
let audio = null;
function beep(freq, dur = 0.09, type = 'square', vol = 0.05) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(audio.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur); o.stop(audio.currentTime + dur);
  } catch { /* sound is a bonus, never a blocker */ }
}
function readBest() { try { return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0; } catch { return 0; } }
function saveBest(v) { try { window.localStorage.setItem(BEST_KEY, String(v)); } catch { /* ignore */ } }
if (shot) {
  const scene = stageShot(shot, world);
  let painted = 0;
  const paint = () => { renderer.draw(world.state, scene.screen, scene.best); if (++painted < 2) requestAnimationFrame(paint); else window.__shotReady = true; };
  requestAnimationFrame(paint);
} else {
  const input = createInput(canvas, renderer);
  let screen = SCREEN_TITLE, best = readBest(), acc = 0, last = performance.now(), alarmTick = 0;
  const announce = (m) => { status.textContent = m; };
  function start() { world.reset(); screen = SCREEN_PLAY; acc = 0; announce('Heist started. Steal the Star Crown and escape.'); beep(520, .08); }
  function finish(win) {
    screen = win ? SCREEN_WIN : SCREEN_OVER;
    if (world.state.score > best) { best = world.state.score; saveBest(best); }
    announce(win ? `Clean getaway! Haul $${world.state.score}.` : `Busted. Haul $${world.state.score}.`);
    beep(win ? 880 : 140, .3, win ? 'triangle' : 'sawtooth', .07);
  }
  function frame(now) {
    requestAnimationFrame(frame);
    acc += Math.min((now - last) / 1000, 0.25); last = now;
    const actions = input.takeActions();
    const click = input.takeClick();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WIN)) start();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) { screen = SCREEN_PAUSED; announce('Paused.'); }
    else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
    if (screen === SCREEN_PLAY) {
      if (click) { if (world.throwCoin(click)) beep(1150, .06, 'sine', .06); }
      while (acc >= STEP && screen === SCREEN_PLAY) {
        const ev = world.step(STEP, input.move(), input.sneak());
        acc -= STEP;
        if (ev & EVENT_LOOT) beep(760, .07, 'sine', .06);
        if (ev & EVENT_CROWN) { beep(990, .12, 'triangle', .08); setTimeout(() => beep(1320, .14, 'triangle', .08), 90); }
        if (ev & EVENT_SPOTTED) { alarmTick += STEP; if (alarmTick > 0.28) { alarmTick = 0; beep(220, .05, 'square', .03); } }
        if (ev & EVENT_WIN) { finish(true); break; }
        if (ev & EVENT_CAUGHT) { finish(false); break; }
      }
    } else acc = 0;
    renderer.draw(world.state, screen, best);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden && screen === SCREEN_PLAY) screen = SCREEN_PAUSED; });
  announce('Velvet Vault. Press Space or click to start the heist.');
  requestAnimationFrame(frame);
}
