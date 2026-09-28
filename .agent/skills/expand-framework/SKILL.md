---
name: expand-framework
description: "Use when landing one extraction into the framework end to end — picking the next row of docs/extraction-roadmap.md, making it generic, testing it to the bit, wiring the exports, and putting it into every game that carried a copy."
---

# Expand the framework

One module (or one file into an existing module) per pass, end to end.

## The standing rules

- **Generic names only.** No `sled`, `craft`, `car`, `buoy`, `stage`,
  `coast` in a published name or its comments. The litmus test: a fourth
  racing game reuses it without inheriting a word of the first three.
- **Constants become options, with the most common value as the default**
  (`createSynth({ echo })`, `readHudLayer({ hud, exclude })`,
  `createRunClock(hz, maxFrame)`).
- **Bits, not closeness.** Anything a game's engine or a stored blob sees
  keeps its exact arithmetic and byte format. Prove it in a test against the
  games' previous code (see `tests/racing.test.ts`'s tape and fingerprint).
- **The engine line.** Engine-safe code goes in `core/` or `racing/` and
  imports nothing but `core/`. Browser code goes anywhere else.
- **No UI framework.** Hand out stores and handlers, not hooks.
- **Take the best of every copy.** Where the games' copies drifted, the
  extraction carries the fix from the one that has it.

## Steps

1. Diff every game's copy code-only; list what differs and decide per
   difference: option, union, or the fix wins.
2. Write `src/<module>/<file>.ts` with extensionless relative imports; add it
   to `src/<module>/index.ts` (new module: `MODULES` in `tsup.config.ts`, the
   `exports` map in `package.json`, `src/index.ts`).
3. Port the games' tests for it into `tests/<module>.test.ts`, plus a
   regression test for any fix one game had and the others lacked.
4. `make lint test build`, commit `dist/` with the source.
5. Add a `.changes/unreleased/` fragment; update the README's module table and
   `docs/extraction-roadmap.md`.
6. After the release: run `adopt-framework` in every game that carried a copy
   and DELETE the copy — a module left behind is the drift this repo exists
   to end.
