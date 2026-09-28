import { DEFAULT_VOLUME } from "./chunk-QVA3B63T.js";

// src/audio/view.ts
var SILENT = 1e-3;
function scaledView(raw, volume) {
  return {
    unlock: () => raw.unlock(),
    autostart: () => raw.autostart(),
    resume: () => raw.resume(),
    now: () => raw.now(),
    tone(options) {
      const scaled = (options.volume ?? DEFAULT_VOLUME.tone) * volume();
      if (scaled < SILENT) return;
      raw.tone({ ...options, volume: scaled });
    },
    noise(options) {
      const scaled = (options.volume ?? DEFAULT_VOLUME.noise) * volume();
      if (scaled < SILENT) return;
      raw.noise({ ...options, volume: scaled });
    },
    layer(spec) {
      const inner = raw.layer(spec);
      if (!inner) return null;
      return {
        set: (target, glideS) => inner.set({ ...target, level: target.level * volume() }, glideS),
        stop: () => inner.stop(),
        alive: () => inner.alive(),
      };
    },
  };
}
function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export { clamp01, scaledView };
