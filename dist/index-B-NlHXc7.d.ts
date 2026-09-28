import {
  EnvelopeStep,
  FilterOptions,
  FilterType,
  Layer,
  LayerSpec,
  LayerTarget,
  MAX_CUTOFF_RATIO,
  MIN_ATTACK_MS,
  NoiseColor,
  NoiseOptions,
  Synth,
  ToneOptions,
  VibratoOptions,
  WaveType,
  envelopeShape,
  safeCutoff,
  shaperPush,
  shaperSteepness,
} from "./audio/voice.js";
import { EchoOptions, SynthOptions, createSynth } from "./audio/synth.js";
import { Rack, createRack } from "./audio/rack.js";
import { DEFAULT_VOLUME, playDef, playSound } from "./audio/play.js";
import { PlayShape, SoundBank, SoundDef, SoundVoice } from "./audio/types.js";
import { clamp01, scaledView } from "./audio/view.js";

declare const index_DEFAULT_VOLUME: typeof DEFAULT_VOLUME;
declare const index_EchoOptions: typeof EchoOptions;
declare const index_EnvelopeStep: typeof EnvelopeStep;
declare const index_FilterOptions: typeof FilterOptions;
declare const index_FilterType: typeof FilterType;
declare const index_Layer: typeof Layer;
declare const index_LayerSpec: typeof LayerSpec;
declare const index_LayerTarget: typeof LayerTarget;
declare const index_MAX_CUTOFF_RATIO: typeof MAX_CUTOFF_RATIO;
declare const index_MIN_ATTACK_MS: typeof MIN_ATTACK_MS;
declare const index_NoiseColor: typeof NoiseColor;
declare const index_NoiseOptions: typeof NoiseOptions;
declare const index_PlayShape: typeof PlayShape;
declare const index_Rack: typeof Rack;
declare const index_SoundBank: typeof SoundBank;
declare const index_SoundDef: typeof SoundDef;
declare const index_SoundVoice: typeof SoundVoice;
declare const index_Synth: typeof Synth;
declare const index_SynthOptions: typeof SynthOptions;
declare const index_ToneOptions: typeof ToneOptions;
declare const index_VibratoOptions: typeof VibratoOptions;
declare const index_WaveType: typeof WaveType;
declare const index_clamp01: typeof clamp01;
declare const index_createRack: typeof createRack;
declare const index_createSynth: typeof createSynth;
declare const index_envelopeShape: typeof envelopeShape;
declare const index_playDef: typeof playDef;
declare const index_playSound: typeof playSound;
declare const index_safeCutoff: typeof safeCutoff;
declare const index_scaledView: typeof scaledView;
declare const index_shaperPush: typeof shaperPush;
declare const index_shaperSteepness: typeof shaperSteepness;
declare namespace index {
  export {
    index_DEFAULT_VOLUME as DEFAULT_VOLUME,
    index_EchoOptions as EchoOptions,
    index_EnvelopeStep as EnvelopeStep,
    index_FilterOptions as FilterOptions,
    index_FilterType as FilterType,
    index_Layer as Layer,
    index_LayerSpec as LayerSpec,
    index_LayerTarget as LayerTarget,
    index_MAX_CUTOFF_RATIO as MAX_CUTOFF_RATIO,
    index_MIN_ATTACK_MS as MIN_ATTACK_MS,
    index_NoiseColor as NoiseColor,
    index_NoiseOptions as NoiseOptions,
    index_PlayShape as PlayShape,
    index_Rack as Rack,
    index_SoundBank as SoundBank,
    index_SoundDef as SoundDef,
    index_SoundVoice as SoundVoice,
    index_Synth as Synth,
    index_SynthOptions as SynthOptions,
    index_ToneOptions as ToneOptions,
    index_VibratoOptions as VibratoOptions,
    index_WaveType as WaveType,
    index_clamp01 as clamp01,
    index_createRack as createRack,
    index_createSynth as createSynth,
    index_envelopeShape as envelopeShape,
    index_playDef as playDef,
    index_playSound as playSound,
    index_safeCutoff as safeCutoff,
    index_scaledView as scaledView,
    index_shaperPush as shaperPush,
    index_shaperSteepness as shaperSteepness,
  };
}

export { index as i };
