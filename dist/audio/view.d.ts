import { Synth } from "./voice.js";

declare function scaledView(raw: Synth, volume: () => number): Synth;
/** Clamp to the 0–1 a fader promises. */
declare function clamp01(v: number): number;

export { clamp01, scaledView };
