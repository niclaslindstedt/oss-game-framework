import { shotMeta, withStored, shotId, withShot, keysPastCap } from "./chunk-AWWUCUXN.js";

// src/shots/shot-store.ts
var STORE = "shots";
var roll = [];
var options = { dbName: "shots", limit: 40 };
var reading = null;
var read = false;
var listeners = /* @__PURE__ */ new Set();
var counter = 0;
function configureShotStore(next) {
  options = next;
}
function openDb() {
  return new Promise((resolve) => {
    let factory;
    try {
      factory = typeof indexedDB === "undefined" ? void 0 : indexedDB;
    } catch {
      factory = void 0;
    }
    if (!factory) {
      resolve(null);
      return;
    }
    let request;
    try {
      request = factory.open(options.dbName, 1);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      const opened = request.result;
      if (!opened.objectStoreNames.contains(STORE)) {
        opened.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}
async function withStore(mode, work) {
  const db = await openDb();
  if (!db) return false;
  try {
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, mode);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
      work(tx.objectStore(STORE));
    });
  } catch {
    return false;
  } finally {
    db.close();
  }
}
function announce() {
  const snapshot = shotMeta(roll);
  for (const listener of listeners) listener(snapshot);
}
function loadShots() {
  reading ??= readRoll().then((meta) => {
    read = true;
    return meta;
  });
  return reading;
}
function shotsRead() {
  return read;
}
async function readRoll() {
  const db = await openDb();
  if (!db) return shotMeta(roll);
  const stored = await new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).getAll();
      request.onsuccess = () => resolve(request.result ?? []);
      request.onerror = () => resolve([]);
      tx.onabort = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
  db.close();
  roll = withStored(roll, stored, options.limit);
  announce();
  return shotMeta(roll);
}
function shotList() {
  return shotMeta(roll);
}
function shot(id) {
  return roll.find((entry) => entry.id === id) ?? null;
}
function subscribeShots(listener) {
  listeners.add(listener);
  listener(shotMeta(roll));
  return () => {
    listeners.delete(listener);
  };
}
function putShot(entry) {
  counter = (counter + 1) % 1e6;
  const full = { id: shotId(entry.takenAt, counter), ...entry };
  roll = withShot(roll, full, options.limit);
  announce();
  void (async () => {
    await withStore("readwrite", (store) => {
      store.put(full);
    });
    await withStore("readwrite", (store) => {
      const request = store.getAllKeys();
      request.onsuccess = () => {
        const keys = request.result.filter((key) => typeof key === "string");
        for (const key of keysPastCap(keys, options.limit)) store.delete(key);
      };
    });
  })();
  return shotMeta([full])[0];
}
async function deleteShot(id) {
  roll = roll.filter((entry) => entry.id !== id);
  announce();
  await withStore("readwrite", (store) => {
    store.delete(id);
  });
}
async function clearShots() {
  roll = [];
  announce();
  await withStore("readwrite", (store) => {
    store.clear();
  });
}

export {
  clearShots,
  configureShotStore,
  deleteShot,
  loadShots,
  putShot,
  shot,
  shotList,
  shotsRead,
  subscribeShots,
};
