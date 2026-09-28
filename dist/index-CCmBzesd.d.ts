import {
  MAX_DPR,
  MIN_DPR,
  Viewport,
  VisibleBox,
  VisualWindow,
  sameBox,
  sameViewport,
  viewportOf,
  visibleBox,
} from "./display/viewport.js";
import { watchVisibleViewport } from "./display/visible-viewport.js";

declare const index_MAX_DPR: typeof MAX_DPR;
declare const index_MIN_DPR: typeof MIN_DPR;
declare const index_Viewport: typeof Viewport;
declare const index_VisibleBox: typeof VisibleBox;
declare const index_VisualWindow: typeof VisualWindow;
declare const index_sameBox: typeof sameBox;
declare const index_sameViewport: typeof sameViewport;
declare const index_viewportOf: typeof viewportOf;
declare const index_visibleBox: typeof visibleBox;
declare const index_watchVisibleViewport: typeof watchVisibleViewport;
declare namespace index {
  export {
    index_MAX_DPR as MAX_DPR,
    index_MIN_DPR as MIN_DPR,
    index_Viewport as Viewport,
    index_VisibleBox as VisibleBox,
    index_VisualWindow as VisualWindow,
    index_sameBox as sameBox,
    index_sameViewport as sameViewport,
    index_viewportOf as viewportOf,
    index_visibleBox as visibleBox,
    index_watchVisibleViewport as watchVisibleViewport,
  };
}

export { index as i };
