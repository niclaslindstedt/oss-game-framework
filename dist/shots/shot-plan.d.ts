/** The picture's size for a drawing buffer this big — the frame itself, or
 * as much of it as `MAX_SIDE` allows, with the aspect kept. */
declare function shotSize(
  width: number,
  height: number,
): {
  width: number;
  height: number;
};
/** The picture's file name, on disk and in a share sheet: the game, where
 * the picture was taken, and when — sortable, lowercase, no spaces. */
declare function shotFileName(app: string, label: string, takenAt: number): string;
/** Where the stamp's parts go, in picture pixels. */
type StampLayout = {
  /** The app-icon square's side. */
  mark: number;
  /** The margin from the picture's right and bottom edges. */
  pad: number;
  /** The size the name is set at. */
  font: number;
  /** Between the mark and the first letter of the name. */
  gap: number;
};
declare function stampLayout(width: number, height: number): StampLayout;
/** Whether a picture is big enough to be worth signing. Below this the
 * stamp would be most of the frame — which happens to nothing the game
 * captures today, but a thumbnail that reused this would find out the hard
 * way, and an unsigned picture is better than a defaced one. */
declare function stampFits(width: number, height: number): boolean;
/** A coarse yes/no map of where the HUD put ink over a picture: `cols` by
 * `rows` cells, row 0 at the top, 1 where an instrument covers the cell.
 * Read off the rasterized layer rather than off the DOM (shot-hud.ts),
 * because what matters is where the pixels LANDED — an instrument is a chip
 * with a shadow under a shape with a shadow under it, and no bounding box
 * anybody could walk says where that comes to. */
type HudCover = {
  cols: number;
  rows: number;
  on: Uint8Array;
};
/** A rectangle of the picture, in picture pixels. */
type Box = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};
/**
 * HOW FAR THE STAMP HAS TO BE LIFTED to stand clear of the instruments.
 *
 * The bottom-right corner is the quietest rectangle the SNOW has, and it
 * stays the right corner now that the HUD is in the picture too — but it is
 * not always the last pixel of one. The news column lives down there on a
 * window held sideways, and the whole thumb cluster stands along the foot of
 * one held upright; a signature dropped on either takes an instrument with
 * it. So the badge slides UP the corner until it finds room.
 *
 * Returns pixels, and zero when there is nowhere better to be — a picture
 * covered corner to corner gets the signature it would have had anyway,
 * rather than one floating in its middle.
 */
declare function stampLift(cover: HudCover | null, box: Box, width: number, height: number): number;
/** The name's typeface, the same condensed stack the HUD is set in
 * (the game's stylesheet) so a picture is signed in the game's own hand. Restated
 * rather than read off the document: a canvas font is a string, not a
 * computed style, and asking the DOM for one mid-capture is a layout flush
 * inside a frame. */
declare const STAMP_FONT_STACK =
  '"Avenir Next Condensed", "Arial Narrow", "Roboto Condensed", system-ui';
/** The class the layer's wrapper wears, and what `:root` is rewritten to on
 * the way in. Inside an SVG the document's root element is the `<svg>`, so a
 * `:root` rule — which is where the HUD's ink, its shadow, `--hud-dark` and
 * every other colour it is drawn in are declared — would match nothing at
 * all and the whole HUD would come out in the browser's default black. */
declare const HUD_LAYER_ROOT = "shot-hud-root";
/** Everything the HUD layer is built from. `markup` is the screen's chrome
 * serialized as XML, `css` the page's own stylesheet, and `inherited` the
 * declarations the HUD gets from the ancestors that are NOT coming with it
 * (the font off `body`, most of all) — read from the live page rather than
 * restated, so nothing here has to know what the app is set in. */
type HudLayerSource = {
  markup: string;
  css: string;
  /** The app-root's box in CSS pixels — the same rectangle the canvas
   * fills, which is what lets the layer be drawn over the picture with no
   * arithmetic beyond a scale. */
  width: number;
  height: number;
  inherited: string;
};
/** A RASTERIZED DOCUMENT HAS NO CLOCK. An SVG image is painted at time
 * zero, so every CSS animation in the layer starts over from its first
 * keyframe rather than standing where the screen had it — and the HUD's
 * entrances all begin at `opacity: 0`, which is a news column and a set of
 * thumb zones that are on screen and not in the picture. Turning them off
 * is half the fix; the other half is inlining where each animated property
 * had actually got to (shot-hud.ts). Transitions go the same way and for
 * the same reason: left running they render at their DESTINATION, so a bar
 * sweeping to the revs arrives before the shutter does. */
declare const LAYER_STILL_CSS =
  ".shot-hud-root,.shot-hud-root *{animation:none !important;transition:none !important}";
/** One keyframe key as the CSS property it names: the API hands them over
 * in the IDL spelling (`backgroundColor`), and a custom property arrives as
 * itself and must be left alone. */
declare function cssPropertyName(key: string): string;
/**
 * Which CSS properties a set of keyframes moves, as CSS names, in the order
 * they were first seen and with no repeats.
 *
 * A keyframe list is not a property list: the first and last frames of a
 * `from`/`to` rule carry the same property, a stepped rule carries it four
 * times, and every frame carries the timing keys above. What the freeze
 * needs is the SET, because each one is read off the live element once.
 */
declare function animatedProperties(frames: readonly Record<string, unknown>[]): string[];
/**
 * The HUD as a standalone SVG document, ready to be decoded as an image.
 *
 * The viewport is the app-root's CSS box and the viewBox matches it, so
 * `vw`, `vh` and `vmin` — which the HUD sizes its minimap, its chips and its
 * thumb zones in — resolve to exactly what they resolved to on screen. The
 * picture is usually bigger than that (a drawing buffer is CSS pixels times
 * the device ratio), and the scaling is left to the draw: an SVG is
 * rasterized at the size it is painted, so the HUD comes out at the
 * picture's resolution rather than upscaled from the window's.
 */
declare function hudLayerSvg(source: HudLayerSource): string;

export {
  type Box,
  HUD_LAYER_ROOT,
  type HudCover,
  type HudLayerSource,
  LAYER_STILL_CSS,
  STAMP_FONT_STACK,
  type StampLayout,
  animatedProperties,
  cssPropertyName,
  hudLayerSvg,
  shotFileName,
  shotSize,
  stampFits,
  stampLayout,
  stampLift,
};
