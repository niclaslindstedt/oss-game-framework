/** The one MIME type everything here moves. */
declare const MIME_PNG = "image/png";
/** A PNG blob as a named File — what `navigator.share` wants, and what
 * decides the name the receiving app shows. */
declare function pngFile(blob: Blob, name: string): File;
/** Whether the platform's share sheet will take THIS file. */
declare function canShareImage(file: File): boolean;
/** Whether a PNG can go on the clipboard. */
declare function canCopyImage(): boolean;
/** Raise the platform's share sheet. True when the picture went somewhere,
 * false when it did not — INCLUDING a player dismissing the sheet, which
 * arrives as an AbortError and is an ordinary outcome rather than a failure
 * worth reporting. */
declare function shareImage(
  file: File,
  data?: {
    title?: string;
    text?: string;
  },
): Promise<boolean>;
/** Put the PNG on the clipboard. */
declare function copyImage(blob: Blob): Promise<boolean>;
/** What a copy started before its picture existed hands back: `done` says
 * whether the PNG reached the clipboard, and the caller settles the write by
 * calling `ready` with the blob — or with null when there was no picture to
 * copy, which fails the write rather than leaving it open for ever. */
type PendingCopy = {
  done: Promise<boolean>;
  ready: (blob: Blob | null) => void;
};
/**
 * Start a clipboard write for a picture that has not been drawn yet. MUST be
 * called synchronously from the press: the transient user activation both
 * Chromium and WebKit want is spent by the first `await`, and a write started
 * afterwards is refused as a document without user activation.
 *
 * TWO WAYS IN, the second a fallback. First the promise form — a
 * `ClipboardItem` whose value is a PROMISE of the blob, which is what Safari
 * insists on. Where that is not taken (the constructor throws on a promise
 * value, or the write refuses it) the finished blob is written once it
 * arrives, which works in Chromium, whose activation outlives an encode. The
 * worst case is a copy that did not happen on one browser, never a throw.
 *
 * Returns null where this browser has no PNG writer, so a caller can say what
 * it actually did rather than promising a copy that never happened.
 */
declare function copyWhenReady(): PendingCopy | null;
/** How long a receipt waits for the clipboard by default, ms. */
declare const COPY_WAIT_MS = 1200;
/**
 * Whether a pending copy landed, ANSWERING EITHER WAY within `ms`.
 *
 * `clipboard.write` does not always answer: an unfocused window, a
 * permission the browser sits on, an automated pass with no clipboard at all
 * — the promise simply never settles, and a shutter whose only receipt hangs
 * off it tells the player nothing about a picture that is already kept. A
 * late yes is reported as a no; the picture is on the clipboard regardless.
 */
declare function copiedWithin(copy: PendingCopy, ms?: number): Promise<boolean>;
/** Save the PNG to the player's downloads. The path that always works.
 *
 * The anchor is put in the document rather than clicked detached: Firefox
 * ignores a click on an element that is not in a document, and the object
 * URL is revoked on a later task because revoking it in this one races the
 * download that has only just been started. */
declare function saveImage(blob: Blob, name: string): boolean;

export {
  COPY_WAIT_MS,
  MIME_PNG,
  type PendingCopy,
  canCopyImage,
  canShareImage,
  copiedWithin,
  copyImage,
  copyWhenReady,
  pngFile,
  saveImage,
  shareImage,
};
