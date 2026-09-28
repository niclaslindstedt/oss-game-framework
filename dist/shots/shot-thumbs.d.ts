import { Shot } from "./shot-roll.js";

/** The tile's own pixels: the strip's widest tile is 5rem — eighty CSS
 * pixels — at two device pixels each, which is as sharp as a thumbnail of
 * this size can be told from a sharper one. */
declare const THUMB_BOX: {
  readonly width: 160;
  readonly height: 90;
};
/**
 * The thumbnail for one picture, made if it has not been made yet. Resolves
 * to an object URL this module owns — a caller must NEVER revoke it, or the
 * next tile to show the same picture gets a broken image.
 */
declare function thumbUrl(entry: Shot): Promise<string | null>;
/** Let go of every thumbnail whose picture has left the roll — a delete, or
 * the cap pushing the oldest off. What is still on the roll is KEPT: the
 * pictures do not change, and a gallery opened twice should pay once. */
declare function releaseThumbs(keep: ReadonlySet<string>): void;

export { THUMB_BOX, releaseThumbs, thumbUrl };
