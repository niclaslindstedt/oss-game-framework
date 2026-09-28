import { Synth } from "./voice.js";

/** The room a synth's echo bus plays: the delay, s; the feedback, 0..1; and
 * the lowpass the repeats are damped through, Hz. */
type EchoOptions = {
  delayS?: number;
  feedback?: number;
  dampHz?: number;
};
type SynthOptions = {
  /** The shared echo's room. A forest road wants a shade shorter and
   * brighter than open snow; a shore a shade longer. */
  echo?: EchoOptions;
};
declare function createSynth(options?: SynthOptions): Synth;

export { type EchoOptions, type SynthOptions, createSynth };
