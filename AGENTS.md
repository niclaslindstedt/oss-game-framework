# Agent guidance — OSS Game Framework

This is the single source of truth for AI coding agents working in this
repository (OSS_SPEC §7). Tool-specific files (`CLAUDE.md`, `GEMINI.md`,
`.cursorrules`, `.github/copilot-instructions.md`) are symlinks to it — never
edit them directly.

## What this project is

`@niclaslindstedt/oss-game-framework` is the shared building blocks of the
browser racing games [`game2`](https://github.com/niclaslindstedt/game2) (a
rally game), [`game3`](https://github.com/niclaslindstedt/game3) (a jet-ski
racer) and [`game4`](https://github.com/niclaslindstedt/game4) (a snowmobile
racer). Those games were built by porting from one another, so the same files
lived — and drifted — in three places; a bug fixed in one stayed in the other
two. This package is where that shared code lives now: **fix it here once,
cut a release, and move each game's tag.** It is also the kit a NEW game of
the same shape (a deterministic engine, a Preact/three.js PWA over it, Node
labs beside it) starts from — see the `adopt-framework` skill.

It is the game-side sibling of
[`oss-framework`](https://github.com/niclaslindstedt/oss-framework) (the
React kit for the local-first apps) and copies its structure: tsup subpath
exports, changeset fragments, the Makefile targets, the skills.

## Build / test / lint commands

| Command           | What it does                                                        |
| ----------------- | ------------------------------------------------------------------- |
| `make build`      | Build `dist/` with tsup (ESM + d.ts) — **commit the result**         |
| `make test`       | Run the Vitest suite                                                 |
| `make lint`       | ESLint + `tsc --noEmit`, zero warnings                               |
| `make fmt`        | Format in place with Prettier                                        |
| `make fmt-check`  | Verify formatting without writing                                    |
| `make check-dist` | Fail when the committed `dist/` is not what `src/` builds to         |
| `make bump`       | Print the semver bump the unreleased fragments imply                 |

Dependencies are not pre-installed in a fresh container: `npm install` first
(`.npmrc` sets `legacy-peer-deps`, which works around an npm arborist crash on
vitest's peer set).

### No errors get through

Any error a command surfaces is yours to fix before you finish, whoever
introduced it. Never land work while `make lint`, `make test`, `make
fmt-check` or `make check-dist` is red.

## How the games consume it

**A git dependency on a release tag, with `dist/` committed.**

```json
"dependencies": {
  "@niclaslindstedt/oss-game-framework": "github:niclaslindstedt/oss-game-framework#v0.1.0"
}
```

Why not a registry: the games promise that everything resolves from the
public npm registry with no credentials, and GitHub Packages needs a token
even for a public package. Why `dist/` is committed: npm packs a git
dependency as it stands, so a committed build means a game's `npm ci` runs
no build step and installs none of this repository's dev toolchain. CI's
`make check-dist` holds `dist/` to `src/`. **Every change to `src/` commits
its rebuilt `dist/` in the same commit.**

Upgrading a game is moving `#vX.Y.Z` in its `package.json` and running
`npm install` there (the `adopt-framework` skill).

## Architecture and dependency direction

```
src/
├── core/      the ENGINE-SAFE pool: prng, math, noise, heightfield, polyline,
│              quat, solar, clock, output. Imports nothing, not even another
│              module here. Deterministic to the BIT.
├── racing/    engine-safe racing primitives: tape (the control tape ghosts
│              and replays are kept on), records (the record book's policy),
│              standings (the field's order). May import core/ only.
├── audio/     the synthesized instrument: voice (vocabulary, DOM-free),
│              synth (the only WebAudio), rack, play, types, view (faders).
├── pwa/       the service worker's update watch, as an external store.
├── display/   a canvas's two sizes; the page's visible window.
├── shots/     the screenshot roll: policy, IndexedDB store, thumbnails,
│              sharing, the stamp's arithmetic, the HUD raster.
├── input/     thumb-guard, hud-press, menu-cursor — DOM-free, typed
│              structurally.
├── hud/       format (race clock, ordinal, score, day, legible), count.
└── loop/      run-clock: the fixed-step accumulator.
tooling/       Node lab shelf, shipped as plain .mjs: cli, png, draw,
               serve-dist, chromium, alias; release/ (the changeset plumbing).
bin/           skill-lessons (the skill-reflection printer).
```

- **The engine line.** A game's engine may import `core/*` and `racing/*` and
  nothing else from here; `tests/core.test.ts` holds `core/` to importing
  nothing at all, and each game's own `imports_test` holds its engine to
  those two subpaths. Keep it that way: nothing under `core/` or `racing/` may
  touch the DOM, Node, a wall clock outside `clock.ts`, or `Math.random`.
- **No UI framework.** The games render with Preact; the framework imports
  neither Preact nor React. Where a hook would be natural, hand out an
  external store (`pwaUpdateWatch` → `useSyncExternalStore`) or plain
  handlers (`pressHandlers`).
- **No game's vocabulary in a published name.** The framework names the
  MECHANISM, never one game's use of it: a `vehicle`, not a sled, a craft or
  a car; `checkpoint`, not buoy or gate; a `TapeSchema` the game fills with
  its own axes, not `steer`/`lean` baked in. The litmus test: could a fourth
  racing game reuse it without inheriting a word of the first three? Comments
  follow the same rule. Game DATA (a season's declination table, a sled's
  catalog) stays in the game.
- **BITS, not closeness.** The games' determinism digests are cut under this
  code. `hypot` is `Math.hypot` bit for bit, `createRng(1).next()` is pinned,
  the tape's byte format is pinned to what the games' ghosts were written in.
  A change that moves any of them is a BREAKING change (a `breaking: true`
  fragment), because it re-rolls every game's worlds or orphans every stored
  ghost.
- **One copy of module state.** `core/output`'s sink and the shot store's roll
  are module state. The build is ESM-only with chunk splitting so every entry
  shares one copy; never add a CJS build beside it.
- Source files stay under **1000 physical lines**.

## Where new code goes

| Change                                              | Goes in                                                   |
| --------------------------------------------------- | --------------------------------------------------------- |
| Deterministic math a simulation needs               | `src/core/` + `src/core/index.ts`                         |
| Anything about a RACE (laps, splits, a field, tapes) | `src/racing/`                                            |
| A sound-making or sound-describing piece            | `src/audio/` (WebAudio only in `synth.ts`)                |
| HUD arithmetic, input plumbing                      | `src/hud/`, `src/input/`                                  |
| A new module                                        | `src/<mod>/index.ts` + `MODULES` in `tsup.config.ts` + `exports` in `package.json` + the root barrel |
| A Node helper the games' labs share                 | `tooling/<name>.mjs` (plain JS, node globals)             |
| A test                                              | `tests/<module>.test.ts`                                  |
| A user-visible change                               | a `.changes/unreleased/` fragment                         |

Before extracting, run the `find-refactor-candidates` skill; to put a new
release into the games, run `adopt-framework`; to grow the surface, follow
`expand-framework` and `docs/extraction-roadmap.md`.

## Commit and PR conventions

- **Conventional Commits** (OSS_SPEC §8.1): `feat`, `fix`, `perf`, `docs`,
  `test`, `refactor`, `chore`, scoped by module (`fix(shots): …`).
- PRs are squash-merged; the PR title must itself be a conventional subject.
- Every PR touching `src/`, `tooling/` or `bin/` drops a fragment under
  `.changes/unreleased/` (CI's `changeset` job) or carries `no-changelog`.

## Cutting a release

Dispatch the `release` workflow on `main` with `bump: auto`. It derives the
bump from the fragments, collates `CHANGELOG.md`, bumps `package.json`,
rebuilds `dist/`, commits, tags `vX.Y.Z` and creates a GitHub Release. There
is no registry publish — the tag IS the release. `make bump` previews the
bump; `make changelog VERSION=X.Y.Z` previews the section.

## Documentation sync points

| If you change …                    | Also update …                                            |
| ---------------------------------- | -------------------------------------------------------- |
| A public export                    | `README.md`'s module table + a `.changes/` fragment       |
| A subpath / a module               | `package.json` `exports`, `tsup.config.ts` `MODULES`, `src/index.ts` |
| Anything in `src/`                 | `dist/` (`make build`), committed with it                 |
| What has been extracted, or should be | `docs/extraction-roadmap.md`                           |

## Agent skills (OSS_SPEC §21)

Skills live in `.agent/skills/<name>/SKILL.md`; `.claude/skills` is a symlink
to `.agent/skills`.

| Skill                      | When to run                                                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| `find-refactor-candidates` | Deciding what to extract next: clones the three games and ranks their files by cross-game similarity. |
| `adopt-framework`          | Putting a framework release into a game (or starting a new game on it): the tag, the imports, the engine line in `imports_test`, the digests. |
| `expand-framework`         | Landing one extraction end to end under the standing rules, off `docs/extraction-roadmap.md`.        |

## Governing spec

[`OSS_SPEC.md`](./OSS_SPEC.md) is the standing ruleset. The CLI, `man/`,
website and `examples/` sections are out of scope for a library; the hygiene,
AGENTS.md, commit, testing, file-size and skill rules apply.
