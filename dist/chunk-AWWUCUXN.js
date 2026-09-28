// src/shots/shot-roll.ts
function shotId(takenAt, counter) {
  return `${takenAt}-${counter.toString().padStart(6, "0")}`;
}
function withShot(roll, entry, limit) {
  return [entry, ...roll].slice(0, Math.max(1, limit));
}
function withStored(roll, stored, limit) {
  const held = new Set(roll.map((entry) => entry.id));
  return [...roll, ...stored.filter((entry) => !held.has(entry.id)).sort(byNewest)].slice(
    0,
    Math.max(1, limit),
  );
}
function byNewest(a, b) {
  return b.takenAt - a.takenAt;
}
function keysPastCap(stored, limit) {
  const newestFirst = [...stored].sort().reverse();
  return newestFirst.slice(Math.max(1, limit));
}
function shotMeta(shots) {
  return shots.map(({ id, takenAt, width, height, label }) => ({
    id,
    takenAt,
    width,
    height,
    label,
  }));
}
function thumbSize(width, height, boxWidth, boxHeight) {
  if (width <= 0 || height <= 0) return { width: boxWidth, height: boxHeight };
  const scale = Math.min(1, Math.max(boxWidth / width, boxHeight / height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export { keysPastCap, shotId, shotMeta, thumbSize, withShot, withStored };
