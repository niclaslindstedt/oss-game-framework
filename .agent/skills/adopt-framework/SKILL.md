---
name: adopt-framework
description: "Use when putting a framework release into a game (upgrading game2, game3 or game4, or starting a new racing game on the framework): move the tag, point the imports at the framework, delete the local copies, hold the engine line in imports_test, and prove the determinism digests did not move."
---

# Adopt the framework in a game

## Upgrade an existing game

1. In the game's root `package.json`:
   `"@niclaslindstedt/oss-game-framework": "github:niclaslindstedt/oss-game-framework#vX.Y.Z"`
   under `dependencies`, then `npm install` (the lockfile records the commit).
2. Read the framework's `CHANGELOG.md` between the two tags. A `breaking`
   entry in `core/` or `racing/` means the game's digests or stored tapes
   move — the game owes a note in its PR (and a generator version row if a
   pinned map moved).
3. `make test` (or at least `determinism_test`, `simulation_test`,
   `generator_version_test`), `make lint`, `make build`.

## Replace a local copy with the framework's

- **Import the file subpath, not the barrel**, from the engine:
  `@niclaslindstedt/oss-game-framework/core/prng`. The app may use either.
- **Delete the local copy** — do not leave a re-export shim unless an import
  site count makes the rewrite unreasonable; a shim is a second place a
  future change lands by mistake.
- **The engine line in `tests/imports_test.ts`.** The engine may import the
  framework's `core/*` and `racing/*` subpaths and nothing else from it;
  every other bare import from the engine is still a failure.
- **Tools that read source as TEXT** (an audition page that concatenates the
  synth, a test that greps a file) read the framework's shipped `src/` under
  `node_modules/@niclaslindstedt/oss-game-framework/src/`.
- **Node scripts** import `@niclaslindstedt/oss-game-framework/tooling/<name>`
  instead of `./lib/<name>.mjs`; the release plumbing is the `ogf-*` bins.

## Start a new game

Take `core` + `racing` for the engine (the PRNG in state, the fixed step),
`loop/run-clock` for the app's frame loop, `audio` for the one synth,
`shots`/`pwa`/`display`/`input`/`hud` for the shell, and `tooling/*` for the
labs. The sibling games are the reference for everything above that.
