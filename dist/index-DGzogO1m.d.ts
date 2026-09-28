import {
  PwaUpdate,
  PwaUpdateConfig,
  PwaUpdateSnapshot,
  PwaUpdateWatch,
  pwaUpdateWatch,
} from "./pwa/pwa-update.js";

declare const index_PwaUpdate: typeof PwaUpdate;
declare const index_PwaUpdateConfig: typeof PwaUpdateConfig;
declare const index_PwaUpdateSnapshot: typeof PwaUpdateSnapshot;
declare const index_PwaUpdateWatch: typeof PwaUpdateWatch;
declare const index_pwaUpdateWatch: typeof pwaUpdateWatch;
declare namespace index {
  export {
    index_PwaUpdate as PwaUpdate,
    index_PwaUpdateConfig as PwaUpdateConfig,
    index_PwaUpdateSnapshot as PwaUpdateSnapshot,
    index_PwaUpdateWatch as PwaUpdateWatch,
    index_pwaUpdateWatch as pwaUpdateWatch,
  };
}

export { index as i };
