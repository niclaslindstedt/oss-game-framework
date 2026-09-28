import { ShotMeta, Shot } from "./shot-roll.js";

type ShotStoreOptions = {
  /** The database name — namespaced per app. */
  dbName: string;
  /** How many pictures the roll keeps before the oldest falls off. */
  limit: number;
};
type Listener = (shots: readonly ShotMeta[]) => void;
/** Name the store. Must run before anything reads the roll: an unnamed
 * store is a DIFFERENT database, so a gallery that skipped this would open
 * on an empty one. */
declare function configureShotStore(next: ShotStoreOptions): void;
/** Read the roll in, once per session. An unreadable store simply resolves
 * to whatever is already in memory. */
declare function loadShots(): Promise<readonly ShotMeta[]>;
/** Whether the roll has been read off disk yet. */
declare function shotsRead(): boolean;
/** Every picture's metadata, newest first. Synchronous — `loadShots` first. */
declare function shotList(): readonly ShotMeta[];
/** One picture, pixels included, or null if it has fallen off the roll. */
declare function shot(id: string): Shot | null;
/** Watch the roll. Fires immediately with what is already held; returns the
 * unsubscribe. */
declare function subscribeShots(listener: Listener): () => void;
/** File a new picture. Returns its metadata IMMEDIATELY — the roll is
 * updated in memory first, so the receipt can show it on the very next
 * frame whether or not the write ever lands. */
declare function putShot(entry: Omit<Shot, "id">): ShotMeta;
/** Drop one picture. */
declare function deleteShot(id: string): Promise<void>;
/** Drop the whole roll. */
declare function clearShots(): Promise<void>;

export {
  Shot,
  ShotMeta,
  type ShotStoreOptions,
  clearShots,
  configureShotStore,
  deleteShot,
  loadShots,
  putShot,
  shot,
  shotList,
  shotsRead,
  subscribeShots,
};
