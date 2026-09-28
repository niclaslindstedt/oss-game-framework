// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// THE RUN CLOCK — the accumulator between the display's frames and the
// engine's fixed steps, held to its three decisions.

import { describe, expect, it } from "vitest";

import { MAX_FRAME_SECONDS, createRunClock } from "../src/loop/run-clock";

const HZ = 120;

describe("the run clock (loop/run-clock.ts)", () => {
  it("steps whole steps and carries the fraction", () => {
    const clock = createRunClock(HZ);
    let steps = 0;
    for (let i = 0; i < 60; i++) steps += clock.frame(1 / 60);
    expect(steps).toBe(HZ);
    expect(clock.alpha()).toBeGreaterThanOrEqual(0);
    expect(clock.alpha()).toBeLessThan(1);
  });

  it("drops a stall rather than paying it down", () => {
    const clock = createRunClock(HZ);
    const steps = clock.frame(5);
    expect(steps).toBe(Math.floor(MAX_FRAME_SECONDS * HZ + 1e-9));
    expect(clock.dropped()).toBeCloseTo(5 - MAX_FRAME_SECONDS);
  });

  it("takes no steps while away, and the first frame back is one frame long", () => {
    const clock = createRunClock(HZ);
    clock.pause();
    expect(clock.frame(1 / 60)).toBe(0);
    clock.resume();
    expect(clock.frame(1 / 60)).toBe(2);
  });
});

describe("a clamp of the game's own", () => {
  it("drops everything past the clamp it was built with", () => {
    const clock = createRunClock(120, 0.05);
    expect(clock.frame(1)).toBe(6);
    expect(clock.dropped()).toBeCloseTo(0.95, 9);
  });
});
