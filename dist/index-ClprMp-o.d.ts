import {
  TAU,
  angleDiff,
  approach,
  blockOffsets,
  cellKey,
  clamp,
  decay,
  dist2,
  hypot,
  hypot3,
  hypot4,
  lerp,
  smoothstep,
} from "./core/math.js";
import {
  NoiseField,
  hash2,
  noiseField,
  sampleNoise,
  smooth,
  tiledValueNoise,
  valueNoise,
} from "./core/noise.js";
import { Rng, createRng } from "./core/prng.js";
import {
  Heightfield,
  createHeightfield,
  fieldGradient,
  fillField,
  sampleField,
  sampleFieldGradient,
} from "./core/heightfield.js";
import { polylineDistance, segmentDistance } from "./core/polyline.js";
import {
  DatedMoonPlace,
  DatedSunPlace,
  MoonOrbit,
  MoonPlace,
  SOUTH,
  SUNRISE,
  SYNODIC_MONTH,
  SolarCoordinates,
  SunPlace,
  TWILIGHT,
  daylightWindow,
  hourOfElevation,
  hourOfSunOnDate,
  julianDay,
  julianDayOfYear,
  lunarCoordinates,
  moonAt,
  moonOnDate,
  refraction,
  solarCoordinates,
  sunAt,
  sunOnDate,
  sunWindowOnDate,
  universalHourOf,
} from "./core/solar.js";
import { Clock, fixedClock, preciseClock, wallClock } from "./core/clock.js";
import { Q as Quat, V as Vec3, q as quat } from "./quat-D0i_xUbh.js";
import { O as OutputLevel, a as OutputSink, o as output } from "./output-Dl4Td3X2.js";

declare const index_Clock: typeof Clock;
declare const index_DatedMoonPlace: typeof DatedMoonPlace;
declare const index_DatedSunPlace: typeof DatedSunPlace;
declare const index_Heightfield: typeof Heightfield;
declare const index_MoonOrbit: typeof MoonOrbit;
declare const index_MoonPlace: typeof MoonPlace;
declare const index_NoiseField: typeof NoiseField;
declare const index_OutputLevel: typeof OutputLevel;
declare const index_OutputSink: typeof OutputSink;
declare const index_Quat: typeof Quat;
declare const index_Rng: typeof Rng;
declare const index_SOUTH: typeof SOUTH;
declare const index_SUNRISE: typeof SUNRISE;
declare const index_SYNODIC_MONTH: typeof SYNODIC_MONTH;
declare const index_SolarCoordinates: typeof SolarCoordinates;
declare const index_SunPlace: typeof SunPlace;
declare const index_TAU: typeof TAU;
declare const index_TWILIGHT: typeof TWILIGHT;
declare const index_Vec3: typeof Vec3;
declare const index_angleDiff: typeof angleDiff;
declare const index_approach: typeof approach;
declare const index_blockOffsets: typeof blockOffsets;
declare const index_cellKey: typeof cellKey;
declare const index_clamp: typeof clamp;
declare const index_createHeightfield: typeof createHeightfield;
declare const index_createRng: typeof createRng;
declare const index_daylightWindow: typeof daylightWindow;
declare const index_decay: typeof decay;
declare const index_dist2: typeof dist2;
declare const index_fieldGradient: typeof fieldGradient;
declare const index_fillField: typeof fillField;
declare const index_fixedClock: typeof fixedClock;
declare const index_hash2: typeof hash2;
declare const index_hourOfElevation: typeof hourOfElevation;
declare const index_hourOfSunOnDate: typeof hourOfSunOnDate;
declare const index_hypot: typeof hypot;
declare const index_hypot3: typeof hypot3;
declare const index_hypot4: typeof hypot4;
declare const index_julianDay: typeof julianDay;
declare const index_julianDayOfYear: typeof julianDayOfYear;
declare const index_lerp: typeof lerp;
declare const index_lunarCoordinates: typeof lunarCoordinates;
declare const index_moonAt: typeof moonAt;
declare const index_moonOnDate: typeof moonOnDate;
declare const index_noiseField: typeof noiseField;
declare const index_output: typeof output;
declare const index_polylineDistance: typeof polylineDistance;
declare const index_preciseClock: typeof preciseClock;
declare const index_quat: typeof quat;
declare const index_refraction: typeof refraction;
declare const index_sampleField: typeof sampleField;
declare const index_sampleFieldGradient: typeof sampleFieldGradient;
declare const index_sampleNoise: typeof sampleNoise;
declare const index_segmentDistance: typeof segmentDistance;
declare const index_smooth: typeof smooth;
declare const index_smoothstep: typeof smoothstep;
declare const index_solarCoordinates: typeof solarCoordinates;
declare const index_sunAt: typeof sunAt;
declare const index_sunOnDate: typeof sunOnDate;
declare const index_sunWindowOnDate: typeof sunWindowOnDate;
declare const index_tiledValueNoise: typeof tiledValueNoise;
declare const index_universalHourOf: typeof universalHourOf;
declare const index_valueNoise: typeof valueNoise;
declare const index_wallClock: typeof wallClock;
declare namespace index {
  export {
    index_Clock as Clock,
    index_DatedMoonPlace as DatedMoonPlace,
    index_DatedSunPlace as DatedSunPlace,
    index_Heightfield as Heightfield,
    index_MoonOrbit as MoonOrbit,
    index_MoonPlace as MoonPlace,
    index_NoiseField as NoiseField,
    index_OutputLevel as OutputLevel,
    index_OutputSink as OutputSink,
    index_Quat as Quat,
    index_Rng as Rng,
    index_SOUTH as SOUTH,
    index_SUNRISE as SUNRISE,
    index_SYNODIC_MONTH as SYNODIC_MONTH,
    index_SolarCoordinates as SolarCoordinates,
    index_SunPlace as SunPlace,
    index_TAU as TAU,
    index_TWILIGHT as TWILIGHT,
    index_Vec3 as Vec3,
    index_angleDiff as angleDiff,
    index_approach as approach,
    index_blockOffsets as blockOffsets,
    index_cellKey as cellKey,
    index_clamp as clamp,
    index_createHeightfield as createHeightfield,
    index_createRng as createRng,
    index_daylightWindow as daylightWindow,
    index_decay as decay,
    index_dist2 as dist2,
    index_fieldGradient as fieldGradient,
    index_fillField as fillField,
    index_fixedClock as fixedClock,
    index_hash2 as hash2,
    index_hourOfElevation as hourOfElevation,
    index_hourOfSunOnDate as hourOfSunOnDate,
    index_hypot as hypot,
    index_hypot3 as hypot3,
    index_hypot4 as hypot4,
    index_julianDay as julianDay,
    index_julianDayOfYear as julianDayOfYear,
    index_lerp as lerp,
    index_lunarCoordinates as lunarCoordinates,
    index_moonAt as moonAt,
    index_moonOnDate as moonOnDate,
    index_noiseField as noiseField,
    index_output as output,
    index_polylineDistance as polylineDistance,
    index_preciseClock as preciseClock,
    index_quat as quat,
    index_refraction as refraction,
    index_sampleField as sampleField,
    index_sampleFieldGradient as sampleFieldGradient,
    index_sampleNoise as sampleNoise,
    index_segmentDistance as segmentDistance,
    index_smooth as smooth,
    index_smoothstep as smoothstep,
    index_solarCoordinates as solarCoordinates,
    index_sunAt as sunAt,
    index_sunOnDate as sunOnDate,
    index_sunWindowOnDate as sunWindowOnDate,
    index_tiledValueNoise as tiledValueNoise,
    index_universalHourOf as universalHourOf,
    index_valueNoise as valueNoise,
    index_wallClock as wallClock,
  };
}

export { index as i };
