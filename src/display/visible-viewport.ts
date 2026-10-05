// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// THE SHELL HELD OVER THE PART OF THE SCREEN THE BROWSER IS SHOWING.
//
// The game is one fixed, non-scrolling shell the size of the viewport, and
// that is a bet: that the viewport the page is laid out in is the screen the
// player is looking at. A software keyboard is where the bet comes off. iOS
// does not re-lay the page for one — it keeps the layout viewport at its full
// height, makes the VISIBLE window short, and slides that window down the
// layout viewport so the field being typed into stays above the keys. Every
// `position: fixed` surface stays behind with the layout viewport, so the
// game ends up somewhere off the bottom of the screen with the app's own
// background colour (`BRAND_COLOR`, the manifest's `background_color`) where
// it used to be. On an iPhone held on its side that is about 245 of 393 px —
// nearly two thirds of the picture — and the keyboard does not have to still
// be up for it to be on screen: a field unmounted while it still had focus
// takes the keyboard away and leaves the offset behind.
//
// So how far that window has been pushed off each edge is measured and
// published as two lengths, and the stylesheet lays the shell out inside what
// is left rather than against the viewport's own edges. The arithmetic is
// `viewport.ts`'s `visibleBox` (DOM-free, and tested); what is here is the
// listening, the writing, the one repair and the settling.
//
// THE SETTLING: an installed iOS app brought back from the background, or
// turned while it was away, is measured at the moment it is shown — before
// the browser has finished laying it out again, and the reading that comes
// back can be the other orientation's. The relayout that follows does not
// reliably send a notice of its own, so a resume or a rotation is measured
// again over the next two frames and twice more after that.
//
// THE REPAIR: an offset window with nothing focused is a window the browser
// forgot to put back, and scrolling to the origin is what puts it back.
// Guarded by the focus, because while a field really is being typed into the
// offset is the browser doing its job and fighting it would scroll the keys
// back over the field on every keystroke.

import { sameBox, visibleBox, type VisibleBox } from "./viewport";

/** Whether the focus is somewhere a keyboard is legitimately up for. A
 * `select` is included: it opens a picker on a phone and moves the window
 * exactly as the keys do. */
function typing(active: Element | null): boolean {
  if (!active) return false;
  const tag = active.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return active instanceof HTMLElement && active.isContentEditable;
}

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
export function watchVisibleViewport(): () => void {
  const visual = window.visualViewport;
  const root = document.documentElement;
  let worn: VisibleBox | null = null;

  const measure = (): void => {
    const keys = typing(document.activeElement);
    // Measured against the LAYOUT viewport (`window.innerHeight`), which is
    // the box the visible window is offset WITHIN and the box every
    // `position: fixed` surface is laid out against. Both readings come from
    // the same place, so a browser that means something slightly different by
    // it still reports no displacement when there is none.
    const next = visibleBox(visual, window.innerHeight, keys);
    if (!sameBox(worn, next)) {
      worn = next;
      root.style.setProperty("--shell-top", `${next.top}px`);
      root.style.setProperty("--shell-bottom", `${next.bottom}px`);
    }
    // Nothing is being typed into, so an offset window is a window left
    // behind by a keyboard that has already gone. Both offsets are put back:
    // whether the displacement lands on the document's scroll or on the
    // visual viewport's own is the browser's business, and one `scrollTo`
    // answers for both. It settles rather than loops — the scroll it asks
    // for reports back with the offsets at zero, which asks for nothing.
    if (keys) return;
    if (next.top !== 0 || window.scrollY !== 0 || window.scrollX !== 0) {
      window.scrollTo(0, 0);
    }
  };

  // The later looks a resume or a rotation is given (THE SETTLING, above):
  // the next two frames, then a moment and a second on. A fresh notice
  // starts the round again rather than stacking a second one beside it.
  let frame = 0;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const unsettle = (): void => {
    cancelAnimationFrame(frame);
    for (const timer of timers) clearTimeout(timer);
    timers.length = 0;
  };
  const settle = (): void => {
    measure();
    unsettle();
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(measure);
    });
    timers.push(setTimeout(measure, 250), setTimeout(measure, 1000));
  };

  measure();
  // Every notice the browser gives that the window may have moved or
  // changed size. `focusout` is the one that matters for the repair — it is
  // the moment a keyboard starts to go — and `pageshow`, the visibility
  // change and a rotation cover an app coming back from the background,
  // which is the other way a stale reading is found waiting, so those three
  // are settled rather than measured once.
  visual?.addEventListener("resize", measure);
  visual?.addEventListener("scroll", measure);
  window.addEventListener("resize", measure);
  window.addEventListener("orientationchange", settle);
  window.addEventListener("pageshow", settle);
  window.addEventListener("focusout", measure);
  document.addEventListener("visibilitychange", settle);

  return () => {
    unsettle();
    visual?.removeEventListener("resize", measure);
    visual?.removeEventListener("scroll", measure);
    window.removeEventListener("resize", measure);
    window.removeEventListener("orientationchange", settle);
    window.removeEventListener("pageshow", settle);
    window.removeEventListener("focusout", measure);
    document.removeEventListener("visibilitychange", settle);
  };
}
