import { MAX_FRAME_SECONDS, RunClock, createRunClock } from "./loop/run-clock.js";

declare const index_MAX_FRAME_SECONDS: typeof MAX_FRAME_SECONDS;
declare const index_RunClock: typeof RunClock;
declare const index_createRunClock: typeof createRunClock;
declare namespace index {
  export {
    index_MAX_FRAME_SECONDS as MAX_FRAME_SECONDS,
    index_RunClock as RunClock,
    index_createRunClock as createRunClock,
  };
}

export { index as i };
