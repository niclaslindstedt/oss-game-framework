import { visibleBox, sameBox } from "./chunk-7VTI5ZYZ.js";

// src/display/visible-viewport.ts
function typing(active) {
  if (!active) return false;
  const tag = active.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return active instanceof HTMLElement && active.isContentEditable;
}
function watchVisibleViewport() {
  const visual = window.visualViewport;
  const root = document.documentElement;
  let worn = null;
  const measure = () => {
    const keys = typing(document.activeElement);
    const next = visibleBox(visual, window.innerHeight, keys);
    if (!sameBox(worn, next)) {
      worn = next;
      root.style.setProperty("--shell-top", `${next.top}px`);
      root.style.setProperty("--shell-bottom", `${next.bottom}px`);
    }
    if (keys) return;
    if (next.top !== 0 || window.scrollY !== 0 || window.scrollX !== 0) {
      window.scrollTo(0, 0);
    }
  };
  let frame = 0;
  const timers = [];
  const unsettle = () => {
    cancelAnimationFrame(frame);
    for (const timer of timers) clearTimeout(timer);
    timers.length = 0;
  };
  const settle = () => {
    measure();
    unsettle();
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(measure);
    });
    timers.push(setTimeout(measure, 250), setTimeout(measure, 1e3));
  };
  measure();
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

export { watchVisibleViewport };
