// src/pwa/pwa-update.ts
var CHECK_INTERVAL_MS = 60 * 60 * 1e3;
var IDLE = { needRefresh: false, incomingVersion: null };
var snapshot = IDLE;
var listeners = /* @__PURE__ */ new Set();
var config = null;
var started = false;
var waiting = null;
var applying = false;
var reloaded = false;
function setSnapshot(next) {
  if (
    next.needRefresh === snapshot.needRefresh &&
    next.incomingVersion === snapshot.incomingVersion
  )
    return;
  snapshot = next;
  for (const listener of listeners) listener();
}
async function fetchIncomingVersion(base) {
  try {
    const res = await fetch(`${base}version.json`, { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    const version =
      typeof data === "object" && data !== null && "version" in data ? data.version : null;
    if (typeof version === "string") {
      setSnapshot({ ...snapshot, incomingVersion: version });
    }
  } catch {}
}
function announceWaiting(worker, base) {
  waiting = worker;
  setSnapshot({ ...snapshot, needRefresh: true });
  void fetchIncomingVersion(base);
}
function reloadOnce() {
  if (reloaded) return;
  reloaded = true;
  window.location.reload();
}
function start() {
  if (started) return;
  started = true;
  const cfg = config;
  if (!cfg || cfg.enabled === false) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const { base } = cfg;
  const wasControlled = navigator.serviceWorker.controller !== null;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (applying || wasControlled) reloadOnce();
  });
  navigator.serviceWorker
    .register(`${base}sw.js`, { scope: base, type: "classic", updateViaCache: "none" })
    .then((registration) => {
      if (registration.waiting && navigator.serviceWorker.controller) {
        announceWaiting(registration.waiting, base);
      }
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            announceWaiting(installing, base);
          }
        });
      });
      void registration.update();
      window.setInterval(() => {
        if (document.visibilityState === "visible") void registration.update();
      }, CHECK_INTERVAL_MS);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") void registration.update();
      });
    })
    .catch(() => {});
}
function subscribe(listener) {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}
function getSnapshot() {
  return snapshot;
}
function apply() {
  applying = true;
  waiting?.postMessage({ type: "SKIP_WAITING" });
}
function pwaUpdateWatch(updateConfig) {
  config ??= updateConfig;
  return { subscribe, getSnapshot, reload: apply };
}

export { pwaUpdateWatch };
