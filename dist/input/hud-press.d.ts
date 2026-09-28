/** What the state machine needs off a pointer event. */
type PressPoint = {
  pointerId: number;
  pointerType?: string;
  clientX: number;
  clientY: number;
};
/** What it needs off the button: where its edges are. */
type PressBox = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};
type HudPress = {
  /** A finger has landed on the button. */
  down: (p: PressPoint) => void;
  /** It has lifted. True when that is a press: the pointer this button was
   * holding, released inside its own edges. A box that could not be measured
   * counts as inside — the release reached the button, which is the whole
   * question, and a dead button is the worse failure. */
  up: (p: PressPoint, box: PressBox | null, now: number) => boolean;
  /** The grip is gone without a release — the browser took the touch for a
   * gesture of its own, or the pointer was captured away. */
  cancel: (p: PressPoint) => void;
  /** A `click` has arrived. True when it is a press in its own right — a
   * mouse, or a key on a focused button — rather than the echo of one this
   * button has just fired from the pointer events. */
  click: (now: number) => boolean;
};
/**
 * One button's press. A mouse is deliberately NOT armed on `pointerdown`:
 * it has a real activation path of its own — the drag-off cancel, the
 * secondary buttons, the keyboard's Enter and Space arriving as clicks — and
 * reimplementing that from pointer events would lose more than it fixed. So a
 * mouse presses through `click` exactly as it always did, and touch and pen
 * press through the pointer events because for them `click` is not on offer.
 */
declare function createHudPress(): HudPress;
/** A button the press machine can measure: any element, in practice. */
type PressTarget = {
  getBoundingClientRect: () => PressBox;
};
/** A pointer event as this module reads it. */
type PressEvent = PressPoint & {
  currentTarget: PressTarget | null;
};
/**
 * The four handlers a HUD button spreads onto itself. Stated once here rather
 * than per button, because the order the four have to agree in — arm, fire,
 * swallow — is the whole of the fix and is not a thing to retype.
 */
declare function pressHandlers(
  press: HudPress,
  act: () => void,
): {
  onPointerDown: (e: PressEvent) => void;
  onPointerUp: (e: PressEvent) => void;
  onPointerCancel: (e: PressEvent) => void;
  onClick: () => void;
};

export {
  type HudPress,
  type PressBox,
  type PressEvent,
  type PressPoint,
  type PressTarget,
  createHudPress,
  pressHandlers,
};
