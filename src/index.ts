// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// The root barrel. Import a module (`@niclaslindstedt/oss-game-framework/core`)
// or a single file (`.../core/prng`) instead where you can: a game's ENGINE
// must only ever reach `core/*` and `racing/*`, which import nothing from a
// browser, and a narrower import says so at the call site.
export * as core from "./core";
export * as racing from "./racing";
export * as audio from "./audio";
export * as pwa from "./pwa";
export * as display from "./display";
export * as shots from "./shots";
export * as input from "./input";
export * as hud from "./hud";
export * as loop from "./loop";
