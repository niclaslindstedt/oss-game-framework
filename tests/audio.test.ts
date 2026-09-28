// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// THE INSTRUMENT'S DOM-FREE HALF — a sound played off a bank, a play's
// shape, the rack that steers layers and the fader views — under a
// recording synth, since Node has no AudioContext.

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DEFAULT_VOLUME, playDef, playSound } from "../src/audio/play";
import { createRack } from "../src/audio/rack";
import type { SoundBank } from "../src/audio/types";
import { scaledView } from "../src/audio/view";
import {
  MAX_CUTOFF_RATIO,
  MIN_ATTACK_MS,
  envelopeShape,
  safeCutoff,
  shaperPush,
  shaperSteepness,
  type Layer,
  type LayerSpec,
  type LayerTarget,
  type Synth,
} from "../src/audio/voice";

type Call = { call: string; options: Record<string, unknown> };

function recordingSynth(): { synth: Synth; calls: Call[]; layers: LayerTarget[] } {
  const calls: Call[] = [];
  const layers: LayerTarget[] = [];
  const synth: Synth = {
    unlock: () => calls.push({ call: "unlock", options: {} }),
    autostart: () => calls.push({ call: "autostart", options: {} }),
    resume: () => undefined,
    now: () => 0,
    tone: (options) => calls.push({ call: "tone", options }),
    noise: (options) => calls.push({ call: "noise", options }),
    layer: (_spec: LayerSpec): Layer => ({
      set: (target) => layers.push(target),
      stop: () => undefined,
      alive: () => true,
    }),
  };
  return { synth, calls, layers };
}

const BANK: SoundBank = {
  thump: {
    description: "a landing",
    voices: [
      { call: "tone", from: 80, to: 40, durationMs: 200 },
      { call: "noise", color: "brown", durationMs: 300, volume: 0.1 },
    ],
  },
};

describe("playing a sound (play.ts)", () => {
  it("hands the voices to the synth verbatim", () => {
    const { synth, calls } = recordingSynth();
    playSound(synth, BANK, "thump");
    expect(calls.map((c) => c.call)).toEqual(["tone", "noise"]);
    expect(calls[0].options).toEqual({ from: 80, to: 40, durationMs: 200 });
  });

  it("is silent for an unknown id", () => {
    const { synth, calls } = recordingSynth();
    playSound(synth, BANK, "nope");
    playSound(synth, BANK, undefined);
    expect(calls).toEqual([]);
  });

  it("shapes a play: louder, lower, longer", () => {
    const { synth, calls } = recordingSynth();
    playDef(synth, BANK.thump, { gain: 2, pitch: 0.5, stretch: 2 });
    expect(calls[0].options).toMatchObject({ from: 40, to: 20, durationMs: 400 });
    expect(calls[0].options.volume).toBeCloseTo(DEFAULT_VOLUME.tone * 2, 12);
    expect(calls[1].options.volume).toBeCloseTo(0.2, 12);
  });

  it("keeps DEFAULT_VOLUME in step with the synth's own defaults", () => {
    const src = readFileSync("src/audio/synth.ts", "utf8");
    expect(src).toContain(`volume = ${DEFAULT_VOLUME.tone},`);
    expect(src).toContain(`volume = ${DEFAULT_VOLUME.noise},`);
  });
});

describe("a fader (view.ts)", () => {
  it("scales one-shots and layers, and skips what it scales to nothing", () => {
    const { synth, calls, layers } = recordingSynth();
    let level = 0.5;
    const view = scaledView(synth, () => level);
    view.tone({ from: 100, durationMs: 10 });
    expect(calls[0].options.volume).toBeCloseTo(DEFAULT_VOLUME.tone / 2, 12);
    level = 0;
    view.noise({ durationMs: 10 });
    expect(calls).toHaveLength(1);
    level = 0.5;
    view.layer({ kind: "tone" } as unknown as LayerSpec)!.set({ level: 0.8 } as LayerTarget, 0.1);
    expect(layers[0].level).toBeCloseTo(0.4, 12);
    view.autostart();
    expect(calls.at(-1)!.call).toBe("autostart");
  });
});

describe("a rack of layers (rack.ts)", () => {
  it("builds each layer once and steers it on its own glide", () => {
    const { synth, layers } = recordingSynth();
    const rack = createRack(
      synth,
      { hum: {} as LayerSpec, hiss: {} as LayerSpec },
      { hum: 0.1, hiss: 0.2 },
    );
    rack.apply({ hum: { level: 1 } as LayerTarget, hiss: { level: 0 } as LayerTarget });
    expect(rack.live()).toBe(2);
    expect(layers).toHaveLength(2);
    rack.stop();
    expect(rack.live()).toBe(0);
  });
});

describe("the shape of a voice", () => {
  const SHAPES: [string, ReturnType<typeof envelopeShape>][] = [
    ["a held pad", envelopeShape(0.05, 0, 0.9, 300, 400, "exp")],
    ["a plucked note", envelopeShape(0.06, 0, 0.045, 0, 0, "exp")],
    ["a bare hi-hat burst", envelopeShape(0.009, 0, 0.014, 0, 0, "lin")],
    ["a swell", envelopeShape(0.03, 0, 0.4, 40, 200, "exp")],
  ];

  it("never starts a voice at full scale, however short or unshaped", () => {
    for (const [name, steps] of SHAPES) {
      expect(steps[0].value, name).toBeLessThanOrEqual(0.0001);
      expect(steps[0].ramp, name).toBe("set");
      expect(steps[1].at, name).toBeGreaterThan(steps[0].at);
      expect(steps[1].ramp, name).not.toBe("set");
    }
  });

  it("gets up to its peak fast enough that nothing is softened", () => {
    for (const [name, steps] of SHAPES) {
      if (name === "a held pad" || name === "a swell") continue;
      expect(steps[1].at, name).toBeLessThanOrEqual(MIN_ATTACK_MS / 1000 + 1e-9);
      expect(steps[1].value, name).toBeGreaterThan(0);
    }
  });

  it("holds a pad at its peak instead of falling through the sustain", () => {
    const pad = envelopeShape(0.05, 0, 0.9, 300, 400, "exp");
    const peaks = pad.filter((p) => p.value > 0.001);
    expect(peaks.length).toBe(2);
    expect(peaks[1].at - peaks[0].at).toBeCloseTo(0.4, 3);
    expect(pad[pad.length - 1].value).toBeLessThanOrEqual(0.0001);
  });

  it("saturates softly — the curve never steepens into a clip", () => {
    // A curve steep enough to be a square wave at half travel aliases, and
    // over a Bluetooth codec that is the torn-speaker sound.
    expect(shaperSteepness(0)).toBe(1);
    expect(shaperSteepness(1)).toBeLessThanOrEqual(10);
    expect(shaperSteepness(0.5)).toBeGreaterThan(shaperSteepness(0.2));
    expect(shaperPush(1)).toBeLessThanOrEqual(4);
  });
});

describe("what a filter may be asked for", () => {
  const HEADSET_CEILING = 16000 * MAX_CUTOFF_RATIO;

  it("holds a cutoff under Nyquist at every rate a context comes back at", () => {
    for (const rate of [48000, 44100, 32000, 24000, 16000, 8000]) {
      for (const hz of [20, 400, 2200, 8200, 12000, 19000]) {
        const safe = safeCutoff(hz, rate);
        expect(safe, `${hz} @ ${rate}`).toBeLessThan(rate / 2);
        expect(safe, `${hz} @ ${rate}`).toBeGreaterThanOrEqual(20);
      }
    }
  });

  it("bites on a cutoff that would go over, at the rate iOS hands a headset", () => {
    expect(safeCutoff(8200, 16000)).toBe(HEADSET_CEILING);
    expect(safeCutoff(8200, 48000)).toBe(8200);
    expect(safeCutoff(0, 48000)).toBe(20);
  });
});
