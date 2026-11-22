// Screenshot scenes behind ?shot=start|play|end — deterministic set-ups of the
// real world so 1 frame shows the room, thief, guard cones, cameras, loot and alarm.
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
export function stageShot(name, world) {
  const s = world.state;
  world.reset();
  if (name === 'play') {
    // Mid-heist: thief in the Grand Hall eyeing the vault, one gem already taken,
    // a guard closing in, alarm partly raised.
    for (let i = 0; i < 200; i++) world.step(1 / 60, { x: 0, y: 0, active: false }, false);
    s.player.x = 760; s.player.y = 210; s.loot[0].taken = true; s.loot[2].taken = true;
    s.score = 350; s.taken = 2; s.alarm = 0.38; s.timeLeft = 121; s.elapsed = 59;
    s.guards[0].x = 560; s.guards[0].y = 240; s.guards[0].dir = 0.2; s.guards[0].alert = 0.4;
    s.msg = 'Careful — a guard has almost spotted you!';
    return { screen: SCREEN_PLAY, best: 350 };
  }
  if (name === 'end') {
    for (let i = 0; i < 120; i++) world.step(1 / 60, { x: 0, y: 0, active: false }, false);
    s.player.x = 980; s.player.y = 170; s.loot[7].taken = false; s.score = 850; s.taken = 5;
    s.alarm = 1; s.caught = true; s.msg = 'ALARM! The guards sealed the museum.';
    s.guards[1].x = 1010; s.guards[1].y = 210; s.guards[1].dir = -1.8; s.guards[1].alert = 1;
    return { screen: SCREEN_OVER, best: 1200 };
  }
  for (let i = 0; i < 150; i++) world.step(1 / 60, { x: 0, y: 0, active: false }, false);
  return { screen: SCREEN_TITLE, best: 0 };
}
