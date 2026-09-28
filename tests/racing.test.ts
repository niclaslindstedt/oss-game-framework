// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// THE RACING MODULE — the control tape, the record book and the standings.
//
// The tape is held to more than a round trip: to the exact BYTES the games
// wrote before it was lifted out of them, because every ghost a player has
// on file was written in that format, and a tape that reads back a hair off
// is a ghost that misses the first corner.

import { describe, expect, it } from "vitest";

import { beats, noteRecord, readBook, splitGap, type RecordRow } from "../src/racing/records";
import { fieldOrder, isAhead, legProgress, placeAmong } from "../src/racing/standings";
import {
  createFingerprint,
  createTapeRecorder,
  decodeStream,
  encodeStream,
  isControlTape,
  readTape,
  snapAxis,
  type TapeSchema,
} from "../src/racing/tape";

const SCHEMA = { steer: "signed", throttle: "lever", flags: "flags" } as const satisfies TapeSchema<
  "steer" | "throttle" | "flags"
>;

describe("the control tape (tape.ts)", () => {
  it("snaps onto the grid, and a snapped value snaps to itself", () => {
    expect(snapAxis(0.5, "signed")).toBe(Math.round(0.5 * 127) / 127);
    expect(snapAxis(2, "lever")).toBe(1);
    expect(Object.is(snapAxis(-0.001, "signed"), 0)).toBe(true);
    const v = snapAxis(0.3337, "lever");
    expect(snapAxis(v, "lever")).toBe(v);
  });

  it("writes the byte format the games' ghosts were stored in", () => {
    // The games' own recorder, as it was: round(clamp(v) * 127) + 127 for a
    // signed axis, round(clamp(v) * 255) for a lever, RLE + base64 after.
    const steer = [0, 0.5, -1, -1, 1];
    const throttle = [0, 1, 1, 0.5, 0];
    const flags = [0, 1, 0, 0, 2];
    const legacySteer = encodeStream(steer.map((v) => Math.round(v * 127) + 127));
    const legacyThrottle = encodeStream(throttle.map((v) => Math.round(v * 255)));
    const rec = createTapeRecorder(SCHEMA);
    steer.forEach((s, i) => rec.record({ steer: s, throttle: throttle[i], flags: flags[i] }));
    const tape = rec.seal();
    expect(tape.steps).toBe(5);
    expect(tape.steer).toBe(legacySteer);
    expect(tape.throttle).toBe(legacyThrottle);
    expect(tape.flags).toBe(encodeStream(flags));
  });

  it("reads back what was ridden on the grid, exactly", () => {
    const rec = createTapeRecorder(SCHEMA);
    const ridden = [
      { steer: snapAxis(0.25, "signed"), throttle: snapAxis(0.7, "lever"), flags: 1 },
      { steer: snapAxis(-0.9, "signed"), throttle: 0, flags: 0 },
    ];
    for (const r of ridden) rec.record(r);
    const reader = readTape(rec.seal(), SCHEMA);
    const out = { steer: 0, throttle: 0, flags: 0 };
    expect(reader.at(0, out)).toEqual(ridden[0]);
    expect(reader.at(1, out)).toEqual(ridden[1]);
    expect(reader.at(2, out)).toBeNull();
    expect(reader.at(-1, out)).toBeNull();
  });

  it("keeps a long run short, and a damaged one readable", () => {
    const held = new Array(1000).fill(200);
    expect(encodeStream(held).length).toBeLessThan(16);
    expect(Array.from(decodeStream(encodeStream(held), 1000))).toEqual(held);
    expect(Array.from(decodeStream("not base64!!", 3))).toEqual([0, 0, 0]);
  });

  it("checks a stored tape's shape before it is read", () => {
    const tape = createTapeRecorder(SCHEMA);
    tape.record({ steer: 0, throttle: 0, flags: 0 });
    expect(isControlTape(tape.seal(), SCHEMA)).toBe(true);
    expect(isControlTape({ steps: 1, steer: "", throttle: "" }, SCHEMA)).toBe(false);
    expect(isControlTape({ steps: 0, steer: "", throttle: "", flags: "" }, SCHEMA)).toBe(false);
  });

  it("fingerprints like the games' mapPrint", () => {
    let hash = 0x811c9dc5;
    const mix = (v: number): void => {
      const n = Math.round(v * 100) | 0;
      for (let s = 0; s < 32; s += 8) {
        hash ^= (n >>> s) & 0xff;
        hash = Math.imul(hash, 0x01000193) >>> 0;
      }
    };
    [38, 1234.5, -7.25, 3].forEach(mix);
    const print = createFingerprint();
    [38, 1234.5, -7.25, 3].forEach((v) => print.mix(v));
    expect(print.digest()).toBe(hash.toString(16).padStart(8, "0"));
  });
});

type Row = RecordRow & { vehicle: string };

describe("the record book (records.ts)", () => {
  it("is beaten outright, never on a tie, and never by a non-figure", () => {
    expect(beats(10, null)).toBe(true);
    expect(beats(10, { value: 10 })).toBe(false);
    expect(beats(9.99, { value: 10 })).toBe(true);
    expect(beats(0, null)).toBe(false);
    expect(beats(Number.NaN, null)).toBe(false);
    expect(beats(11, { value: 10 }, "higher")).toBe(true);
  });

  it("files a copy and leaves the book it was handed alone", () => {
    const book = {};
    const run: Row = { value: 62.5, at: 1, vehicle: "fox", splits: [0, 30] };
    const { book: next, record } = noteRecord<Row>(book, "race/38", run);
    expect(record).toBe(true);
    expect(book).toEqual({});
    run.splits!.push(99);
    expect(next["race/38"].splits).toEqual([0, 30]);
    expect(noteRecord<Row>(next, "race/38", { ...run, value: 70 }).record).toBe(false);
  });

  it("measures the gap at a crossing, negative ahead", () => {
    const record = { splits: [0, 30, 61] };
    expect(splitGap(record, 1, 29)).toBe(-1);
    expect(splitGap(record, 5, 29)).toBeNull();
    expect(splitGap(null, 0, 1)).toBeNull();
  });

  it("reads a stored book one row at a time, dropping what no run could set", () => {
    const book = readBook<Row>(
      {
        good: { value: 60, at: 5, vehicle: "fox", splits: [0, "x", 30] },
        bad: { value: -1, vehicle: "fox" },
        gone: { value: 50, vehicle: "retired" },
        junk: 7,
      },
      (raw, row) => (raw.vehicle === "fox" ? { ...row, vehicle: "fox" } : null),
      { splits: true },
    );
    expect(Object.keys(book)).toEqual(["good"]);
    expect(book.good).toEqual({ value: 60, at: 5, vehicle: "fox", splits: [0, 30] });
    expect(readBook<Row>(null, () => null)).toEqual({});
  });
});

describe("the standings (standings.ts)", () => {
  const home = (time: number) => ({ finished: true, time, progress: 0 });
  const out = (progress: number) => ({ finished: false, time: 0, progress });

  it("puts home first, by the clock, then further round", () => {
    expect(isAhead(home(90), out(99))).toBe(true);
    expect(isAhead(home(90), home(91))).toBe(true);
    expect(isAhead(out(3.5), out(3.2))).toBe(true);
    expect(isAhead(out(3), out(3))).toBe(false);
  });

  it("orders a field and places a rider in it", () => {
    const field = [
      { id: "a", s: out(2.1) },
      { id: "b", s: home(80) },
      { id: "c", s: out(2.9) },
    ];
    expect(fieldOrder(field, (e) => e.s).map((e) => e.id)).toEqual(["b", "c", "a"]);
    expect(placeAmong(out(2.5), [home(80), out(2.9), out(2.1)])).toBe(3);
  });

  it("counts the leg covered, capped short of the next checkpoint and not floored", () => {
    const from = { x: 0, z: 0 };
    const next = { x: 0, z: 100 };
    expect(legProgress(2, from, next, 0, 50)).toBe(2.5);
    expect(legProgress(2, from, next, 0, 100)).toBe(2.999);
    expect(legProgress(0, from, next, 0, -20)).toBeCloseTo(-0.2, 12);
  });
});
