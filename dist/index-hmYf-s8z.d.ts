import { GuardWindow, ThumbGuard, createThumbGuard } from "./input/thumb-guard.js";
import {
  HudPress,
  PressBox,
  PressEvent,
  PressPoint,
  PressTarget,
  createHudPress,
  pressHandlers,
} from "./input/hud-press.js";
import { NavDir, NavRect, pickNeighbour } from "./input/menu-cursor.js";

declare const index_GuardWindow: typeof GuardWindow;
declare const index_HudPress: typeof HudPress;
declare const index_NavDir: typeof NavDir;
declare const index_NavRect: typeof NavRect;
declare const index_PressBox: typeof PressBox;
declare const index_PressEvent: typeof PressEvent;
declare const index_PressPoint: typeof PressPoint;
declare const index_PressTarget: typeof PressTarget;
declare const index_ThumbGuard: typeof ThumbGuard;
declare const index_createHudPress: typeof createHudPress;
declare const index_createThumbGuard: typeof createThumbGuard;
declare const index_pickNeighbour: typeof pickNeighbour;
declare const index_pressHandlers: typeof pressHandlers;
declare namespace index {
  export {
    index_GuardWindow as GuardWindow,
    index_HudPress as HudPress,
    index_NavDir as NavDir,
    index_NavRect as NavRect,
    index_PressBox as PressBox,
    index_PressEvent as PressEvent,
    index_PressPoint as PressPoint,
    index_PressTarget as PressTarget,
    index_ThumbGuard as ThumbGuard,
    index_createHudPress as createHudPress,
    index_createThumbGuard as createThumbGuard,
    index_pickNeighbour as pickNeighbour,
    index_pressHandlers as pressHandlers,
  };
}

export { index as i };
