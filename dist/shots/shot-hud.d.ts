import { HudCover } from "./shot-plan.js";

/** The HUD, serialized at the moment the shutter was pressed. The size is
 * the app-root's CSS box, which is the same rectangle the canvas fills. */
type HudLayer = {
  svg: string;
  width: number;
  height: number;
};
/** Which elements are the HUD, and which of the app-root's children must NOT
 * go into the layer. The defaults are the sibling games' class names; a game
 * with others passes its own. */
type HudLayerSelectors = {
  /** The HUD itself — its PARENT is the app-root the layer is the size of. A
   * HUD carrying `data-bare` (instruments down) yields no layer. */
  hud?: string;
  /** What the app-root holds that is not the race's chrome: the canvas is
   * the picture the layer is drawn over, and a card or a replay's transport
   * bar is a surface over the race rather than part of it. */
  exclude?: string;
};
/**
 * The screen's chrome as it stands right now, or null when there is none to
 * take: the instruments are down (H, or OPTIONS ▸ HUD — the HUD is then
 * `data-bare`, keeping only the thumbs and the corner presses a rider still
 * needs to steer and to get out), or the window has no size to speak of.
 *
 * That switch is the reason the HUD is asked before anything is read: it is
 * how a rider asks for a frame judged on its pixels, and a layer that came
 * back with the thumb zones in it would have missed the point of the press.
 */
declare function readHudLayer(selectors?: HudLayerSelectors): HudLayer | null;
/**
 * Paint a layer over a grabbed frame, scaled to it, and say where it landed.
 *
 * Resolves either way: a layer the browser declined to draw is a picture
 * without instruments, never a picture that failed — and a null map is a
 * stamp placed the way it was before the HUD was ever in the frame.
 */
declare function drawHudLayer(
  ctx: CanvasRenderingContext2D,
  layer: HudLayer,
  width: number,
  height: number,
): Promise<HudCover | null>;

export { type HudLayer, type HudLayerSelectors, drawHudLayer, readHudLayer };
