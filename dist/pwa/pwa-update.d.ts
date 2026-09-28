type PwaUpdateConfig = {
  /** The bundler `base` — the scope the worker is registered under. */
  base: string;
  /** The precache cache id, from `cacheIdForBase`. Kept in the config
   * because the worker's cache is named after it and a future progress
   * readout would need it; the watch itself never opens a cache. */
  cacheId: string;
  /** False leaves the whole thing dormant: no registration, no polling.
   * Dev passes this, and so does the desktop shell, where the bundle on
   * disk IS the build and a worker could only ever prompt about itself. */
  enabled?: boolean;
};
type PwaUpdate = {
  /** A new worker has installed and is waiting for the page to let go. */
  needRefresh: boolean;
  /** The waiting build's version, once `version.json` has been read. Null
   * until then, so a button must be able to show without it. */
  incomingVersion: string | null;
  /** Hand over to the waiting worker. It takes control, which fires
   * `controlling` and reloads the page onto the new build. */
  reload: () => void;
};
/** What the watch reports: whether a build is waiting, and which one. */
type PwaUpdateSnapshot = {
  needRefresh: boolean;
  incomingVersion: string | null;
};
/** The update watch as an external store. */
type PwaUpdateWatch = {
  /** Listen for changes. The FIRST subscription starts the watch. */
  subscribe: (listener: () => void) => () => void;
  /** The current state — the same object until it changes. */
  getSnapshot: () => PwaUpdateSnapshot;
  /** Hand over to the waiting worker. It takes control, which fires
   * `controllerchange` and reloads the page onto the new build. */
  reload: () => void;
};
/**
 * The update watch. The first call fixes the configuration for the page —
 * later callers get the same watch whatever they pass.
 */
declare function pwaUpdateWatch(updateConfig: PwaUpdateConfig): PwaUpdateWatch;

export {
  type PwaUpdate,
  type PwaUpdateConfig,
  type PwaUpdateSnapshot,
  type PwaUpdateWatch,
  pwaUpdateWatch,
};
