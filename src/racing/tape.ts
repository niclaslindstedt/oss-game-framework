// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// THE CONTROL TAPE — a run kept as the CONTROLS that rode it.
//
// A game on a deterministic engine (a fixed step, no `Math.random`, every
// draw off a seeded stream) puts the machine over the same metre of ground
// every time it is handed the same map and the same sequence of inputs. So a
// ghost, a replay or a recorded bot run is a tape of what the rider's hands
// did rather than a path of where the vehicle went: a few kilobytes for a
// lap, and a run that jumps, lands and resets EXACTLY the way it did —
// because it is the same physics doing it rather than an interpolation.
//
// THE BARGAIN THAT BUYS IT IS ONE NUMBER PER AXIS. Every control is snapped
// onto a fixed grid (`snapAxis`) at the place the player's input is produced
// and again wherever the app hands the engine any input at all, so the
// figure the engine is ridden on IS the figure the tape writes down. Record
// anything the engine did not receive and the replay walks off the line a
// checkpoint later. At 1/127 of full lock and 1/255 of a lever the grid is
// finer than a thumb or a key ramp can resolve.
//
// A TAPE IS A SCHEMA OF AXES, each one byte per step, run-length encoded and
// base64'd: `signed` axes (steering, lean — -1..1 on 255 positions about a
// centre), `lever` axes (throttle, brake — 0..1 on 256), and `flags` (up to
// eight booleans packed into a byte — a reset's edge, a trick button held).
// The game names its axes and maps its own input shape onto them; the byte
// format is this file's, which is what lets one fix here reach every game's
// ghosts without moving a single stored tape.
//
// Pure: no storage, no DOM. `btoa` / `atob` are the only globals, and both
// are in every browser and in Node 16+.

/** Positions each side of centre on a signed axis. */
export const SIGNED_STEPS = 127;

/** Positions on a lever, 0 to full. */
export const LEVER_STEPS = 255;

/** How an axis is kept on the tape. */
export type AxisKind = "signed" | "lever" | "flags";

/** A tape's layout: every stream's name and how it is kept. The KEYS are the
 * stream names written into the stored tape, so renaming one is a format
 * change. */
export type TapeSchema<K extends string> = Readonly<Record<K, AxisKind>>;

/** One run's controls and nothing else: how many steps it runs for, and one
 * RLE'd, base64'd byte per step per stream. */
export type ControlTape<K extends string> = { steps: number } & Record<K, string>;

function clampTo(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/** Snap a value onto a recorded grid of `steps` positions per unit. Centre
 * comes back as a POSITIVE zero: rounding a hair below it yields -0, which
 * the tape cannot write down. */
export function snapToGrid(v: number, steps: number): number {
  const index = Math.round(v * steps);
  return index === 0 ? 0 : index / steps;
}

/** ONE AXIS ON THE GRID THE TAPE WRITES: clamped to the axis's range, then
 * snapped. Applying it twice is free — a value on the grid snaps to itself.
 * A `flags` axis is returned as it came. */
export function snapAxis(v: number, kind: AxisKind): number {
  if (kind === "signed") return snapToGrid(clampTo(v, -1, 1), SIGNED_STEPS);
  if (kind === "lever") return snapToGrid(clampTo(v, 0, 1), LEVER_STEPS);
  return v;
}

/** The byte an axis value is written as. */
export function axisToByte(v: number, kind: AxisKind): number {
  if (kind === "signed") return Math.round(clampTo(v, -1, 1) * SIGNED_STEPS) + SIGNED_STEPS;
  if (kind === "lever") return Math.round(clampTo(v, 0, 1) * LEVER_STEPS);
  return v & 0xff;
}

/** The value a byte reads back as. */
export function byteToAxis(b: number, kind: AxisKind): number {
  if (kind === "signed") return (b - SIGNED_STEPS) / SIGNED_STEPS;
  if (kind === "lever") return b / LEVER_STEPS;
  return b;
}

/** `String.fromCharCode` takes its bytes as arguments, and a whole run's
 * worth at once overflows the call stack. */
const BASE64_CHUNK = 0x8000;

function toBase64(bytes: number[]): string {
  let raw = "";
  for (let i = 0; i < bytes.length; i += BASE64_CHUNK) {
    raw += String.fromCharCode(...bytes.slice(i, i + BASE64_CHUNK));
  }
  return btoa(raw);
}

function fromBase64(text: string): Uint8Array {
  const raw = atob(text);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/** Run-length encode a byte per step, then base64 it: (run, value) pairs, a
 * run capped at 255 steps and simply continued in the next pair. A throttle
 * buried down a straight is two bytes for two seconds. */
export function encodeStream(values: readonly number[]): string {
  const out: number[] = [];
  let i = 0;
  while (i < values.length) {
    const value = values[i];
    let run = 1;
    while (run < 255 && i + run < values.length && values[i + run] === value) run++;
    out.push(run, value);
    i += run;
  }
  return toBase64(out);
}

/** Decode `steps` bytes back out. A short or damaged tape leaves its tail at
 * zero rather than throwing: a ghost is a picture, and half a picture beats
 * a crash on the first frame of a run. */
export function decodeStream(text: string, steps: number): Uint8Array {
  const out = new Uint8Array(steps);
  let bytes: Uint8Array;
  try {
    bytes = fromBase64(text);
  } catch {
    return out;
  }
  let at = 0;
  for (let i = 0; i + 1 < bytes.length && at < steps; i += 2) {
    const run = Math.min(bytes[i], steps - at);
    out.fill(bytes[i + 1], at, at + run);
    at += run;
  }
  return out;
}

function streamsOf<K extends string>(schema: TapeSchema<K>): K[] {
  return Object.keys(schema) as K[];
}

export type TapeRecorder<K extends string> = {
  /** Write down the controls a step was ridden on — the input the engine
   * ACTUALLY received, one value per stream. */
  record: (values: Readonly<Record<K, number>>) => void;
  steps: () => number;
  /** The tape as it stands; callable mid-run. */
  seal: () => ControlTape<K>;
};

/** A recorder for a tape of `schema`'s layout. */
export function createTapeRecorder<K extends string>(schema: TapeSchema<K>): TapeRecorder<K> {
  const names = streamsOf(schema);
  const streams = new Map<K, number[]>(names.map((n) => [n, []]));
  let steps = 0;
  return {
    record: (values) => {
      for (const n of names) streams.get(n)!.push(axisToByte(values[n], schema[n]));
      steps++;
    },
    steps: () => steps,
    seal: () => {
      const tape = { steps } as ControlTape<K>;
      for (const n of names) (tape as Record<K, string>)[n] = encodeStream(streams.get(n)!);
      return tape;
    },
  };
}

export type TapeReader<K extends string> = {
  steps: number;
  /** The controls step `step` was ridden on, written into `out` (and
   * returned) — or null once the tape has run out or before it starts, the
   * caller's cue to hand the engine its neutral input. */
  at: (step: number, out: Record<K, number>) => Record<K, number> | null;
};

/** Put a tape back on the ground. */
export function readTape<K extends string>(
  tape: ControlTape<K>,
  schema: TapeSchema<K>,
): TapeReader<K> {
  const names = streamsOf(schema);
  const steps = tape.steps;
  const bytes = new Map<K, Uint8Array>(names.map((n) => [n, decodeStream(tape[n], steps)]));
  return {
    steps,
    at: (step, out) => {
      if (step < 0 || step >= steps) return null;
      for (const n of names) out[n] = byteToAxis(bytes.get(n)![step], schema[n]);
      return out;
    },
  };
}

/** Whether a parsed blob carries every stream `schema` names and a positive
 * whole step count — the shape check a stored tape owes before it is read.
 * What ELSE a stored run must carry (its map, its figure) is the game's. */
export function isControlTape<K extends string>(
  parsed: unknown,
  schema: TapeSchema<K>,
): parsed is ControlTape<K> {
  if (typeof parsed !== "object" || parsed === null) return false;
  const tape = parsed as Record<string, unknown>;
  if (!Number.isInteger(tape.steps) || (tape.steps as number) <= 0) return false;
  return streamsOf(schema).every((n) => typeof tape[n] === "string");
}

/** A FINGERPRINT: FNV-1a over a sequence of numbers, each rounded to a
 * hundredth and mixed as a 32-bit integer. Cheap, and enough to tell a map a
 * generator has moved from the one a tape was ridden on — feed it the seed,
 * the loop's length and every checkpoint's place. */
export type Fingerprint = {
  mix: (v: number) => Fingerprint;
  /** Eight hex digits. */
  digest: () => string;
};

export function createFingerprint(): Fingerprint {
  let hash = 0x811c9dc5;
  const print: Fingerprint = {
    mix: (v) => {
      const n = Math.round(v * 100) | 0;
      for (let s = 0; s < 32; s += 8) {
        hash ^= (n >>> s) & 0xff;
        hash = Math.imul(hash, 0x01000193) >>> 0;
      }
      return print;
    },
    digest: () => hash.toString(16).padStart(8, "0"),
  };
  return print;
}
