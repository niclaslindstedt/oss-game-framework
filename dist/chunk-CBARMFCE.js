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
  let ready = () => {};
  const picture = new Promise((resolve, reject) => {
    ready = (blob) => (blob ? resolve(blob) : reject(new Error("no picture")));
  });
  picture.catch(() => {});
  const done = navigator.clipboard
    .write([new ClipboardItem({ [MIME_PNG]: picture })])
    .then(() => true)
    .catch(() => false);
  return { done, ready };
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
  MIME_PNG,
  canCopyImage,
  canShareImage,
  copyImage,
  copyWhenReady,
  pngFile,
  saveImage,
  shareImage,
};
