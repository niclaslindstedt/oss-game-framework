import {
  Shot,
  ShotMeta,
  keysPastCap,
  shotId,
  shotMeta,
  thumbSize,
  withShot,
  withStored,
} from "./shots/shot-roll.js";
import {
  ShotStoreOptions,
  clearShots,
  configureShotStore,
  deleteShot,
  loadShots,
  putShot,
  shot,
  shotList,
  shotsRead,
  subscribeShots,
} from "./shots/shot-store.js";
import { THUMB_BOX, releaseThumbs, thumbUrl } from "./shots/shot-thumbs.js";
import {
  MIME_PNG,
  PendingCopy,
  canCopyImage,
  canShareImage,
  copyImage,
  copyWhenReady,
  pngFile,
  saveImage,
  shareImage,
} from "./shots/share-image.js";
import {
  Box,
  HUD_LAYER_ROOT,
  HudCover,
  HudLayerSource,
  LAYER_STILL_CSS,
  STAMP_FONT_STACK,
  StampLayout,
  animatedProperties,
  cssPropertyName,
  hudLayerSvg,
  shotFileName,
  shotSize,
  stampFits,
  stampLayout,
  stampLift,
} from "./shots/shot-plan.js";
import { HudLayer, HudLayerSelectors, drawHudLayer, readHudLayer } from "./shots/shot-hud.js";

declare const index_Box: typeof Box;
declare const index_HUD_LAYER_ROOT: typeof HUD_LAYER_ROOT;
declare const index_HudCover: typeof HudCover;
declare const index_HudLayer: typeof HudLayer;
declare const index_HudLayerSelectors: typeof HudLayerSelectors;
declare const index_HudLayerSource: typeof HudLayerSource;
declare const index_LAYER_STILL_CSS: typeof LAYER_STILL_CSS;
declare const index_MIME_PNG: typeof MIME_PNG;
declare const index_PendingCopy: typeof PendingCopy;
declare const index_STAMP_FONT_STACK: typeof STAMP_FONT_STACK;
declare const index_Shot: typeof Shot;
declare const index_ShotMeta: typeof ShotMeta;
declare const index_ShotStoreOptions: typeof ShotStoreOptions;
declare const index_StampLayout: typeof StampLayout;
declare const index_THUMB_BOX: typeof THUMB_BOX;
declare const index_animatedProperties: typeof animatedProperties;
declare const index_canCopyImage: typeof canCopyImage;
declare const index_canShareImage: typeof canShareImage;
declare const index_clearShots: typeof clearShots;
declare const index_configureShotStore: typeof configureShotStore;
declare const index_copyImage: typeof copyImage;
declare const index_copyWhenReady: typeof copyWhenReady;
declare const index_cssPropertyName: typeof cssPropertyName;
declare const index_deleteShot: typeof deleteShot;
declare const index_drawHudLayer: typeof drawHudLayer;
declare const index_hudLayerSvg: typeof hudLayerSvg;
declare const index_keysPastCap: typeof keysPastCap;
declare const index_loadShots: typeof loadShots;
declare const index_pngFile: typeof pngFile;
declare const index_putShot: typeof putShot;
declare const index_readHudLayer: typeof readHudLayer;
declare const index_releaseThumbs: typeof releaseThumbs;
declare const index_saveImage: typeof saveImage;
declare const index_shareImage: typeof shareImage;
declare const index_shot: typeof shot;
declare const index_shotFileName: typeof shotFileName;
declare const index_shotId: typeof shotId;
declare const index_shotList: typeof shotList;
declare const index_shotMeta: typeof shotMeta;
declare const index_shotSize: typeof shotSize;
declare const index_shotsRead: typeof shotsRead;
declare const index_stampFits: typeof stampFits;
declare const index_stampLayout: typeof stampLayout;
declare const index_stampLift: typeof stampLift;
declare const index_subscribeShots: typeof subscribeShots;
declare const index_thumbSize: typeof thumbSize;
declare const index_thumbUrl: typeof thumbUrl;
declare const index_withShot: typeof withShot;
declare const index_withStored: typeof withStored;
declare namespace index {
  export {
    index_Box as Box,
    index_HUD_LAYER_ROOT as HUD_LAYER_ROOT,
    index_HudCover as HudCover,
    index_HudLayer as HudLayer,
    index_HudLayerSelectors as HudLayerSelectors,
    index_HudLayerSource as HudLayerSource,
    index_LAYER_STILL_CSS as LAYER_STILL_CSS,
    index_MIME_PNG as MIME_PNG,
    index_PendingCopy as PendingCopy,
    index_STAMP_FONT_STACK as STAMP_FONT_STACK,
    index_Shot as Shot,
    index_ShotMeta as ShotMeta,
    index_ShotStoreOptions as ShotStoreOptions,
    index_StampLayout as StampLayout,
    index_THUMB_BOX as THUMB_BOX,
    index_animatedProperties as animatedProperties,
    index_canCopyImage as canCopyImage,
    index_canShareImage as canShareImage,
    index_clearShots as clearShots,
    index_configureShotStore as configureShotStore,
    index_copyImage as copyImage,
    index_copyWhenReady as copyWhenReady,
    index_cssPropertyName as cssPropertyName,
    index_deleteShot as deleteShot,
    index_drawHudLayer as drawHudLayer,
    index_hudLayerSvg as hudLayerSvg,
    index_keysPastCap as keysPastCap,
    index_loadShots as loadShots,
    index_pngFile as pngFile,
    index_putShot as putShot,
    index_readHudLayer as readHudLayer,
    index_releaseThumbs as releaseThumbs,
    index_saveImage as saveImage,
    index_shareImage as shareImage,
    index_shot as shot,
    index_shotFileName as shotFileName,
    index_shotId as shotId,
    index_shotList as shotList,
    index_shotMeta as shotMeta,
    index_shotSize as shotSize,
    index_shotsRead as shotsRead,
    index_stampFits as stampFits,
    index_stampLayout as stampLayout,
    index_stampLift as stampLift,
    index_subscribeShots as subscribeShots,
    index_thumbSize as thumbSize,
    index_thumbUrl as thumbUrl,
    index_withShot as withShot,
    index_withStored as withStored,
  };
}

export { index as i };
