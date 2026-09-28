// src/shots/shot-plan.ts
var MAX_SIDE = 2560;
function shotSize(width, height) {
  const longest = Math.max(width, height);
  if (longest <= MAX_SIDE || longest < 1) {
    return { width: Math.max(1, Math.round(width)), height: Math.max(1, Math.round(height)) };
  }
  const scale = MAX_SIDE / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}
function shotFileName(app, label, takenAt) {
  const stamp = new Date(takenAt).toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `${slug(app)}-${slug(label) || "shot"}-${stamp}.png`;
}
function slug(text) {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
var MARK_OF_SHORT_SIDE = 0.075;
var MARK_MIN = 26;
var MARK_MAX = 84;
var PAD_OF_MARK = 0.5;
var FONT_OF_MARK = 0.42;
var GAP_OF_MARK = 0.3;
function stampLayout(width, height) {
  const short = Math.max(1, Math.min(width, height));
  const mark = Math.round(Math.min(MARK_MAX, Math.max(MARK_MIN, short * MARK_OF_SHORT_SIDE)));
  return {
    mark,
    pad: Math.round(mark * PAD_OF_MARK),
    font: Math.round(mark * FONT_OF_MARK),
    gap: Math.round(mark * GAP_OF_MARK),
  };
}
function stampFits(width, height) {
  const layout = stampLayout(width, height);
  return width >= layout.mark * 6 && height >= layout.mark * 3;
}
function stampLift(cover, box, width, height) {
  if (!cover || cover.cols < 1 || cover.rows < 1 || width < 1 || height < 1) return 0;
  const rowHeight = height / cover.rows;
  const from = clamp(Math.floor((box.left / width) * cover.cols), cover.cols);
  const to = clamp(Math.ceil((box.right / width) * cover.cols) - 1, cover.cols);
  const tall = Math.max(1, Math.ceil((box.bottom - box.top) / rowHeight));
  for (let floor = cover.rows - 1; floor >= tall - 1; floor--) {
    if (clearBand(cover, from, to, floor - tall + 1, floor)) {
      return Math.round((cover.rows - 1 - floor) * rowHeight);
    }
  }
  return 0;
}
function clearBand(cover, from, to, top, bottom) {
  for (let row = top; row <= bottom; row++) {
    for (let col = from; col <= to; col++) {
      if (cover.on[row * cover.cols + col]) return false;
    }
  }
  return true;
}
function clamp(value, count) {
  return Math.max(0, Math.min(count - 1, value));
}
var STAMP_FONT_STACK = '"Avenir Next Condensed", "Arial Narrow", "Roboto Condensed", system-ui';
var HUD_LAYER_ROOT = "shot-hud-root";
var LAYER_STILL_CSS = `.${HUD_LAYER_ROOT},.${HUD_LAYER_ROOT} *{animation:none !important;transition:none !important}`;
var KEYFRAME_TIMING = /* @__PURE__ */ new Set(["offset", "computedOffset", "easing", "composite"]);
function cssPropertyName(key) {
  if (key.startsWith("--")) return key;
  return key.replace(/[A-Z]/g, (upper) => `-${upper.toLowerCase()}`);
}
function animatedProperties(frames) {
  const seen = /* @__PURE__ */ new Set();
  for (const frame of frames) {
    for (const key of Object.keys(frame)) {
      if (KEYFRAME_TIMING.has(key)) continue;
      seen.add(cssPropertyName(key));
    }
  }
  return [...seen];
}
function hudLayerSvg(source) {
  const width = Math.max(1, Math.round(source.width));
  const height = Math.max(1, Math.round(source.height));
  const style = `position:relative;width:${width}px;height:${height}px;overflow:hidden;${source.inherited}`;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<foreignObject x="0" y="0" width="${width}" height="${height}">`,
    `<div xmlns="http://www.w3.org/1999/xhtml" class="${HUD_LAYER_ROOT}" style="${escapeAttr(style)}">`,
    `<style>${cdata(`${rootedCss(source.css)}
${LAYER_STILL_CSS}`)}</style>`,
    source.markup,
    "</div></foreignObject></svg>",
  ].join("");
}
function rootedCss(css) {
  return css.split(":root").join(`.${HUD_LAYER_ROOT}`);
}
function cdata(text) {
  return `<![CDATA[${text.split("]]>").join("]]]]><![CDATA[>")}]]>`;
}
function escapeAttr(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

export {
  HUD_LAYER_ROOT,
  LAYER_STILL_CSS,
  STAMP_FONT_STACK,
  animatedProperties,
  cssPropertyName,
  hudLayerSvg,
  shotFileName,
  shotSize,
  stampFits,
  stampLayout,
  stampLift,
};
