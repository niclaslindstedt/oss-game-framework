import { hudLayerSvg, animatedProperties } from "./chunk-UILC52JT.js";

// src/shots/shot-hud.ts
var INHERITED = [
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-stretch",
  "line-height",
  "letter-spacing",
  "color",
  "direction",
];
var sheet = null;
var HUD_SELECTOR = ".hud:not(.hud-over-card):not(.hud-replay-layer)";
var NOT_IN_LAYER = "canvas, .menu, .loading, .hud-replay-layer";
function readHudLayer(selectors = {}) {
  try {
    const hud = document.querySelector(selectors.hud ?? HUD_SELECTOR);
    if (!hud || hud.dataset.bare) return null;
    const host = hud.parentElement ?? document.documentElement;
    const box = host.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return null;
    const width = Math.round(box.width);
    const height = Math.round(box.height);
    const markup = chromeMarkup(host, selectors.exclude ?? NOT_IN_LAYER);
    if (!markup) return null;
    const svg = hudLayerSvg({
      markup,
      css: pageCss(),
      width,
      height,
      inherited: inheritedOn(host),
    });
    return { svg, width, height };
  } catch {
    return null;
  }
}
function chromeMarkup(host, exclude) {
  const serializer = new XMLSerializer();
  const parts = [];
  for (const child of Array.from(host.children)) {
    if (child.matches(exclude)) continue;
    parts.push(serializer.serializeToString(still(child)));
  }
  return parts.join("");
}
function still(live) {
  const clone = live.cloneNode(true);
  const animations = relevantAnimations(live);
  if (animations.length === 0) return clone;
  const twins = /* @__PURE__ */ new Map();
  const liveNodes = [live, ...Array.from(live.querySelectorAll("*"))];
  const cloneNodes = [clone, ...Array.from(clone.querySelectorAll("*"))];
  for (let i = 0; i < liveNodes.length; i++) {
    const twin = cloneNodes[i];
    if (twin) twins.set(liveNodes[i], twin);
  }
  for (const animation of animations) {
    const effect = animation.effect;
    const target = effect?.target ?? null;
    if (!effect || !target || effect.pseudoElement) continue;
    const twin = twins.get(target);
    if (!(twin instanceof HTMLElement) && !(twin instanceof SVGElement)) continue;
    const computed = getComputedStyle(target);
    for (const property of animatedProperties(effect.getKeyframes())) {
      const value = computed.getPropertyValue(property);
      if (value !== "") twin.style.setProperty(property, value, "important");
    }
  }
  return clone;
}
function relevantAnimations(live) {
  try {
    if (typeof live.getAnimations !== "function") return [];
    return live.getAnimations({ subtree: true });
  } catch {
    return [];
  }
}
var COVER_COLS = 32;
var COVER_ROWS = 64;
var COVER_ALPHA = 8;
async function drawHudLayer(ctx, layer, width, height) {
  try {
    const image = await decodeLayer(layer.svg);
    if (!image || taints(image)) return null;
    ctx.drawImage(image, 0, 0, width, height);
    return coverOf(image);
  } catch {
    return null;
  }
}
function coverOf(image) {
  try {
    const map = document.createElement("canvas");
    map.width = COVER_COLS;
    map.height = COVER_ROWS;
    const ctx = map.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(image, 0, 0, COVER_COLS, COVER_ROWS);
    const { data } = ctx.getImageData(0, 0, COVER_COLS, COVER_ROWS);
    const on = new Uint8Array(COVER_COLS * COVER_ROWS);
    for (let cell = 0; cell < on.length; cell++) {
      on[cell] = (data[cell * 4 + 3] ?? 0) > COVER_ALPHA ? 1 : 0;
    }
    return { cols: COVER_COLS, rows: COVER_ROWS, on };
  } catch {
    return null;
  }
}
function pageCss() {
  if (sheet !== null) return sheet;
  const parts = [];
  for (const style of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(style.cssRules)) parts.push(rule.cssText);
    } catch {
      continue;
    }
  }
  if (parts.length === 0) return "";
  sheet = parts.join("\n");
  return sheet;
}
function inheritedOn(host) {
  const computed = getComputedStyle(host);
  return INHERITED.map((property) => `${property}:${computed.getPropertyValue(property)}`)
    .filter((declaration) => !declaration.endsWith(":"))
    .join(";");
}
async function decodeLayer(svg) {
  try {
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await image.decode();
    return image;
  } catch {
    return null;
  }
}
function taints(image) {
  try {
    const probe = document.createElement("canvas");
    probe.width = 1;
    probe.height = 1;
    const ctx = probe.getContext("2d");
    if (!ctx) return true;
    ctx.drawImage(image, 0, 0, 1, 1);
    ctx.getImageData(0, 0, 1, 1);
    return false;
  } catch {
    return true;
  }
}

export { drawHudLayer, readHudLayer };
