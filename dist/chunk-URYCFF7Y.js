import { hypot } from "./chunk-JRRRZ4XY.js";

// src/racing/standings.ts
function legProgress(done, from, next, x, z) {
  const leg = hypot(next.x - from.x, next.z - from.z) || 1;
  const left = hypot(next.x - x, next.z - z);
  return done + Math.min(0.999, 1 - left / leg);
}
function isAhead(a, b) {
  if (a.finished || b.finished) {
    if (a.finished && b.finished) return a.time < b.time;
    return a.finished;
  }
  return a.progress > b.progress;
}
function fieldOrder(entries, standingOf) {
  const rows = entries.map((entry) => ({ entry, standing: standingOf(entry) }));
  rows.sort((a, b) =>
    isAhead(a.standing, b.standing) ? -1 : isAhead(b.standing, a.standing) ? 1 : 0,
  );
  return rows.map((r) => r.entry);
}
function placeAmong(rider, others) {
  let place = 1;
  for (const other of others) if (isAhead(other, rider)) place += 1;
  return place;
}

export { fieldOrder, isAhead, legProgress, placeAmong };
