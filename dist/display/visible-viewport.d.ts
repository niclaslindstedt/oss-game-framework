/**
 * Keep `--shell-top` and `--shell-bottom` on the document element saying how
 * far the visible window has been pushed off the viewport's two edges, and
 * put a forgotten window back.
 *
 * Returns the way to stop. Called once, before the app renders, so the first
 * layout is already measured rather than corrected a frame later.
 *
 * ONLY THE DISPLACEMENT IS WRITTEN, never a height. How tall the viewport is
 * is the stylesheet's `--shell-height`, and on iOS it has to stay a unit:
 * `100vh` reaches the physical bottom of the screen where the layout viewport
 * this measures against stops short of it. So both properties are 0 whenever
 * the browser is showing the whole page, and the shell is then laid out to
 * the same lengths it would have been with none of this here.
 */
declare function watchVisibleViewport(): () => void;

export { watchVisibleViewport };
