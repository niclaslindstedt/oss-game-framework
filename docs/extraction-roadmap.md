# Extraction roadmap

What has been lifted out of the games, and what is next. Measured with the
`find-refactor-candidates` skill's similarity report (line-level
`difflib` ratio between the games' copies of a file); a file shared by two or
three games at a high ratio is a candidate, and the job is to make it
GENERIC — the games' vocabulary out, their constants as options — not to
copy it.

## Landed (v0.1.0)

| Module    | Lifted from (game2 / game3 / game4)                                                                                 | Notes                                                                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`    | `engine/lib/{prng,math,noise,quat,heightfield,polyline,solar,clock}.ts`, `engine/output.ts`                         | Union of the three: game4's bit-exact `hypot`, `noiseField`, the moon; game2's `preciseClock`. The seasons' declination table stayed in game3 (its data). |
| `racing`  | `pwa/src/game/ghost.ts` (the codec), `records.ts`, `engine/game/rivals.ts` (the ordering)                           | The tape is SCHEMA-driven; each game names its axes. Byte format pinned.                                                                                  |
| `audio`   | `pwa/src/lib/{synth,voice}.ts`, `game/audio/{rack,play,types,bus}.ts`                                               | game2's `autostart` joined; the echo's room is an option.                                                                                                 |
| `pwa`     | `pwa/src/lib/pwa-update.ts`                                                                                         | Now an external store, not a React hook.                                                                                                                  |
| `display` | `pwa/src/lib/{viewport,visible-viewport}.ts`                                                                        |                                                                                                                                                           |
| `shots`   | `pwa/src/lib/{shot-roll,shot-store,shot-thumbs,share-image}.ts`, `game/{shot-plan,shot-hud}.ts`                     | the prune fix (delete by stored keys, never by the roll in hand) now reaches game2, the one game still without it. HUD selectors are options.                              |
| `input`   | `game/{thumb-guard,hud-press,menu-cursor}.ts`                                                                       |                                                                                                                                                           |
| `hud`     | `lib/util.ts` (the figures), `lib/count.ts`                                                                         |                                                                                                                                                           |
| `loop`    | `game/run-loop.ts`                                                                                                  | The clamp is an option.                                                                                                                                   |
| `tooling` | `scripts/lib/{cli,png,draw,serve-dist,chromium,engine-alias}.mjs`, `scripts/release/*`, `scripts/skill-lessons.mjs` | `craftList` generalised to `pickList`.                                                                                                                    |

## Next

Ranked by (similarity × copies × size). Each is one `expand-framework` pass.

| Candidate                          | Where                                                                                                                                            | Why it is not in yet                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| The desktop shell's decision crate | `tauri/shell/src/{window_state,webroot,display,output}.rs` — identical in all three                                                              | A Rust crate as a git dependency of each `tauri/` tree; needs its own CI job here.                           |
| The store shell's modules          | `native/src/{haptics,navigation,local-server,config}.ts`, `native/plugins/with-ios-signing.js`, `native/scripts/ios-device.mjs` — near-identical | `native/` is its own npm tree; ship a `native/` entry once the seam modules' import-freedom rule is settled. |
| The workflows                      | `.github/workflows/{version-bump,pages,release,desktop-tauri,native}.yml`, `.github/actions/apple-signing`                                       | Reusable workflows (`workflow_call`) from this repo.                                                         |
| The service worker plugin          | `pwa/pwa-plugin.ts` (0.84–0.92)                                                                                                                  | Build-time Vite plugin; wants a `vite` entry with Node types.                                                |
| The menu's DOM walk                | `game/menu-nav.ts` (0.73–0.93)                                                                                                                   | Reads the games' card classes; needs selectors as options like `shot-hud`.                                   |
| The replay director                | `game/replay-shots.ts`, `camera-tv.ts` (0.25–0.37)                                                                                               | Same idea, drifted shapes: design a generic moment/plan/director first.                                      |
| The benchmark's index and report   | `game/benchmark-{index,report,history}.ts` (0.5–0.9 in game2/game3)                                                                              | Per-game plan tables to separate from the scoring.                                                           |
| The shell seam                     | `pwa/src/shell-host.ts` (0.73–0.91)                                                                                                              | Word lists differ per game; the protocol could be shared.                                                    |
| The splash / loading cards         | `splash-screen.tsx`, `loading-screen.tsx`                                                                                                        | Preact components: would need a view-framework-neutral split first.                                          |
