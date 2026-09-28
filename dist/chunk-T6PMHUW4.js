// src/core/clock.ts
var wallClock = { now: () => Date.now() };
var preciseClock = { now: () => performance.now() };
function fixedClock(at = 0) {
  return { now: () => at };
}

export { fixedClock, preciseClock, wallClock };
