# Velvet Vault — a tiny heist game

An original top-down stealth heist game for make.fun's "Make the best heist game" bounty.

Sneak through a night museum as a lone thief: dodge the **vision cones** of patrolling
guards and sweeping **security cameras**, fill your bag with gems, paintings and gold,
steal the **Star Crown** from the vault, and escape through the exit door before the
**alarm meter** fills or the clock runs out.

## Play

```sh
node serve.ts          # then open http://localhost:8080
```

Or serve the `game/` folder with any static HTTP server and open `game/index.html`.

- **WASD / arrow keys** — move
- **Shift** — sneak (slower, harder to spot)
- **Mouse click** — throw a noise coin (you carry 3) to distract guards
- **Space / E** — start / restart, **P / Esc** — pause

Being seen raises the alarm; hiding lets it cool down. Grabbing the crown opens your
escape: reach the green EXIT door for a time + stealth bonus. Caught, alarmed-out or
out of time — you're busted.

## Handing it in

`node main.ts` (with `MAKEFUN_OUTPUT_DIR` outside the grader) copies `game/` and
`screenshots/` to the output directory and writes `dossier.json` via the vendored
make.fun library in `vendor/makefun-game.ts`. The game itself is plain static
HTML5/JavaScript — no build step, no network requests, procedural WebAudio sounds.

Screenshots are staged deterministically with `?shot=start|play|end&seed=1`
(see `shots.json`).
