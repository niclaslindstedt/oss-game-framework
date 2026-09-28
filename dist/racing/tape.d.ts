/** Positions each side of centre on a signed axis. */
declare const SIGNED_STEPS = 127;
/** Positions on a lever, 0 to full. */
declare const LEVER_STEPS = 255;
/** How an axis is kept on the tape. */
type AxisKind = "signed" | "lever" | "flags";
/** A tape's layout: every stream's name and how it is kept. The KEYS are the
 * stream names written into the stored tape, so renaming one is a format
 * change. */
type TapeSchema<K extends string> = Readonly<Record<K, AxisKind>>;
/** One run's controls and nothing else: how many steps it runs for, and one
 * RLE'd, base64'd byte per step per stream. */
type ControlTape<K extends string> = {
  steps: number;
} & Record<K, string>;
/** Snap a value onto a recorded grid of `steps` positions per unit. Centre
 * comes back as a POSITIVE zero: rounding a hair below it yields -0, which
 * the tape cannot write down. */
declare function snapToGrid(v: number, steps: number): number;
/** ONE AXIS ON THE GRID THE TAPE WRITES: clamped to the axis's range, then
 * snapped. Applying it twice is free — a value on the grid snaps to itself.
 * A `flags` axis is returned as it came. */
declare function snapAxis(v: number, kind: AxisKind): number;
/** The byte an axis value is written as. */
declare function axisToByte(v: number, kind: AxisKind): number;
/** The value a byte reads back as. */
declare function byteToAxis(b: number, kind: AxisKind): number;
/** Run-length encode a byte per step, then base64 it: (run, value) pairs, a
 * run capped at 255 steps and simply continued in the next pair. A throttle
 * buried down a straight is two bytes for two seconds. */
declare function encodeStream(values: readonly number[]): string;
/** Decode `steps` bytes back out. A short or damaged tape leaves its tail at
 * zero rather than throwing: a ghost is a picture, and half a picture beats
 * a crash on the first frame of a run. */
declare function decodeStream(text: string, steps: number): Uint8Array;
type TapeRecorder<K extends string> = {
  /** Write down the controls a step was ridden on — the input the engine
   * ACTUALLY received, one value per stream. */
  record: (values: Readonly<Record<K, number>>) => void;
  steps: () => number;
  /** The tape as it stands; callable mid-run. */
  seal: () => ControlTape<K>;
};
/** A recorder for a tape of `schema`'s layout. */
declare function createTapeRecorder<K extends string>(schema: TapeSchema<K>): TapeRecorder<K>;
type TapeReader<K extends string> = {
  steps: number;
  /** The controls step `step` was ridden on, written into `out` (and
   * returned) — or null once the tape has run out or before it starts, the
   * caller's cue to hand the engine its neutral input. */
  at: (step: number, out: Record<K, number>) => Record<K, number> | null;
};
/** Put a tape back on the ground. */
declare function readTape<K extends string>(
  tape: ControlTape<K>,
  schema: TapeSchema<K>,
): TapeReader<K>;
/** Whether a parsed blob carries every stream `schema` names and a positive
 * whole step count — the shape check a stored tape owes before it is read.
 * What ELSE a stored run must carry (its map, its figure) is the game's. */
declare function isControlTape<K extends string>(
  parsed: unknown,
  schema: TapeSchema<K>,
): parsed is ControlTape<K>;
/** A FINGERPRINT: FNV-1a over a sequence of numbers, each rounded to a
 * hundredth and mixed as a 32-bit integer. Cheap, and enough to tell a map a
 * generator has moved from the one a tape was ridden on — feed it the seed,
 * the loop's length and every checkpoint's place. */
type Fingerprint = {
  mix: (v: number) => Fingerprint;
  /** Eight hex digits. */
  digest: () => string;
};
declare function createFingerprint(): Fingerprint;

export {
  type AxisKind,
  type ControlTape,
  type Fingerprint,
  LEVER_STEPS,
  SIGNED_STEPS,
  type TapeReader,
  type TapeRecorder,
  type TapeSchema,
  axisToByte,
  byteToAxis,
  createFingerprint,
  createTapeRecorder,
  decodeStream,
  encodeStream,
  isControlTape,
  readTape,
  snapAxis,
  snapToGrid,
};
