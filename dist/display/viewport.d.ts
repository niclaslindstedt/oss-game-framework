/** The device pixel ratio ceiling: a 3× phone drawing nine pixels for every
 * one it can show is a phone at 20 fps. */
declare const MAX_DPR = 2;
/** The floor under whatever the RESOLUTION row asks for. A canvas an eighth
 * of a CSS pixel across is not a cheap picture, it is a broken one — and a
 * ratio rounding to zero is a zero-width drawing buffer, which draws nothing
 * at all until the app is restarted. */
declare const MIN_DPR = 0.25;
/** A canvas's two sizes: the CSS box in whole px, and how many device pixels
 * are drawn per CSS px inside it. */
type Viewport = {
  w: number;
  h: number;
  dpr: number;
};
/**
 * The viewport a measured CSS box wants.
 *
 * Both sides are floored to one pixel because a box can be measured while
 * the browser is between layouts — mid-rotation, or before the canvas is in
 * the document — and reads 0 there. A zero-height buffer is an aspect ratio
 * of `Infinity` or `NaN`, which reaches the projection matrix and draws
 * nothing at all until the app is restarted.
 *
 * `scale` is the RESOLUTION row's share (`settings-video.ts`), applied AFTER
 * the cap rather than before it: the cap is the page's own policy about a
 * dense screen and the row is the rider's about their machine, so a rider who
 * asks for half gets half of what the page was going to draw anyway, on every
 * device. A share that is not a positive number is no opinion, which is 1.
 */
declare function viewportOf(
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  scale?: number,
): Viewport;
/** Whether a fresh measurement asks for anything the buffer is not already.
 * Resizing is driven by every notice the browser gives — a rotation, a zoom,
 * a window drag, a keyboard opening — and most of them change nothing. */
declare function sameViewport(a: Viewport | null, b: Viewport): boolean;
/** WHERE THE BROWSER IS ACTUALLY SHOWING THE PAGE — the visible window's
 * place inside the layout viewport, in CSS px. `top` and `bottom` are the
 * strips of layout viewport above and below it, which is what a surface
 * anchored to the viewport's own top or bottom edge has to be pushed by. */
type VisibleBox = {
  top: number;
  height: number;
  bottom: number;
};
/** The visual viewport as this module needs it — the fields of
 * `window.visualViewport` that say where the visible window is. */
type VisualWindow = {
  height: number;
  offsetTop: number;
  scale: number;
};
/**
 * The visible window inside a layout viewport `layoutHeight` CSS px tall.
 *
 * The two viewports are normally the same box and this returns the whole
 * thing. They come apart when the browser shows only part of the page while
 * leaving the page laid out at full height — a software keyboard is the one
 * that happens here, and it takes about 245 of an iPhone's 393 landscape px.
 * The page is not re-laid for it: the visible window is made short and slid
 * DOWN the layout viewport so the field being typed into stays in view, and
 * a `position: fixed` shell stays behind with the layout viewport, mostly
 * off the screen. Anything anchored to a viewport edge therefore has to be
 * anchored to THIS box instead, and the caller publishes it as the
 * `--shell-*` custom properties the stylesheet reads.
 *
 * A PINCH-ZOOMED visual viewport is a lens rather than a smaller screen —
 * its height is the layout viewport's divided by the scale — so anything but
 * 1 is no opinion and the whole layout viewport comes back. The page locks
 * zoom out in its viewport meta, so this is the case that should not arise
 * rather than the case that is handled.
 *
 * Everything is rounded to whole px and clamped into the layout viewport:
 * the numbers are read back as lengths on the shell, and a fractional or
 * out-of-range one is a blurred edge or a shell with no height at all.
 */
declare function visibleBox(visual: VisualWindow | null, layoutHeight: number): VisibleBox;
/** Whether a fresh reading asks for anything the shell is not already
 * wearing. The visual viewport reports on every scroll of it, and almost
 * every one of those leaves the box where it was. */
declare function sameBox(a: VisibleBox | null, b: VisibleBox): boolean;

export {
  MAX_DPR,
  MIN_DPR,
  type Viewport,
  type VisibleBox,
  type VisualWindow,
  sameBox,
  sameViewport,
  viewportOf,
  visibleBox,
};
