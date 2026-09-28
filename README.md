# oss-game-framework

Shared building blocks for browser racing games built on a **deterministic
engine** — extracted from the three sibling games
[`game2`](https://github.com/niclaslindstedt/game2) (rally),
[`game3`](https://github.com/niclaslindstedt/game3) (jet ski) and
[`game4`](https://github.com/niclaslindstedt/game4) (snowmobile), so a bug is
fixed once and pulled into every game, and a new game starts from the same
parts.

- **Engine-safe core** — the seeded PRNG, bit-exact `hypot`, value noise,
  heightfields, quaternions, the sun and the moon, a clock and an output
  module. Imports nothing; determinism digests are cut under it.
- **Racing** — the control tape every ghost and replay is kept on, the
  record book's policy (splits, what beats a row), the field's standings.
- **Audio** — a synthesized WebAudio instrument (no audio files), racks of
  steered layers, sound banks and fader views.
- **App plumbing** — the screenshot roll and gallery store, share/copy/save,
  the stamp and the HUD rastered into a picture, a service-worker update
  watch, touch-safe HUD presses and thumb zones, a menu cursor, the
  fixed-step run clock, the race clock's formatting.
- **Lab tooling** — the Node shelf every game's `scripts/` uses: a flag
  parser, a PNG encoder and raster, a static server, a Chromium finder, an
  `@engine` alias; plus the changeset release plumbing and the skill-lesson
  printer as `ogf-*` bins.

No UI framework: nothing here imports React or Preact.

## Install

The package is consumed straight off a release tag (no registry, no token):

```json
{
  "dependencies": {
    "@niclaslindstedt/oss-game-framework": "github:niclaslindstedt/oss-game-framework#v0.1.0"
  }
}
```

`dist/` is committed, so `npm ci` runs no build step. To upgrade, move the tag
and run `npm install`.

## Usage

Import a module, or a single file of one:

```ts
import { createRng } from "@niclaslindstedt/oss-game-framework/core/prng";
import { hypot } from "@niclaslindstedt/oss-game-framework/core/math";
import { createTapeRecorder, readTape } from "@niclaslindstedt/oss-game-framework/racing/tape";
import { createSynth, scaledView } from "@niclaslindstedt/oss-game-framework/audio";
```

A game's **engine** may import `core/*` and `racing/*` only; everything else
is for the app and its tests.

```ts
// A ghost's tape, in the game's own axes:
const SCHEMA = { steer: "signed", throttle: "lever", brake: "lever", flags: "flags" } as const;
const rec = createTapeRecorder(SCHEMA);
rec.record({
  steer: input.steer,
  throttle: input.throttle,
  brake: input.brake,
  flags: input.reset ? 1 : 0,
});
const tape = rec.seal(); // { steps, steer: "…", throttle: "…", … } — RLE + base64

// One synth, one fader per mix:
const raw = createSynth({ echo: { delayS: 0.19, feedback: 0.28, dampHz: 2200 } });
export const sfx = scaledView(raw, () => effectsVolume);

// The service worker's update watch, in Preact:
const watch = pwaUpdateWatch({ base: import.meta.env.BASE_URL, cacheId });
const { needRefresh } = useSyncExternalStore(watch.subscribe, watch.getSnapshot);
```

Node labs:

```js
import { parseArgs } from "@niclaslindstedt/oss-game-framework/tooling/cli";
import { createDrawing } from "@niclaslindstedt/oss-game-framework/tooling/draw";
import { aliasEngine } from "@niclaslindstedt/oss-game-framework/tooling/alias";
```

```sh
npx ogf-compute-bump          # the semver bump the fragments imply
npx ogf-check-changeset       # the PR's fragment gate (BASE_SHA, LABELS)
npx ogf-collate-changelog 1.2.0
npx ogf-extract-section 1.2.0
npx ogf-skill-lessons <skill> # the skill-reflection printer
```

## Modules

| Subpath     | Files → exports                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`      | `prng` (`createRng`, `Rng`) · `math` (`TAU`, `clamp`, `lerp`, `smoothstep`, `angleDiff`, `decay`, `approach`, `hypot`, `hypot3`, `hypot4`, `dist2`, `cellKey`, `blockOffsets`) · `noise` (`hash2`, `smooth`, `valueNoise`, `noiseField`, `sampleNoise`, `tiledValueNoise`) · `heightfield` (`createHeightfield`, `sampleField`, `sampleFieldGradient`, `fieldGradient`, `fillField`) · `polyline` (`segmentDistance`, `polylineDistance`) · `quat` (`identity`, `multiply`, `normalize`, `fromAxisAngle`, `rotate`, `unrotate`, `integrate`, `fromEuler`, `toEuler`) · `solar` (`sunAt`, `moonAt`, `hourOfElevation`, `daylightWindow`, `SOUTH`, `SYNODIC_MONTH`) · `clock` (`wallClock`, `preciseClock`, `fixedClock`) · `output` (`setOutputSink`, `setDebugEnabled`, `recentLogs`, `status`, `info`, `warn`, `error`, `header`, `debug`) |
| `racing`    | `tape` (`TapeSchema`, `snapAxis`, `createTapeRecorder`, `readTape`, `encodeStream`, `decodeStream`, `isControlTape`, `createFingerprint`) · `records` (`beats`, `noteRecord`, `bestIn`, `splitGap`, `readBook`, `isFigure`) · `standings` (`legProgress`, `isAhead`, `fieldOrder`, `placeAmong`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `audio`     | `voice` (the vocabulary: `ToneOptions`, `NoiseOptions`, `LayerSpec`, `Synth`, `envelopeShape`, …) · `synth` (`createSynth`) · `rack` (`createRack`) · `play` (`playSound`, `playDef`, `DEFAULT_VOLUME`) · `types` (`SoundDef`, `SoundBank`, `PlayShape`) · `view` (`scaledView`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `pwa`       | `pwa-update` (`pwaUpdateWatch`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `display`   | `viewport` (`viewportOf`, `visibleBox`, `MAX_DPR`, …) · `visible-viewport` (`watchVisibleViewport`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `shots`     | `shot-roll` · `shot-store` (`configureShotStore`, `putShot`, `loadShots`, …) · `shot-thumbs` · `share-image` (`shareImage`, `copyImage`, `copyWhenReady`, `saveImage`) · `shot-plan` (`shotSize`, `shotFileName`, `stampLayout`, `hudLayerSvg`, …) · `shot-hud` (`readHudLayer`, `drawHudLayer`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `input`     | `thumb-guard` (`createThumbGuard`) · `hud-press` (`createHudPress`, `pressHandlers`) · `menu-cursor` (`pickNeighbour`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `hud`       | `format` (`formatTime`, `formatDay`, `ordinal`, `formatScore`, `legible`) · `count` (`countAt`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `loop`      | `run-clock` (`createRunClock`, `MAX_FRAME_SECONDS`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `tooling/*` | `cli`, `png`, `draw`, `serve-dist`, `chromium`, `alias`, `release/*` (Node, plain `.mjs`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

Every module's source is shipped under `src/` too, for tools that inline it
(a game's audio audition page concatenates the synth's source).

## Development

```sh
npm install
make lint test build   # build rewrites dist/ — commit it
make check-dist        # what CI runs to hold dist/ to src/
```

See [AGENTS.md](AGENTS.md) for the rules (the engine line, bits not
closeness, no game's vocabulary), [CONTRIBUTING.md](CONTRIBUTING.md) for the
workflow and [docs/extraction-roadmap.md](docs/extraction-roadmap.md) for
what comes next.

## License

[PolyForm Noncommercial 1.0.0](LICENSE).
