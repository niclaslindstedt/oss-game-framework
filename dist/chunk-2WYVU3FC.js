import { createRack } from "./chunk-UWZGF4WR.js";
import { createSynth } from "./chunk-562Z5BZD.js";
import { scaledView, clamp01 } from "./chunk-EBV33JDL.js";
import { playSound, playDef, DEFAULT_VOLUME } from "./chunk-QVA3B63T.js";
import {
  shaperSteepness,
  shaperPush,
  safeCutoff,
  envelopeShape,
  MIN_ATTACK_MS,
  MAX_CUTOFF_RATIO,
} from "./chunk-4LE636JF.js";
import { __export } from "./chunk-MLKGABMK.js";

// src/audio/index.ts
var audio_exports = {};
__export(audio_exports, {
  DEFAULT_VOLUME: () => DEFAULT_VOLUME,
  MAX_CUTOFF_RATIO: () => MAX_CUTOFF_RATIO,
  MIN_ATTACK_MS: () => MIN_ATTACK_MS,
  clamp01: () => clamp01,
  createRack: () => createRack,
  createSynth: () => createSynth,
  envelopeShape: () => envelopeShape,
  playDef: () => playDef,
  playSound: () => playSound,
  safeCutoff: () => safeCutoff,
  scaledView: () => scaledView,
  shaperPush: () => shaperPush,
  shaperSteepness: () => shaperSteepness,
});

export { audio_exports };
