declare const TAU: number;
declare function clamp(v: number, min: number, max: number): number;
declare function lerp(a: number, b: number, t: number): number;
/** Hermite ease from 0 at `a` to 1 at `b`, clamped either side. */
declare function smoothstep(a: number, b: number, v: number): number;
/** Signed shortest angular difference `b - a`, in (-π, π]. */
declare function angleDiff(a: number, b: number): number;
/** Exponential decay of `v` toward zero with rate `k` (per second). */
declare function decay(v: number, k: number, dt: number): number;
/** Move `v` toward `target` by at most `maxDelta`. */
declare function approach(v: number, target: number, maxDelta: number): number;
/** `Math.hypot(a, b)`, bit for bit, several times cheaper.
 *
 * `Math.hypot` is a builtin call that boxes its arguments into an array and
 * Kahan-sums them after scaling by the largest — tens of nanoseconds, against
 * two for a bare square root, and the engine asks it on every probe, trunk
 * and track segment of every step. This is that same recipe (V8's, the one
 * the suite's digests were cut under) in plain arithmetic: every operation
 * in it is correctly rounded by IEEE 754, so it returns the same bits in
 * every browser, which a builtin whose algorithm each engine chooses for
 * itself does not promise. A bare `sqrt(a² + b²)` is NOT a substitute: it
 * differs in the last bit about a third of the time, and the determinism
 * contract is bits. */
declare function hypot(a: number, b: number): number;
/** `Math.hypot(a, b, c)`, bit for bit — `hypot`'s recipe over three, the
 * Kahan compensation carried from the second term into the third. */
declare function hypot3(a: number, b: number, c: number): number;
/** `Math.hypot(a, b, c, d)`, bit for bit — the compensation carried on
 * through the fourth term. A quaternion's length. */
declare function hypot4(a: number, b: number, c: number, d: number): number;
declare function dist2(ax: number, az: number, bx: number, bz: number): number;
/** Pack a pair of spatial-hash cell indices into one integer key.
 *
 * Every spatial index in the engine — the corridor grid, the branch index,
 * the guard field, the route's point field — is probed tens of thousands of
 * times per stage, most of them from inside a ring scan that touches dozens
 * of cells per query. A `${ix},${iz}` template key allocates a string on
 * every one of those probes and then hashes it; an integer key allocates
 * nothing and compares in one instruction.
 *
 * Injective while |iz| < 4096, which at the engine's cell sizes (10–120 m)
 * is a world tens of kilometres across — orders of magnitude past anything
 * the generator builds. */
declare function cellKey(ix: number, iz: number): number;
/** The (dx, dz) offsets of a `(2r+1)²` block of cells, flattened in pairs
 * and ordered by RING — the middle cell, then the eight around it, and so
 * on out to `radius`.
 *
 * The order is the point. A ring scan that walks its block row by row meets
 * the far corners before the middle, so it carries a useless bound through
 * most of the block; walking outward from the query's own cell means the
 * nearest road is measured first, and every rejection past that ring has a
 * tight bound to reject against. Built once per index, because it is the
 * same handful of offsets on every query. */
declare function blockOffsets(radius: number): number[];

export {
  TAU,
  angleDiff,
  approach,
  blockOffsets,
  cellKey,
  clamp,
  decay,
  dist2,
  hypot,
  hypot3,
  hypot4,
  lerp,
  smoothstep,
};
