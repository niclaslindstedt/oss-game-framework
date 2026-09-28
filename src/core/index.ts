// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// The deterministic, DOM-free, dependency-free pool a game's ENGINE may import:
// the seeded PRNG, the math, value noise, heightfields, polylines, the sun and
// the moon, the clock. `quat` and `output` are namespaces (`quat.rotate`,
// `output.warn`) because their names are short and common.

export * from "./math";
export * from "./noise";
export * from "./prng";
export * from "./heightfield";
export * from "./polyline";
export * from "./solar";
export * from "./clock";
export * as quat from "./quat";
export type { Quat, Vec3 } from "./quat";
export * as output from "./output";
export type { OutputLevel, OutputSink } from "./output";
