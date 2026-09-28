import { LayerTarget, Synth, LayerSpec } from "./voice.js";

type Rack<K extends string> = {
  /** Steer every layer toward its target, building any that are missing. */
  apply: (targets: Record<K, LayerTarget>) => void;
  /** Tear every layer down; the next `apply` rebuilds them. */
  stop: () => void;
  /** How many layers are currently built and alive — for the tests. */
  live: () => number;
};
declare function createRack<K extends string>(
  synth: Synth,
  specs: Record<K, LayerSpec>,
  glide: Record<K, number>,
): Rack<K>;

export { type Rack, createRack };
