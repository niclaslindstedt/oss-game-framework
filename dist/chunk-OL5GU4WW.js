// src/shots/share-image.ts
var MIME_PNG = "image/png";
function pngFile(blob, name) {
  return new File([blob], name, { type: MIME_PNG });
}
function canShareImage(file) {
  if (typeof navigator === "undefined") return false;
  const nav = navigator;
  if (typeof nav.share !== "function") return false;
  if (typeof nav.canShare !== "function") return false;
  try {
    return nav.canShare({ files: [file] });
  } catch {
    return false;
  }
}
function canCopyImage() {
  if (typeof navigator === "undefined" || typeof ClipboardItem === "undefined") return false;
  if (typeof navigator.clipboard?.write !== "function") return false;
  const supports = ClipboardItem.supports;
  if (typeof supports !== "function") return true;
  try {
    return supports(MIME_PNG);
  } catch {
    return true;
  }
}
async function shareImage(file, data = {}) {
  try {
    await navigator.share({ ...data, files: [file] });
    return true;
  } catch {
    return false;
  }
}
async function copyImage(blob) {
  try {
    await navigator.clipboard.write([new ClipboardItem({ [MIME_PNG]: blob })]);
    return true;
  } catch {
    return false;
  }
}
function copyWhenReady() {
  if (!canCopyImage()) return null;
  let settle = () => {};
  const arrived = new Promise((resolve) => {
    settle = resolve;
  });
  const picture = arrived.then((blob) => blob ?? Promise.reject(new Error("no picture")));
  picture.catch(() => {});
  const later = () => arrived.then((blob) => (blob ? copyImage(blob) : false));
  let first;
  try {
    first = navigator.clipboard
      .write([new ClipboardItem({ [MIME_PNG]: picture })])
      .then(() => true)
      .catch(() => false);
  } catch {
    first = Promise.resolve(false);
  }
  return { done: first.then((copied) => copied || later()), ready: settle };
}
var COPY_WAIT_MS = 1200;
function copiedWithin(copy, ms = COPY_WAIT_MS) {
  return Promise.race([copy.done, new Promise((resolve) => setTimeout(() => resolve(false), ms))]);
}
function saveImage(blob, name) {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1e4);
    return true;
  } catch {
    return false;
  }
}

export {
  COPY_WAIT_MS,
  MIME_PNG,
  canCopyImage,
  canShareImage,
  copiedWithin,
  copyImage,
  copyWhenReady,
  pngFile,
  saveImage,
  shareImage,
};
