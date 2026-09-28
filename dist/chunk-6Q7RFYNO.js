// src/racing/records.ts
function isFigure(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
function beats(value, standing, better = "lower") {
  if (!isFigure(value)) return false;
  if (standing === null) return true;
  return better === "higher" ? value > standing.value : value < standing.value;
}
function bestIn(book, id) {
  return book[id] ?? null;
}
function noteRecord(book, id, run, better = "lower") {
  if (!beats(run.value, bestIn(book, id), better)) return { book, record: false };
  const row = run.splits ? { ...run, splits: [...run.splits] } : { ...run };
  return { book: { ...book, [id]: row }, record: true };
}
function splitGap(record, index, time) {
  const splits = record?.splits;
  if (!splits || index < 0 || index >= splits.length) return null;
  const then = splits[index];
  return Number.isFinite(then) && Number.isFinite(time) ? time - then : null;
}
function readBook(parsed, extra, options = {}) {
  const book = {};
  if (!parsed || typeof parsed !== "object") return book;
  for (const [id, raw] of Object.entries(parsed)) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw;
    if (!isFigure(r.value)) continue;
    const row = {
      value: r.value,
      at: typeof r.at === "number" && Number.isFinite(r.at) ? r.at : 0,
    };
    if (options.splits) {
      row.splits = Array.isArray(r.splits)
        ? r.splits.filter((s) => typeof s === "number" && Number.isFinite(s))
        : [];
    }
    const full = extra(r, row);
    if (full !== null) book[id] = full;
  }
  return book;
}

export { beats, bestIn, isFigure, noteRecord, readBook, splitGap };
