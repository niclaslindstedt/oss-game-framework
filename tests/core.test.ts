// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// THE CORE POOL — held to the one promise every game's determinism digest
// stands on: the same inputs give the same BITS, today and after any edit.

import { readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { fixedClock, wallClock } from "../src/core/clock";
import { createHeightfield, fillField, sampleField } from "../src/core/heightfield";
import { angleDiff, clamp, hypot, hypot3, hypot4, lerp, smoothstep } from "../src/core/math";
import { noiseField, sampleNoise, tiledValueNoise, valueNoise } from "../src/core/noise";
import * as output from "../src/core/output";
import { polylineDistance, segmentDistance } from "../src/core/polyline";
import { createRng } from "../src/core/prng";
import * as quat from "../src/core/quat";
import {
  SUNRISE,
  daylightWindow,
  hourOfSunOnDate,
  julianDay,
  julianDayOfYear,
  lunarCoordinates,
  moonAt,
  moonOnDate,
  refraction,
  solarCoordinates,
  sunAt,
  sunOnDate,
  sunWindowOnDate,
} from "../src/core/solar";

describe("the seeded stream (prng.ts)", () => {
  it("replays a seed exactly — these numbers are what every digest was cut under", () => {
    const rng = createRng(38);
    const first = [rng.next(), rng.next(), rng.next()];
    const again = createRng(38);
    expect([again.next(), again.next(), again.next()]).toEqual(first);
    // mulberry32, seed 1 — pinned so an "improvement" to the generator fails here
    // rather than silently re-rolling every world in every game.
    expect(createRng(1).next()).toBe(0.6270739405881613);
  });

  it("keeps int in range, inclusive", () => {
    const rng = createRng(7);
    for (let i = 0; i < 500; i++) {
      const v = rng.int(2, 4);
      expect(v).toBeGreaterThanOrEqual(2);
      expect(v).toBeLessThanOrEqual(4);
    }
  });
});

describe("the math (math.ts)", () => {
  it("hypot is Math.hypot, bit for bit", () => {
    const rng = createRng(11);
    for (let i = 0; i < 2000; i++) {
      const a = (rng.next() - 0.5) * 10 ** rng.int(-3, 6);
      const b = (rng.next() - 0.5) * 10 ** rng.int(-3, 6);
      const c = (rng.next() - 0.5) * 10 ** rng.int(-3, 6);
      const d = (rng.next() - 0.5) * 10 ** rng.int(-3, 6);
      expect(hypot(a, b)).toBe(Math.hypot(a, b));
      expect(hypot3(a, b, c)).toBe(Math.hypot(a, b, c));
      expect(hypot4(a, b, c, d)).toBe(Math.hypot(a, b, c, d));
    }
    expect(hypot(0, 0)).toBe(0);
    expect(hypot(Infinity, Number.NaN)).toBe(Infinity);
  });

  it("clamps, lerps, eases and wraps angles", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(lerp(2, 4, 0.5)).toBe(3);
    expect(smoothstep(0, 1, 0.5)).toBe(0.5);
    expect(angleDiff(0.1, Math.PI * 2 - 0.1)).toBeCloseTo(-0.2, 12);
  });
});

describe("the noise (noise.ts)", () => {
  it("a cached field returns valueNoise's bits", () => {
    const f = noiseField(37, 5);
    for (let x = -50; x < 50; x += 3.7) {
      for (let z = -50; z < 50; z += 4.1) {
        expect(sampleNoise(f, x, z)).toBe(valueNoise(x, z, 37, 5));
      }
    }
  });

  it("a tiled lattice meets itself at its own edges", () => {
    expect(tiledValueNoise(0.3, 0.6, 8, 4, 9)).toBeCloseTo(tiledValueNoise(8.3, 4.6, 8, 4, 9), 9);
  });
});

describe("the heightfield (heightfield.ts)", () => {
  it("samples what it was filled with, and clamps past its edge", () => {
    const field = createHeightfield(0, 0, 1, 4, 4);
    fillField(field, (x, z) => x + 10 * z);
    expect(sampleField(field, 1.5, 2)).toBeCloseTo(21.5, 9);
    expect(sampleField(field, -100, 0)).toBe(sampleField(field, 0, 0));
  });
});

describe("the polyline (polyline.ts)", () => {
  it("measures to the nearest segment", () => {
    expect(segmentDistance(1, 1, 0, 0, 2, 0)).toBe(1);
    const line = [
      { x: 0, z: 0 },
      { x: 10, z: 0 },
      { x: 10, z: 10 },
    ];
    expect(polylineDistance(line, 12, 5)).toBe(2);
  });
});

describe("the quaternion (quat.ts)", () => {
  it("round-trips the rider's Euler angles", () => {
    const q = quat.fromEuler(0.4, 0.2, -0.3);
    const e = quat.toEuler(q);
    expect(e.heading).toBeCloseTo(0.4, 12);
    expect(e.pitch).toBeCloseTo(0.2, 12);
    expect(e.roll).toBeCloseTo(-0.3, 12);
  });

  it("puts heading 0 along +z, clockwise from above", () => {
    const f = quat.rotate(quat.fromEuler(Math.PI / 2, 0, 0), { x: 0, y: 0, z: 1 });
    expect(f.x).toBeCloseTo(1, 12);
    expect(f.z).toBeCloseTo(0, 12);
  });
});

describe("the sun and the moon (solar.ts)", () => {
  it("stands due south at noon, highest", () => {
    const noon = sunAt(12, 60, 0);
    expect(noon.azimuth).toBeCloseTo(Math.PI, 9);
    expect(noon.elevation).toBeGreaterThan(sunAt(10, 60, 0).elevation);
  });

  it("finds no daylight in a polar night and all of it under a midnight sun", () => {
    expect(daylightWindow(80, 0, -20)).toBeNull();
    expect(daylightWindow(80, 0, 20)).toEqual({ min: 0, max: 24 });
  });

  it("lights a full moon fully and a new one not at all", () => {
    expect(moonAt(0, 60, 0, 29.530589 / 2).lit).toBeCloseTo(1, 9);
    expect(moonAt(0, 60, 0, 0).lit).toBeCloseTo(0, 9);
  });
});

describe("the sun and the moon on a real date (solar.ts)", () => {
  const DEG = Math.PI / 180;

  it("counts Julian days as the almanacs do", () => {
    expect(julianDay(2000, 1, 1)).toBe(2451544.5);
    expect(julianDay(1992, 10, 13)).toBe(2448908.5);
    expect(julianDayOfYear(2026, 32)).toBe(julianDay(2026, 2, 1));
  });

  it("places the sun among the stars to a hundredth of a degree", () => {
    // Meeus's worked example: 13 October 1992, 0h — the apparent
    // declination −7.785° and the equation of time +13.71 min.
    const s = solarCoordinates(2448908.5);
    expect(s.declination).toBeCloseTo(-7.785, 2);
    expect(s.equationOfTime).toBeCloseTo(13.71, 1);
    // The solstices and the year's extremes of the equation of time.
    expect(solarCoordinates(julianDay(2026, 6, 21) + 0.35).declination).toBeCloseTo(23.44, 1);
    expect(solarCoordinates(julianDay(2026, 12, 21) + 0.9).declination).toBeCloseTo(-23.44, 1);
    expect(solarCoordinates(julianDay(2026, 2, 11)).equationOfTime).toBeCloseTo(-14.2, 0);
    expect(solarCoordinates(julianDay(2026, 11, 3)).equationOfTime).toBeCloseTo(16.4, 0);
  });

  it("lifts the sun about half a degree on the horizon and not at all overhead", () => {
    expect(refraction(0) / DEG).toBeCloseTo(0.482, 3);
    expect(refraction(10 * DEG) / DEG).toBeCloseTo(0.089, 2);
    expect(refraction(89 * DEG)).toBe(0);
    // Continuous where the fit changes piece.
    expect(refraction(-0.5751 * DEG)).toBeCloseTo(refraction(-0.5749 * DEG), 6);
  });

  it("stands the sun due south at solar noon, lifted by the air", () => {
    const jd0 = julianDay(2026, 2, 15);
    const noon = sunOnDate(12, 45, 7, jd0);
    expect(noon.azimuth).toBeCloseTo(Math.PI, 9);
    expect(noon.elevation).toBeGreaterThan(noon.trueElevation);
    expect(noon.trueElevation / DEG).toBeCloseTo(90 - 45 + noon.declination, 9);
  });

  it("rises the upper limb, not the centre, and sets it symmetric about noon", () => {
    // The equinox on the equator: a day some seven minutes longer than
    // twelve hours, all of it the refraction and the sun's half-width.
    const jd0 = julianDay(2026, 3, 20);
    const w = sunWindowOnDate(0, 0, jd0)!;
    expect((w.max - w.min - 12) * 60).toBeGreaterThan(5);
    expect((w.max - w.min - 12) * 60).toBeLessThan(9);
    const up = hourOfSunOnDate(SUNRISE, true, 0, 0, jd0)!;
    expect(sunOnDate(up, 0, 0, jd0).trueElevation / DEG).toBeCloseTo(-0.833, 4);
  });

  it("knows the midnight sun and the polar night", () => {
    expect(sunWindowOnDate(69, 18, julianDay(2026, 6, 21))).toEqual({ min: 0, max: 24 });
    expect(sunWindowOnDate(69, 18, julianDay(2026, 12, 21))).toBeNull();
    // ...and that the polar night's noon is still a twilight.
    const civil = sunWindowOnDate(69, 18, julianDay(2026, 12, 21), -6 * DEG);
    expect(civil).not.toBeNull();
    expect(civil!.min).toBeLessThan(12);
    // The southern winter is the northern summer's mirror.
    expect(sunWindowOnDate(-69, 18, julianDay(2026, 6, 21))).toBeNull();
  });

  it("places the moon among the stars to a few arc-minutes", () => {
    // Meeus's worked example: 12 April 1992, 0h — λ 133.163°, β −3.229°,
    // δ 13.768°, α 134.688°.
    const m = lunarCoordinates(julianDay(1992, 4, 12));
    expect(Math.abs(m.longitude - 133.163)).toBeLessThan(0.1);
    expect(Math.abs(m.latitude - -3.229)).toBeLessThan(0.1);
    expect(Math.abs(m.declination - 13.768)).toBeLessThan(0.1);
    expect(Math.abs(m.rightAscension - 134.688)).toBeLessThan(0.1);
    expect(m.distance).toBeGreaterThan(55);
    expect(m.distance).toBeLessThan(64);
  });

  it("lights the moon by its real phase on its real date", () => {
    // A new moon on 18 January 2026 at about 20h UT; a full one (eclipsed)
    // on 3 March 2026 at about 11h30 UT.
    const at = (y: number, mo: number, d: number, utc: number) =>
      moonOnDate(utc, 0, 0, julianDay(y, mo, d) + 0);
    const newMoon = moonOnDate(19.9, 0, 0, julianDay(2026, 1, 18));
    expect(newMoon.lit).toBeLessThan(0.01);
    expect(Math.min(newMoon.age, 29.530589 - newMoon.age)).toBeLessThan(0.3);
    const full = at(2026, 3, 3, 11.5);
    expect(full.lit).toBeGreaterThan(0.99);
    expect(full.age).toBeCloseTo(29.530589 / 2, 0);
  });

  it("stands a winter full moon high where the winter sun stands low", () => {
    // The full moon of 3 January 2026 at 45°N, round midnight.
    const jd0 = julianDay(2026, 1, 3);
    const moon = moonOnDate(0, 45, 0, jd0);
    expect(moon.declination).toBeGreaterThan(20);
    expect(moon.elevation / DEG).toBeGreaterThan(60);
    expect(moon.lit).toBeGreaterThan(0.95);
  });
});

describe("the clock (clock.ts)", () => {
  it("a fixed clock is fixed", () => {
    const c = fixedClock(5);
    expect(c.now()).toBe(5);
    expect(typeof wallClock.now()).toBe("number");
  });
});

describe("the output module (output.ts)", () => {
  it("replays the boot lines into a sink attached late, and gates debug", () => {
    output.status("booted");
    output.debug("hidden");
    const seen: string[] = [];
    output.setOutputSink((level, message) => seen.push(`${level}:${message}`));
    expect(seen).toContain("status:booted");
    expect(seen).not.toContain("debug:hidden");
    output.setDebugEnabled(true);
    output.debug("shown");
    expect(seen).toContain("debug:shown");
    output.setOutputSink(null);
    output.setDebugEnabled(false);
  });
});

describe("the pool's own promise", () => {
  it("imports nothing — not a browser, not Node, not another module of the framework", () => {
    for (const file of readdirSync("src/core")) {
      // Code only: the comments are allowed to name what the code may not use.
      const src = readFileSync(`src/core/${file}`, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "");
      for (const m of src.matchAll(/from "([^"]+)"/g)) expect(m[1]).toMatch(/^\.\//);
      expect(src).not.toMatch(/Math\.random|\bdocument\.|\bwindow\./);
    }
  });
});
