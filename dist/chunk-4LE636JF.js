// src/audio/voice.ts
var MIN_ATTACK_MS = 1.5;
var MAX_CUTOFF_RATIO = 0.45;
function safeCutoff(hz, sampleRate) {
  const ceiling = sampleRate * MAX_CUTOFF_RATIO;
  return Math.min(Math.max(20, hz), ceiling);
}
function shaperSteepness(drive) {
  return 1 + 9 * Math.min(1, Math.max(0, drive));
}
function shaperPush(drive) {
  return 1 + 3 * Math.min(1, Math.max(0, drive));
}
function envelopeShape(peak, t0, t1, attackMs, holdMs, decay) {
  const durationMs = (t1 - t0) * 1e3;
  const floor = decay === "exp" ? 1e-4 : 0;
  const top = decay === "exp" ? Math.max(1e-5, peak) : peak;
  const rise = Math.min(Math.max(attackMs, MIN_ATTACK_MS), durationMs * 0.5) / 1e3;
  const level = t0 + rise;
  const steps = [
    { at: t0, value: floor, ramp: "set" },
    { at: level, value: top, ramp: decay === "exp" ? "exp" : "lin" },
  ];
  if (holdMs > 0) {
    const decayFrom = Math.min(level + holdMs / 1e3, t1 - 5e-3);
    if (decayFrom > level) steps.push({ at: decayFrom, value: top, ramp: "set" });
  }
  steps.push({ at: t1, value: floor, ramp: decay });
  return steps;
}

export { MAX_CUTOFF_RATIO, MIN_ATTACK_MS, envelopeShape, safeCutoff, shaperPush, shaperSteepness };
