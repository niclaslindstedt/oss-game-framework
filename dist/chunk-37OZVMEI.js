import { thumbSize } from "./chunk-AWWUCUXN.js";

// src/shots/shot-thumbs.ts
var THUMB_BOX = { width: 160, height: 90 };
var made = /* @__PURE__ */ new Map();
var queue = Promise.resolve();
function thumbUrl(entry) {
  const held = made.get(entry.id);
  if (held) return held.work;
  const record = { url: null, work: Promise.resolve(null) };
  record.work = enqueue(() => shrink(entry)).then((url) => {
    record.url = url;
    return url;
  });
  made.set(entry.id, record);
  return record.work;
}
function releaseThumbs(keep) {
  for (const [id, record] of made) {
    if (keep.has(id)) continue;
    made.delete(id);
    if (record.url) URL.revokeObjectURL(record.url);
    else void record.work.then((url) => (url ? URL.revokeObjectURL(url) : void 0));
  }
}
function enqueue(work) {
  const next = queue.then(work, work);
  queue = next.catch(() => void 0);
  return next;
}
async function shrink(entry) {
  try {
    if (typeof createImageBitmap !== "function") return whole(entry);
    const size = thumbSize(entry.width, entry.height, THUMB_BOX.width, THUMB_BOX.height);
    const bitmap = await createImageBitmap(entry.blob, {
      resizeWidth: size.width,
      resizeHeight: size.height,
      // A tile this small is never studied; the cheap filter is the right
      // one, and it is the one that keeps the decode off the frame budget.
      resizeQuality: "low",
    });
    const small = await encode(bitmap, size);
    bitmap.close();
    return small ? URL.createObjectURL(small) : whole(entry);
  } catch {
    return whole(entry);
  }
}
function whole(entry) {
  try {
    return URL.createObjectURL(entry.blob);
  } catch {
    return null;
  }
}
async function encode(bitmap, size) {
  if (typeof OffscreenCanvas === "function") {
    const canvas2 = new OffscreenCanvas(size.width, size.height);
    const ctx2 = canvas2.getContext("2d");
    if (!ctx2) return null;
    ctx2.drawImage(bitmap, 0, 0);
    return canvas2.convertToBlob({ type: "image/png" });
  }
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export { THUMB_BOX, releaseThumbs, thumbUrl };
