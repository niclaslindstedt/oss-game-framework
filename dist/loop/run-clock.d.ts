/** The most frame time one frame may hand the accumulator, s — the default
 * clamp; `createRunClock` takes another. Twelve steps at 120 Hz — a frame a good deal longer than that is a stall, not a slow
 * frame, and its time is dropped. */
declare const MAX_FRAME_SECONDS = 0.1;
type RunClock = {
  /** Hand the clock `elapsed` seconds of wall time since the last frame;
   * get back how many fixed steps to take now. Zero while paused. */
  frame: (elapsed: number) => number;
  /** Fraction of a step left over after the last `frame`, 0..1 — the
   * renderer's interpolation weight, never the engine's. */
  alpha: () => number;
  /** The tab went away: nothing steps until `resume`. */
  pause: () => void;
  /** The tab is back: the absence is forgotten, the next frame is one
   * frame long. */
  resume: () => void;
  paused: () => boolean;
  /** Seconds of frame time dropped so far by the clamp — a diagnostic the
   * developer overlay will print, so a stuttering machine can be named. */
  dropped: () => number;
};
/** A clock stepping at `hz` fixed steps a second. */
declare function createRunClock(hz: number, maxFrame?: number): RunClock;

export { MAX_FRAME_SECONDS, type RunClock, createRunClock };
