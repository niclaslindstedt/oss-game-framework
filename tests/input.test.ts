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
