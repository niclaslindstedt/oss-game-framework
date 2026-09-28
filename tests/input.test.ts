// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// INPUT — the touch plumbing a racing HUD stands on: a press made while a
// thumb is already down, and every way a thumb zone's grip has to end.

import { describe, expect, it } from "vitest";

import { createHudPress } from "../src/input/hud-press";
import { createThumbGuard, type GuardWindow } from "../src/input/thumb-guard";
import { pickNeighbour, type NavRect } from "../src/input/menu-cursor";

describe("a press made with a thumb already down (hud-press.ts)", () => {
  const box = { left: 0, top: 0, right: 40, bottom: 40 };

  it("fires on the release of the pointer it was holding, inside its own edges", () => {
    const press = createHudPress();
    press.down({ pointerId: 2, pointerType: "touch", clientX: 10, clientY: 10 });
    expect(press.up({ pointerId: 2, clientX: 12, clientY: 12 }, box, 1000)).toBe(true);
    // ...and swallows the click that echoes it.
    expect(press.click(1100)).toBe(false);
    expect(press.click(5000)).toBe(true);
  });

  it("abandons a press the finger slid off, and leaves a mouse to its own click", () => {
    const press = createHudPress();
    press.down({ pointerId: 3, pointerType: "touch", clientX: 10, clientY: 10 });
    expect(press.up({ pointerId: 3, clientX: 90, clientY: 10 }, box, 0)).toBe(false);
    press.down({ pointerId: 1, pointerType: "mouse", clientX: 10, clientY: 10 });
    expect(press.up({ pointerId: 1, clientX: 10, clientY: 10 }, box, 0)).toBe(false);
  });
});

describe("a thumb zone's grip (thumb-guard.ts)", () => {
  function fakeWindow(): GuardWindow & { fire: (type: string, pointerId?: number) => void } {
    const listeners = new Map<string, ((e: { pointerId?: number }) => void)[]>();
    return {
      addEventListener: (type, l) => listeners.set(type, [...(listeners.get(type) ?? []), l]),
      removeEventListener: (type, l) =>
        listeners.set(
          type,
          (listeners.get(type) ?? []).filter((x) => x !== l),
        ),
      fire: (type, pointerId) => {
        for (const l of listeners.get(type) ?? []) l({ pointerId });
      },
    };
  }

  it("lets go on the pointer's end anywhere, on blur, and on the watchdog", () => {
    let released = 0;
    const win = fakeWindow();
    const guard = createThumbGuard(() => released++, win);
    expect(guard.claim(5, () => false)).toBe(true);
    win.fire("pointerup", 5);
    expect(released).toBe(1);
    guard.claim(6, () => false);
    win.fire("blur");
    expect(released).toBe(2);
    let down = true;
    guard.claim(7, () => down);
    down = false;
    guard.poll();
    expect(released).toBe(3);
    guard.dispose();
  });

  it("refuses a second finger while the first is demonstrably still down", () => {
    const guard = createThumbGuard(() => {}, fakeWindow());
    expect(guard.claim(1, () => true)).toBe(true);
    expect(guard.claim(2, () => true)).toBe(false);
    expect(guard.owns(1)).toBe(true);
    guard.dispose();
  });
});

describe("the cursor's walk (menu-cursor.ts)", () => {
  const card: NavRect[] = [
    { x: 0, y: 0, w: 200, h: 40 },
    { x: 0, y: 50, w: 95, h: 40 },
    { x: 105, y: 50, w: 95, h: 40 },
    { x: 0, y: 100, w: 200, h: 40 },
  ];

  it("goes down to the row underneath and right to the button beside", () => {
    expect(pickNeighbour(card, 0, "down")).toBe(1);
    expect(pickNeighbour(card, 1, "right")).toBe(2);
    expect(pickNeighbour(card, 2, "down")).toBe(3);
  });

  it("wraps off the bottom to the top", () => {
    expect(pickNeighbour(card, 3, "down")).toBe(0);
  });
});

/** Everything the guard uses of a window is EventTarget, which Node has. */
const fakeWindow = (): GuardWindow & EventTarget =>
  new EventTarget() as unknown as GuardWindow & EventTarget;

const pointerEvent = (type: string, pointerId: number): Event =>
  Object.assign(new Event(type), { pointerId });

/** A steering zone reduced to what matters here: the axis it writes and the
 * fingers the browser says are on the glass. */
function stubZone() {
  const held = new Set<number>();
  const state = { steer: 0 };
  const win = fakeWindow();
  const guard = createThumbGuard(() => {
    state.steer = 0;
  }, win);
  const press = (pointerId: number, steer: number): boolean => {
    held.add(pointerId);
    const took = guard.claim(pointerId, (id) => held.has(id));
    if (took) state.steer = steer;
    return took;
  };
  return { held, state, win, guard, press };
}

describe("thumb zone ownership (the steering case)", () => {
  it("centres the wheel when the pointerup arrives on the window instead", () => {
    const zone = stubZone();
    zone.press(1, 0.8);
    expect(zone.state.steer).toBe(0.8);

    // Capture is gone, so the finger lifts over whatever element it happens
    // to be over — never over the zone.
    zone.held.delete(1);
    zone.win.dispatchEvent(pointerEvent("pointerup", 1));
    expect(zone.state.steer).toBe(0);
    zone.guard.dispose();
  });

  it("centres the wheel when no end event is delivered at all", () => {
    const zone = stubZone();
    zone.press(1, -0.6);

    // The thumb slid off the bottom of the screen: nothing is dispatched
    // anywhere, and only a poll can find that out.
    zone.held.delete(1);
    zone.guard.poll();
    expect(zone.state.steer).toBe(0);
    zone.guard.dispose();
  });

  it("hands the zone to the next finger once the first one is gone", () => {
    const zone = stubZone();
    zone.press(1, 0.5);

    // A second finger while the first is genuinely down is ignored: it does
    // not get to re-anchor the wheel under the thumb already steering.
    expect(zone.press(2, 0.9)).toBe(false);
    expect(zone.state.steer).toBe(0.5);

    // But once the first is gone, the next touch takes the zone back — the
    // wedged-forever case the player sees as steering no restart clears.
    zone.held.delete(1);
    zone.held.delete(2);
    expect(zone.press(3, -0.4)).toBe(true);
    expect(zone.state.steer).toBe(-0.4);
    zone.guard.dispose();
  });

  it("lets go when the app loses focus or goes away", () => {
    for (const event of ["blur", "visibilitychange"]) {
      const zone = stubZone();
      zone.press(1, 0.7);
      zone.win.dispatchEvent(new Event(event));
      expect(zone.state.steer, event).toBe(0);
      zone.guard.dispose();
    }
  });

  it("lets go when the zone unmounts under a live thumb", () => {
    const zone = stubZone();
    zone.press(1, 1);
    zone.guard.dispose();
    expect(zone.state.steer).toBe(0);
  });
});

const CARD: NavRect[] = [
  { x: 20, y: 0, w: 200, h: 30 }, // 0 back
  { x: 20, y: 40, w: 200, h: 30 }, // 1 a row
  { x: 20, y: 80, w: 95, h: 30 }, // 2 left of a pair
  { x: 125, y: 80, w: 95, h: 30 }, // 3 right of a pair
  { x: 20, y: 120, w: 200, h: 30 }, // 4 the last row
];

describe("the menu cursor's geometry", () => {
  it("walks a column one row at a time", () => {
    expect(pickNeighbour(CARD, 0, "down")).toBe(1);
    expect(pickNeighbour(CARD, 1, "up")).toBe(0);
  });

  it("prefers the row underneath to a nearer button off to one side", () => {
    // From the left of the pair, DOWN is the row below — not the button
    // beside it, which is closer by centre distance alone.
    expect(pickNeighbour(CARD, 2, "down")).toBe(4);
    expect(pickNeighbour(CARD, 2, "right")).toBe(3);
    expect(pickNeighbour(CARD, 3, "left")).toBe(2);
  });

  it("wraps to the far end rather than stopping dead", () => {
    // Off the bottom lands on the TOP row, not the one above it: a list that
    // stops makes a player walk all the way back for the button under their
    // thumb.
    expect(pickNeighbour(CARD, 4, "down")).toBe(0);
    expect(pickNeighbour(CARD, 0, "up")).toBe(4);
  });

  it("has nowhere to go on an empty card, and starts at the top on a fresh one", () => {
    expect(pickNeighbour([], 0, "down")).toBeNull();
    // A cursor that is nowhere yet lands on the first item.
    expect(pickNeighbour(CARD, -1, "down")).toBe(0);
  });
});
