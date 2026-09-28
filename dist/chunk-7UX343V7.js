// src/input/thumb-guard.ts
var THUMB_WATCHDOG_MS = 200;
function createThumbGuard(letGo, target) {
  let pointerId = null;
  let down = null;
  let timer = null;
  const drop = () => {
    pointerId = null;
    down = null;
    if (timer !== null) clearInterval(timer);
    timer = null;
    letGo();
  };
  const poll = () => {
    if (pointerId !== null && down && !down(pointerId)) drop();
  };
  const onEnd = (e) => {
    if (pointerId !== null && e.pointerId === pointerId) drop();
  };
  const onGone = () => {
    if (pointerId !== null) drop();
  };
  target.addEventListener("pointerup", onEnd);
  target.addEventListener("pointercancel", onEnd);
  target.addEventListener("blur", onGone);
  target.addEventListener("visibilitychange", onGone);
  const unlisten = () => {
    target.removeEventListener("pointerup", onEnd);
    target.removeEventListener("pointercancel", onEnd);
    target.removeEventListener("blur", onGone);
    target.removeEventListener("visibilitychange", onGone);
  };
  return {
    claim: (id, isDown) => {
      if (pointerId !== null) {
        if (pointerId !== id && isDown(pointerId)) return false;
        drop();
      }
      pointerId = id;
      down = isDown;
      if (isDown(id)) timer = setInterval(poll, THUMB_WATCHDOG_MS);
      return true;
    },
    owns: (id) => pointerId === id,
    release: (id) => {
      if (pointerId === id) drop();
    },
    poll,
    dispose: () => {
      unlisten();
      drop();
    },
  };
}

export { createThumbGuard };
