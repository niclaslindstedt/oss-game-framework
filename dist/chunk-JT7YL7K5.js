// src/input/menu-cursor.ts
var CROSS_COST = 2.5;
var centre = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
function gap(aMin, aSize, bMin, bSize) {
  if (aMin + aSize <= bMin) return bMin - (aMin + aSize);
  if (bMin + bSize <= aMin) return aMin - (bMin + bSize);
  return 0;
}
function pickNeighbour(rects, from, dir) {
  const here = rects[from];
  if (!here) return rects.length > 0 ? 0 : null;
  const vertical = dir === "up" || dir === "down";
  const sign = dir === "down" || dir === "right" ? 1 : -1;
  const along = (r) => (vertical ? centre(r).y : centre(r).x);
  const across = (a, b) => (vertical ? gap(a.x, a.w, b.x, b.w) : gap(a.y, a.h, b.y, b.h));
  let inline = null;
  let inlineCost = Infinity;
  let aside = null;
  let asideCost = Infinity;
  let wrap = null;
  let wrapCost = Infinity;
  for (const [index, rect] of rects.entries()) {
    if (index === from) continue;
    const step = (along(rect) - along(here)) * sign;
    const miss = across(here, rect);
    const cost = step + miss * CROSS_COST;
    if (step <= 0.5) {
      if (cost < wrapCost) {
        wrapCost = cost;
        wrap = index;
      }
      continue;
    }
    if (miss === 0) {
      if (cost < inlineCost) {
        inlineCost = cost;
        inline = index;
      }
    } else if (cost < asideCost) {
      asideCost = cost;
      aside = index;
    }
  }
  return inline ?? aside ?? wrap;
}

export { pickNeighbour };
