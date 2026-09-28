// src/audio/play.ts
var DEFAULT_VOLUME = { tone: 0.06, noise: 0.05 };
function shaped(voice, shape) {
  const { gain = 1, pitch = 1, stretch = 1, pan } = shape;
  if (gain === 1 && pitch === 1 && stretch === 1 && pan === void 0) return voice;
  const out = { ...voice };
  out.volume = (voice.volume ?? DEFAULT_VOLUME[voice.call]) * gain;
  out.durationMs = voice.durationMs * stretch;
  if (voice.delayMs !== void 0) out.delayMs = voice.delayMs * stretch;
  if (pan !== void 0) out.pan = pan;
  if (pitch !== 1) {
    if (voice.call === "tone" && out.call === "tone") {
      out.from = voice.from * pitch;
      if (voice.to !== void 0) out.to = voice.to * pitch;
    }
    if (voice.filter) {
      out.filter = {
        ...voice.filter,
        frequency: voice.filter.frequency * pitch,
        ...(voice.filter.to === void 0 ? {} : { to: voice.filter.to * pitch }),
      };
    }
  }
  return out;
}
function playDef(synth, def, shape) {
  for (const voice of def.voices) {
    const { call, ...options } = shape ? shaped(voice, shape) : voice;
    if (call === "noise") synth.noise(options);
    else synth.tone(options);
  }
}
function playSound(synth, bank, id, shape) {
  if (!id) return;
  const def = bank[id];
  if (def) playDef(synth, def, shape);
}

export { DEFAULT_VOLUME, playDef, playSound };
