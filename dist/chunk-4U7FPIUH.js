// src/racing/tape.ts
var SIGNED_STEPS = 127;
var LEVER_STEPS = 255;
function clampTo(v, min, max) {
  return v < min ? min : v > max ? max : v;
}
function snapToGrid(v, steps) {
  const index = Math.round(v * steps);
  return index === 0 ? 0 : index / steps;
}
function snapAxis(v, kind) {
  if (kind === "signed") return snapToGrid(clampTo(v, -1, 1), SIGNED_STEPS);
  if (kind === "lever") return snapToGrid(clampTo(v, 0, 1), LEVER_STEPS);
  return v;
}
function axisToByte(v, kind) {
  if (kind === "signed") return Math.round(clampTo(v, -1, 1) * SIGNED_STEPS) + SIGNED_STEPS;
  if (kind === "lever") return Math.round(clampTo(v, 0, 1) * LEVER_STEPS);
  return v & 255;
}
function byteToAxis(b, kind) {
  if (kind === "signed") return (b - SIGNED_STEPS) / SIGNED_STEPS;
  if (kind === "lever") return b / LEVER_STEPS;
  return b;
}
var BASE64_CHUNK = 32768;
function toBase64(bytes) {
  let raw = "";
  for (let i = 0; i < bytes.length; i += BASE64_CHUNK) {
    raw += String.fromCharCode(...bytes.slice(i, i + BASE64_CHUNK));
  }
  return btoa(raw);
}
function fromBase64(text) {
  const raw = atob(text);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}
function encodeStream(values) {
  const out = [];
  let i = 0;
  while (i < values.length) {
    const value = values[i];
    let run = 1;
    while (run < 255 && i + run < values.length && values[i + run] === value) run++;
    out.push(run, value);
    i += run;
  }
  return toBase64(out);
}
function decodeStream(text, steps) {
  const out = new Uint8Array(steps);
  let bytes;
  try {
    bytes = fromBase64(text);
  } catch {
    return out;
  }
  let at = 0;
  for (let i = 0; i + 1 < bytes.length && at < steps; i += 2) {
    const run = Math.min(bytes[i], steps - at);
    out.fill(bytes[i + 1], at, at + run);
    at += run;
  }
  return out;
}
function streamsOf(schema) {
  return Object.keys(schema);
}
function createTapeRecorder(schema) {
  const names = streamsOf(schema);
  const streams = new Map(names.map((n) => [n, []]));
  let steps = 0;
  return {
    record: (values) => {
      for (const n of names) streams.get(n).push(axisToByte(values[n], schema[n]));
      steps++;
    },
    steps: () => steps,
    seal: () => {
      const tape = { steps };
      for (const n of names) tape[n] = encodeStream(streams.get(n));
      return tape;
    },
  };
}
function readTape(tape, schema) {
  const names = streamsOf(schema);
  const steps = tape.steps;
  const bytes = new Map(names.map((n) => [n, decodeStream(tape[n], steps)]));
  return {
    steps,
    at: (step, out) => {
      if (step < 0 || step >= steps) return null;
      for (const n of names) out[n] = byteToAxis(bytes.get(n)[step], schema[n]);
      return out;
    },
  };
}
function isControlTape(parsed, schema) {
  if (typeof parsed !== "object" || parsed === null) return false;
  const tape = parsed;
  if (!Number.isInteger(tape.steps) || tape.steps <= 0) return false;
  return streamsOf(schema).every((n) => typeof tape[n] === "string");
}
function createFingerprint() {
  let hash = 2166136261;
  const print = {
    mix: (v) => {
      const n = Math.round(v * 100) | 0;
      for (let s = 0; s < 32; s += 8) {
        hash ^= (n >>> s) & 255;
        hash = Math.imul(hash, 16777619) >>> 0;
      }
      return print;
    },
    digest: () => hash.toString(16).padStart(8, "0"),
  };
  return print;
}

export {
  LEVER_STEPS,
  SIGNED_STEPS,
  axisToByte,
  byteToAxis,
  createFingerprint,
  createTapeRecorder,
  decodeStream,
  encodeStream,
  isControlTape,
  readTape,
  snapAxis,
  snapToGrid,
};
