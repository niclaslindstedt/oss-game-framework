// src/input/hud-press.ts
var CLICK_ECHO_MS = 700;
function createHudPress() {
  let held = null;
  let firedAt = null;
  return {
    down: (p) => {
      if (p.pointerType === "mouse") return;
      held = p.pointerId;
    },
    up: (p, box, now) => {
      if (held !== p.pointerId) return false;
      held = null;
      firedAt = now;
      if (!box) return true;
      return (
        p.clientX >= box.left &&
        p.clientX <= box.right &&
        p.clientY >= box.top &&
        p.clientY <= box.bottom
      );
    },
    cancel: (p) => {
      if (held !== p.pointerId) return;
      held = null;
      firedAt = null;
    },
    click: (now) => firedAt === null || now - firedAt > CLICK_ECHO_MS,
  };
}
function pressHandlers(press, act) {
  return {
    onPointerDown: (e) => press.down(e),
    onPointerUp: (e) => {
      if (press.up(e, e.currentTarget?.getBoundingClientRect() ?? null, Date.now())) act();
    },
    onPointerCancel: (e) => press.cancel(e),
    onClick: () => {
      if (press.click(Date.now())) act();
    },
  };
}

export { createHudPress, pressHandlers };
