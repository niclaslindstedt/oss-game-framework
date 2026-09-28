/** How long a figure takes to reach its new value, seconds. Long enough to
 * be a count rather than a flicker, short enough that a player rowing
 * through the catalog is never reading a number on its way somewhere. */
declare const COUNT_SECONDS = 0.42;
/** Where a counter stands `at` seconds into a run from `from` to `to`.
 *
 * Cubic ease-out: the figure leaves at once and settles, so the movement is
 * unmistakable at the press and the last digits — the ones actually worth
 * reading — are the slowest. Past the run's length it is simply the target,
 * which is what makes this safe to call on any clock without the caller
 * having to stop asking. */
declare function countAt(from: number, to: number, at: number, over?: number): number;

export { COUNT_SECONDS, countAt };
