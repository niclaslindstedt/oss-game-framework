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
import type { Layer, LayerSpec, LayerTarget, Synth } from "../src/audio/voice";

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
