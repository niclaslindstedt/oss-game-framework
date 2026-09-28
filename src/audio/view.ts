// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// A VOLUME-SCALED VIEW of one synth — how a game puts its faders on the one
// instrument without building a second one.
//
// One synth rather than one per subsystem is not a saving, it is the
// requirement: a browser gives a page one usable AudioContext's worth of
// goodwill, and the echo bus and the master limiter only do their jobs if
// every voice in the game passes through the same pair. So a game makes ONE
// `createSynth()` and wraps it in a view per fader (effects, the engine, a
// score), each reading its own live volume.
//
// The defaults mirror the synth's own, because a voice that leaves `volume`
// off still has to be scaled by the fader — and the only way to scale a
// default is to know it (`DEFAULT_VOLUME`, which `tests/audio.test.ts` pins
// to the synth). A one-shot scaled to nothing is skipped outright rather
// than played at zero. A LAYER is steered every frame, so the fader is read
// every frame and one moved mid-run is heard at once.

import { DEFAULT_VOLUME } from "./play";
import type { Layer, Synth } from "./voice";

/** Below this a one-shot is not played at all. */
const SILENT = 0.001;

export function scaledView(raw: Synth, volume: () => number): Synth {
  return {
    unlock: () => raw.unlock(),
    autostart: () => raw.autostart(),
    resume: () => raw.resume(),
    now: () => raw.now(),
    tone(options) {
      const scaled = (options.volume ?? DEFAULT_VOLUME.tone) * volume();
      if (scaled < SILENT) return;
      raw.tone({ ...options, volume: scaled });
    },
    noise(options) {
      const scaled = (options.volume ?? DEFAULT_VOLUME.noise) * volume();
      if (scaled < SILENT) return;
      raw.noise({ ...options, volume: scaled });
    },
    layer(spec): Layer | null {
      const inner = raw.layer(spec);
      if (!inner) return null;
      return {
        set: (target, glideS) => inner.set({ ...target, level: target.level * volume() }, glideS),
        stop: () => inner.stop(),
        alive: () => inner.alive(),
      };
    },
  };
}

/** Clamp to the 0–1 a fader promises. */
export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
