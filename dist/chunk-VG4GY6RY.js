import { visibleBox, sameBox } from "./chunk-44T5PL7B.js";

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
    const next = visibleBox(visual, window.innerHeight);
    if (!sameBox(worn, next)) {
      worn = next;
      root.style.setProperty("--shell-top", `${next.top}px`);
      root.style.setProperty("--shell-bottom", `${next.bottom}px`);
    }
    if (typing(document.activeElement)) return;
    if (next.top !== 0 || window.scrollY !== 0 || window.scrollX !== 0) {
      window.scrollTo(0, 0);
    }
  };
  measure();
  visual?.addEventListener("resize", measure);
  visual?.addEventListener("scroll", measure);
  window.addEventListener("resize", measure);
  window.addEventListener("orientationchange", measure);
  window.addEventListener("pageshow", measure);
  window.addEventListener("focusout", measure);
  document.addEventListener("visibilitychange", measure);
  return () => {
    visual?.removeEventListener("resize", measure);
    visual?.removeEventListener("scroll", measure);
    window.removeEventListener("resize", measure);
    window.removeEventListener("orientationchange", measure);
    window.removeEventListener("pageshow", measure);
    window.removeEventListener("focusout", measure);
    document.removeEventListener("visibilitychange", measure);
  };
}

export { watchVisibleViewport };
