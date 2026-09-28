// src/display/viewport.ts
var MAX_DPR = 2;
var MIN_DPR = 0.25;
function viewportOf(cssWidth, cssHeight, dpr, scale = 1) {
  const share = Number.isFinite(scale) && scale > 0 ? scale : 1;
  return {
    w: Math.max(1, Math.round(cssWidth)),
    h: Math.max(1, Math.round(cssHeight)),
    dpr: Math.max(MIN_DPR, Math.min(MAX_DPR, dpr > 0 ? dpr : 1) * share),
  };
}
function sameViewport(a, b) {
  return a !== null && a.w === b.w && a.h === b.h && a.dpr === b.dpr;
}
function visibleBox(visual, layoutHeight) {
  const layout = Math.max(1, Math.round(layoutHeight));
  const whole = { top: 0, height: layout, bottom: 0 };
  if (!visual || !Number.isFinite(visual.height) || !Number.isFinite(visual.offsetTop)) {
    return whole;
  }
  if (Math.abs(visual.scale - 1) > 0.01) return whole;
  const top = Math.min(Math.max(0, Math.round(visual.offsetTop)), layout - 1);
  const height = Math.min(Math.max(1, Math.round(visual.height)), layout - top);
  return { top, height, bottom: layout - top - height };
}
function sameBox(a, b) {
  return a !== null && a.top === b.top && a.height === b.height && a.bottom === b.bottom;
}

export { MAX_DPR, MIN_DPR, sameBox, sameViewport, viewportOf, visibleBox };
