type Standing = {
  /** Home: the flag taken. */
  finished: boolean;
  /** The clock at the flag, s — read only when `finished`. */
  time: number;
  /** How far round, higher is further — see `legProgress`. */
  progress: number;
};
/** HOW FAR ROUND A RIDER IS: `done` checkpoints reached, plus the share of
 * the leg from `from` to `next` already covered at `(x, z)`.
 *
 * The share is one less the distance still to the checkpoint over the leg's
 * own length, and it is NOT floored at zero: a grid stands behind the start
 * line, and a field read as all level there would put the back row first.
 * It is capped short of the next whole checkpoint, so a rider a metre from a
 * gate is still behind one who has crossed it. */
declare function legProgress(
  done: number,
  from: {
    readonly x: number;
    readonly z: number;
  },
  next: {
    readonly x: number;
    readonly z: number;
  },
  x: number,
  z: number,
): number;
/** Whether `a` stands AHEAD of `b`: home first, by the clock; then further
 * round. Neither ahead of the other is a dead heat. */
declare function isAhead(a: Standing, b: Standing): boolean;
/** THE WHOLE FIELD IN ORDER, best first. The sort is stable, so a dead heat
 * keeps the order the entries were handed in. */
declare function fieldOrder<T>(entries: readonly T[], standingOf: (entry: T) => Standing): T[];
/** ONE RIDER'S PLACE, 1-based: one more than the others ahead of them. 1 in
 * a field of one. */
declare function placeAmong(rider: Standing, others: readonly Standing[]): number;

export { type Standing, fieldOrder, isAhead, legProgress, placeAmong };
