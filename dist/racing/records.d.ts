/** Which way a book's figures improve. */
type Better = "lower" | "higher";
/** The generic half of a row: the figure, when (a unix ms stamp), and the
 * clock at each crossing in order. A game's row extends it. */
type RecordRow = {
  value: number;
  at: number;
  splits?: number[];
};
type Book<R extends RecordRow> = Readonly<Record<string, R>>;
/** Whether `value` is a figure a run could have set. */
declare function isFigure(value: unknown): value is number;
/** Whether `value` beats the row standing — outright, never on a tie — or
 * stands where there is none. A figure that is not a figure beats nothing. */
declare function beats(
  value: number,
  standing: {
    value: number;
  } | null,
  better?: Better,
): boolean;
/** The row standing under `id`, or null. */
declare function bestIn<R extends RecordRow>(book: Book<R>, id: string): R | null;
/** The book with this run in it, if it earned a row — and whether it did.
 * Pure: the book handed in is never written, and the row filed is a copy. */
declare function noteRecord<R extends RecordRow>(
  book: Book<R>,
  id: string,
  run: R,
  better?: Better,
): {
  book: Book<R>;
  record: boolean;
};
/** THE GAP AT A CROSSING: the clock at crossing `index` of this run less the
 * record's at the same crossing, s — negative is ahead. Null where the
 * record has no such crossing or either clock is not a number. */
declare function splitGap(
  record: {
    splits?: readonly number[];
  } | null,
  index: number,
  time: number,
): number | null;
/** A stored blob as a book, one row at a time. The generic fields are
 * checked here — a figure that is not positive and finite drops the row, a
 * missing stamp reads as 0, a splits list keeps only its finite entries —
 * and `extra` reads the game's own fields off the raw row, returning null to
 * drop a row it cannot vouch for (a vehicle the catalog no longer has). */
declare function readBook<R extends RecordRow>(
  parsed: unknown,
  extra: (raw: Readonly<Record<string, unknown>>, row: RecordRow) => R | null,
  options?: {
    splits?: boolean;
  },
): Record<string, R>;

export {
  type Better,
  type Book,
  type RecordRow,
  beats,
  bestIn,
  isFigure,
  noteRecord,
  readBook,
  splitGap,
};
