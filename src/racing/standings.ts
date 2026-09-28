// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// WHERE A RIDER STANDS IN THE FIELD — the one ordering a HUD's position, a
// results sheet and a simulator all read, so none of them can disagree.
//
// A rider is reduced to a `Standing`: home or not, the clock if home, and how
// far round the course they have got as one number. The rule is then:
//
// - HOME FIRST, BY THE CLOCK. Two riders home are ordered by their time; a
//   rider home stands ahead of one still out.
// - THEN FURTHER ROUND. Two riders still out are ordered by `progress` —
//   checkpoints passed plus the share of the leg to the next one
//   (`legProgress`). A game whose run is not a course (a tricks run under a
//   buzzer) passes its SCORE as `progress` and nobody as home.
//
// Pure, and it reads nothing of any one game's state: the game reduces each
// rider and hands the list in.

import { hypot } from "../core/math";

export type Standing = {
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
export function legProgress(
  done: number,
  from: { readonly x: number; readonly z: number },
  next: { readonly x: number; readonly z: number },
  x: number,
  z: number,
): number {
  const leg = hypot(next.x - from.x, next.z - from.z) || 1;
  const left = hypot(next.x - x, next.z - z);
  return done + Math.min(0.999, 1 - left / leg);
}

/** Whether `a` stands AHEAD of `b`: home first, by the clock; then further
 * round. Neither ahead of the other is a dead heat. */
export function isAhead(a: Standing, b: Standing): boolean {
  if (a.finished || b.finished) {
    if (a.finished && b.finished) return a.time < b.time;
    return a.finished;
  }
  return a.progress > b.progress;
}

/** THE WHOLE FIELD IN ORDER, best first. The sort is stable, so a dead heat
 * keeps the order the entries were handed in. */
export function fieldOrder<T>(entries: readonly T[], standingOf: (entry: T) => Standing): T[] {
  const rows = entries.map((entry) => ({ entry, standing: standingOf(entry) }));
  rows.sort((a, b) =>
    isAhead(a.standing, b.standing) ? -1 : isAhead(b.standing, a.standing) ? 1 : 0,
  );
  return rows.map((r) => r.entry);
}

/** ONE RIDER'S PLACE, 1-based: one more than the others ahead of them. 1 in
 * a field of one. */
export function placeAmong(rider: Standing, others: readonly Standing[]): number {
  let place = 1;
  for (const other of others) if (isAhead(other, rider)) place += 1;
  return place;
}
