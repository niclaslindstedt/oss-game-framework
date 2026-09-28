/** Milliseconds since the epoch (or any fixed origin — only differences and
 * stamps are ever taken). */
type Clock = {
  now(): number;
};
/** The real clock. The default wherever a clock is taken. */
declare const wallClock: Clock;
/** The same clock at sub-millisecond resolution (`performance.now()`, whose
 * origin is the process's start rather than the epoch — fine, since only
 * differences are taken from it). For timing a batch of calls that each cost
 * microseconds, where whole milliseconds would read as nothing. */
declare const preciseClock: Clock;
/** A clock that never moves: every `now()` is `at`. For tests and for any
 * report that must come out the same twice. */
declare function fixedClock(at?: number): Clock;

export { type Clock, fixedClock, preciseClock, wallClock };
