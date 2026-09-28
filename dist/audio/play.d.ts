import { Synth } from "./voice.js";
import { SoundDef, PlayShape, SoundBank } from "./types.js";

/** The synth's own volume defaults, needed only when a shape has to scale a
 * volume the author left off. Kept in step with `synth.ts` — a drift here is a
 * shaped sound at the wrong level, which nothing else would catch, so
 * `tests/audio.test.ts` pins the pair. */
declare const DEFAULT_VOLUME: {
  readonly tone: 0.06;
  readonly noise: 0.05;
};
/** Fire a def we already hold. */
declare function playDef(synth: Synth, def: SoundDef, shape?: PlayShape): void;
/**
 * Fire one sound by id.
 *
 * An unknown id is silent rather than a throw: a sound is presentation, and a
 * missing one should be a quiet moment in the game, never a dropped frame in
 * the middle of a run.
 */
declare function playSound(
  synth: Synth,
  bank: SoundBank,
  id: string | undefined,
  shape?: PlayShape,
): void;

export { DEFAULT_VOLUME, playDef, playSound };
