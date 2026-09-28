// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// HOW A HUD WRITES ITS FIGURES, and how one counts to its next value.

import { describe, expect, it } from "vitest";

import { COUNT_SECONDS, countAt } from "../src/hud/count";
import { formatDay, formatScore, formatTime, legible, ordinal } from "../src/hud/format";

describe("the figures (format.ts)", () => {
  it("writes a race clock in hundredths, and never a negative one", () => {
    expect(formatTime(166.855)).toBe(`2'46"85`);
    expect(formatTime(5.009)).toBe(`0'05"00`);
    expect(formatTime(-3)).toBe(`0'00"00`);
  });

  it("gets the three teens right", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 111].map(ordinal)).toEqual([
      "1ST",
      "2ND",
      "3RD",
      "4TH",
      "11TH",
      "12TH",
      "13TH",
      "21ST",
      "22ND",
      "111TH",
    ]);
  });

  it("groups a score's thousands by hand", () => {
    expect(formatScore(5936)).toBe("5,936");
    expect(formatScore(1234567.4)).toBe("1,234,567");
    expect(formatScore(-5)).toBe("0");
  });

  it("dates a row with a year only outside this one", () => {
    const now = new Date(2026, 8, 28).getTime();
    expect(formatDay(new Date(2026, 8, 12).getTime(), now)).toBe("12 SEP");
    expect(formatDay(new Date(2024, 8, 12).getTime(), now)).toBe("12 SEP 24");
    expect(formatDay(0, now)).toBe("");
  });

  it("lifts a dark paint to a plate ink can be read on, and leaves a bright one", () => {
    expect(legible(0xffffff)).toBe("rgb(255,255,255)");
    expect(legible(0x000080)).not.toBe("rgb(0,0,128)");
  });
});

describe("a figure that counts (count.ts)", () => {
  it("leaves at once, settles and stops at the target", () => {
    expect(countAt(0, 100, 0)).toBe(0);
    expect(countAt(0, 100, COUNT_SECONDS / 4)).toBeGreaterThan(25);
    expect(countAt(0, 100, COUNT_SECONDS)).toBe(100);
    expect(countAt(0, 100, 99)).toBe(100);
  });
});
