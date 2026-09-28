// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// THE RECORD BOOK — the best figure a run has set, one row per whatever a
// game says names a row (a map, a vehicle, a mode, a number of laps).
//
// What is generic is the POLICY every book here keeps and none may drift on:
//
// - A row is beaten OUTRIGHT, never on a tie — a tie is not a record.
// - A figure that is not a figure (not finite, not positive) beats nothing.
// - Which way is better is the book's, never assumed: seconds are better
//   lower, points higher.
// - A stored book is read ONE ROW AT A TIME and every row is checked; a row
//   no run could have set is dropped rather than trusted.
// - A row may carry the clock at every crossing of the course (`splits`), so
//   a run can be told how far ahead of the record it is at each checkpoint.
//
// What names a row, which modes keep a book at all and what else a row
// carries (the vehicle it was set on) are the game's. Pure: the storage skin
// is `storage.ts`'s.

/** Which way a book's figures improve. */
export type Better = "lower" | "higher";

/** The generic half of a row: the figure, when (a unix ms stamp), and the
 * clock at each crossing in order. A game's row extends it. */
export type RecordRow = {
  value: number;
  at: number;
  splits?: number[];
};

export type Book<R extends RecordRow> = Readonly<Record<string, R>>;

/** Whether `value` is a figure a run could have set. */
export function isFigure(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/** Whether `value` beats the row standing — outright, never on a tie — or
 * stands where there is none. A figure that is not a figure beats nothing. */
export function beats(
  value: number,
  standing: { value: number } | null,
  better: Better = "lower",
): boolean {
  if (!isFigure(value)) return false;
  if (standing === null) return true;
  return better === "higher" ? value > standing.value : value < standing.value;
}

/** The row standing under `id`, or null. */
export function bestIn<R extends RecordRow>(book: Book<R>, id: string): R | null {
  return book[id] ?? null;
}

/** The book with this run in it, if it earned a row — and whether it did.
 * Pure: the book handed in is never written, and the row filed is a copy. */
export function noteRecord<R extends RecordRow>(
  book: Book<R>,
  id: string,
  run: R,
  better: Better = "lower",
): { book: Book<R>; record: boolean } {
  if (!beats(run.value, bestIn(book, id), better)) return { book, record: false };
  const row: R = run.splits ? { ...run, splits: [...run.splits] } : { ...run };
  return { book: { ...book, [id]: row }, record: true };
}

/** THE GAP AT A CROSSING: the clock at crossing `index` of this run less the
 * record's at the same crossing, s — negative is ahead. Null where the
 * record has no such crossing or either clock is not a number. */
export function splitGap(
  record: { splits?: readonly number[] } | null,
  index: number,
  time: number,
): number | null {
  const splits = record?.splits;
  if (!splits || index < 0 || index >= splits.length) return null;
  const then = splits[index];
  return Number.isFinite(then) && Number.isFinite(time) ? time - then : null;
}

/** A stored blob as a book, one row at a time. The generic fields are
 * checked here — a figure that is not positive and finite drops the row, a
 * missing stamp reads as 0, a splits list keeps only its finite entries —
 * and `extra` reads the game's own fields off the raw row, returning null to
 * drop a row it cannot vouch for (a vehicle the catalog no longer has). */
export function readBook<R extends RecordRow>(
  parsed: unknown,
  extra: (raw: Readonly<Record<string, unknown>>, row: RecordRow) => R | null,
  options: { splits?: boolean } = {},
): Record<string, R> {
  const book: Record<string, R> = {};
  if (!parsed || typeof parsed !== "object") return book;
  for (const [id, raw] of Object.entries(parsed as Record<string, unknown>)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (!isFigure(r.value)) continue;
    const row: RecordRow = {
      value: r.value,
      at: typeof r.at === "number" && Number.isFinite(r.at) ? r.at : 0,
    };
    if (options.splits) {
      row.splits = Array.isArray(r.splits)
        ? r.splits.filter((s): s is number => typeof s === "number" && Number.isFinite(s))
        : [];
    }
    const full = extra(r, row);
    if (full !== null) book[id] = full;
  }
  return book;
}
