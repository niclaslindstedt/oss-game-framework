// src/hud/count.ts
var COUNT_SECONDS = 0.42;
function countAt(from, to, at, over = COUNT_SECONDS) {
  if (over <= 0 || at >= over) return to;
  if (at <= 0) return from;
  return from + (to - from) * (1 - (1 - at / over) ** 3);
}

export { COUNT_SECONDS, countAt };
