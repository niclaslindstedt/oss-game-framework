import {
  subscribeShots,
  shotsRead,
  shotList,
  shot,
  putShot,
  loadShots,
  deleteShot,
  configureShotStore,
  clearShots,
} from "./chunk-6J2IX6IH.js";
import { thumbUrl, releaseThumbs, THUMB_BOX } from "./chunk-37OZVMEI.js";
import {
  shareImage,
  saveImage,
  pngFile,
  copyWhenReady,
  copyImage,
  canShareImage,
  canCopyImage,
  MIME_PNG,
} from "./chunk-CBARMFCE.js";
import { readHudLayer, drawHudLayer } from "./chunk-T5WJMIEP.js";
import {
  stampLift,
  stampLayout,
  stampFits,
  shotSize,
  shotFileName,
  hudLayerSvg,
  cssPropertyName,
  animatedProperties,
  STAMP_FONT_STACK,
  LAYER_STILL_CSS,
  HUD_LAYER_ROOT,
} from "./chunk-UILC52JT.js";
import {
  withStored,
  withShot,
  thumbSize,
  shotMeta,
  shotId,
  keysPastCap,
} from "./chunk-AWWUCUXN.js";
import { __export } from "./chunk-MLKGABMK.js";

// src/shots/index.ts
var shots_exports = {};
__export(shots_exports, {
  HUD_LAYER_ROOT: () => HUD_LAYER_ROOT,
  LAYER_STILL_CSS: () => LAYER_STILL_CSS,
  MIME_PNG: () => MIME_PNG,
  STAMP_FONT_STACK: () => STAMP_FONT_STACK,
  THUMB_BOX: () => THUMB_BOX,
  animatedProperties: () => animatedProperties,
  canCopyImage: () => canCopyImage,
  canShareImage: () => canShareImage,
  clearShots: () => clearShots,
  configureShotStore: () => configureShotStore,
  copyImage: () => copyImage,
  copyWhenReady: () => copyWhenReady,
  cssPropertyName: () => cssPropertyName,
  deleteShot: () => deleteShot,
  drawHudLayer: () => drawHudLayer,
  hudLayerSvg: () => hudLayerSvg,
  keysPastCap: () => keysPastCap,
  loadShots: () => loadShots,
  pngFile: () => pngFile,
  putShot: () => putShot,
  readHudLayer: () => readHudLayer,
  releaseThumbs: () => releaseThumbs,
  saveImage: () => saveImage,
  shareImage: () => shareImage,
  shot: () => shot,
  shotFileName: () => shotFileName,
  shotId: () => shotId,
  shotList: () => shotList,
  shotMeta: () => shotMeta,
  shotSize: () => shotSize,
  shotsRead: () => shotsRead,
  stampFits: () => stampFits,
  stampLayout: () => stampLayout,
  stampLift: () => stampLift,
  subscribeShots: () => subscribeShots,
  thumbSize: () => thumbSize,
  thumbUrl: () => thumbUrl,
  withShot: () => withShot,
  withStored: () => withStored,
});

export { shots_exports };
