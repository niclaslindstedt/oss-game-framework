import { createRng } from "./chunk-4YEM43VC.js";
import { quat_exports } from "./chunk-MTAQVW7B.js";
import {
  sunAt,
  moonAt,
  hourOfElevation,
  daylightWindow,
  SYNODIC_MONTH,
  SOUTH,
} from "./chunk-X2VPYVVM.js";
import { wallClock, preciseClock, fixedClock } from "./chunk-T6PMHUW4.js";
import {
  sampleFieldGradient,
  sampleField,
  fillField,
  fieldGradient,
  createHeightfield,
} from "./chunk-MUIKSEYE.js";
import {
  valueNoise,
  tiledValueNoise,
  smooth,
  sampleNoise,
  noiseField,
  hash2,
} from "./chunk-2SHOGJN4.js";
import { output_exports } from "./chunk-2RVPOFHC.js";
import { segmentDistance, polylineDistance } from "./chunk-4L2JBKTU.js";
import {
  smoothstep,
  lerp,
  hypot4,
  hypot3,
  hypot,
  dist2,
  decay,
  clamp,
  cellKey,
  blockOffsets,
  approach,
  angleDiff,
  TAU,
} from "./chunk-JRRRZ4XY.js";
import { __export } from "./chunk-MLKGABMK.js";

// src/core/index.ts
var core_exports = {};
__export(core_exports, {
  SOUTH: () => SOUTH,
  SYNODIC_MONTH: () => SYNODIC_MONTH,
  TAU: () => TAU,
  angleDiff: () => angleDiff,
  approach: () => approach,
  blockOffsets: () => blockOffsets,
  cellKey: () => cellKey,
  clamp: () => clamp,
  createHeightfield: () => createHeightfield,
  createRng: () => createRng,
  daylightWindow: () => daylightWindow,
  decay: () => decay,
  dist2: () => dist2,
  fieldGradient: () => fieldGradient,
  fillField: () => fillField,
  fixedClock: () => fixedClock,
  hash2: () => hash2,
  hourOfElevation: () => hourOfElevation,
  hypot: () => hypot,
  hypot3: () => hypot3,
  hypot4: () => hypot4,
  lerp: () => lerp,
  moonAt: () => moonAt,
  noiseField: () => noiseField,
  output: () => output_exports,
  polylineDistance: () => polylineDistance,
  preciseClock: () => preciseClock,
  quat: () => quat_exports,
  sampleField: () => sampleField,
  sampleFieldGradient: () => sampleFieldGradient,
  sampleNoise: () => sampleNoise,
  segmentDistance: () => segmentDistance,
  smooth: () => smooth,
  smoothstep: () => smoothstep,
  sunAt: () => sunAt,
  tiledValueNoise: () => tiledValueNoise,
  valueNoise: () => valueNoise,
  wallClock: () => wallClock,
});

export { core_exports };
