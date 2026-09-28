import { COUNT_SECONDS, countAt } from "./hud/count.js";
import { formatDay, formatScore, formatTime, legible, ordinal } from "./hud/format.js";

declare const index_COUNT_SECONDS: typeof COUNT_SECONDS;
declare const index_countAt: typeof countAt;
declare const index_formatDay: typeof formatDay;
declare const index_formatScore: typeof formatScore;
declare const index_formatTime: typeof formatTime;
declare const index_legible: typeof legible;
declare const index_ordinal: typeof ordinal;
declare namespace index {
  export {
    index_COUNT_SECONDS as COUNT_SECONDS,
    index_countAt as countAt,
    index_formatDay as formatDay,
    index_formatScore as formatScore,
    index_formatTime as formatTime,
    index_legible as legible,
    index_ordinal as ordinal,
  };
}

export { index as i };
