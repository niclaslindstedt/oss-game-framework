// src/loop/run-clock.ts
var MAX_FRAME_SECONDS = 0.1;
function createRunClock(hz, maxFrame = MAX_FRAME_SECONDS) {
  const dt = 1 / hz;
  let acc = 0;
  let paused = false;
  let dropped = 0;
  return {
    frame: (elapsed) => {
      if (paused) return 0;
      const taken = Math.min(Math.max(0, elapsed), maxFrame);
      dropped += Math.max(0, elapsed) - taken;
      acc += taken;
      const steps = Math.floor(acc * hz + 1e-9);
      acc -= steps * dt;
      if (acc < 0) acc = 0;
      return steps;
    },
    alpha: () => acc * hz,
    pause: () => {
      paused = true;
    },
    resume: () => {
      paused = false;
      acc = 0;
    },
    paused: () => paused,
    dropped: () => dropped,
  };
}

export { MAX_FRAME_SECONDS, createRunClock };
