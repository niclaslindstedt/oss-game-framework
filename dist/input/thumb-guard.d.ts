/** The listeners a guard needs from the window it watches. Typed
 * structurally so this module reads under a tsconfig with no DOM (a game's
 * root suite): the app hands it the real `window`. */
type GuardWindow = {
  addEventListener: (type: string, listener: (event: { pointerId?: number }) => void) => void;
  removeEventListener: (type: string, listener: (event: { pointerId?: number }) => void) => void;
};
/** A thumb zone's grip on the pointer driving it. */
type ThumbGuard = {
  /** Take the zone for this pointer. Refused only while a finger that is
   * demonstrably STILL DOWN owns it — `down` answers that question against
   * the DOM (the zone asks `hasPointerCapture`), so a claim also heals a
   * zone left holding a pointer whose end was never delivered. */
  claim: (pointerId: number, down: (pointerId: number) => boolean) => boolean;
  owns: (pointerId: number) => boolean;
  /** End the drag this pointer owns; any other pointer is ignored. */
  release: (pointerId: number) => void;
  /** One watchdog tick. Armed automatically while a pointer is held; called
   * directly by the tests, which have no timers to wait on. */
  poll: () => void;
  /** Let go and stop listening — the zone is going away. */
  dispose: () => void;
};
/**
 * Every way a thumb zone's grip on a finger has to be able to END.
 *
 * A touch control that trusts only its own pointerup is a control that
 * eventually STICKS: the finger is gone, the axis it wrote is not, and — the
 * zone still believing it is owned — no later touch can take it back. A
 * throttle lever is the worst case of it: a lever left open by a lost
 * pointerup is a vehicle that drives itself into the scenery.
 *
 * So the release is armed five ways: the zone's own pointerup/cancel (in the
 * HUD), the same events anywhere in the window — once capture is gone the
 * finger lifts over whatever element it is over — the app losing focus or
 * visibility, the watchdog above, and the zone unmounting. `letGo` is the
 * zone's own reset and must be safe to run when nothing is held: it is what
 * dispose leaves behind, so that a HUD which is not on screen is a HUD
 * holding no control down.
 */
declare function createThumbGuard(letGo: () => void, target: GuardWindow): ThumbGuard;

export { type GuardWindow, type ThumbGuard, createThumbGuard };
