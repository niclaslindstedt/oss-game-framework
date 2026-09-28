// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
import { readdirSync } from "node:fs";

import { defineConfig } from "tsup";

// Library build. Every module is a subpath (`.../core`) AND every file in it
// is one (`.../core/prng`), so a game's engine can reach exactly the file it
// needs — and so its import test can see, from the specifier alone, that it
// reached nothing with a DOM in it. The file list is globbed rather than
// written out: a new file is a new subpath the moment it lands.
//
// ESM ONLY. The games are all ESM, and a CJS copy beside it is the dual-
// package hazard: `core/output`'s sink is module state, and two copies of it
// are two logs.
const MODULES = ["core", "racing", "audio", "pwa", "display", "shots", "input", "hud", "loop"];

function moduleEntries(dir: string): Record<string, string> {
  return Object.fromEntries(
    readdirSync(`src/${dir}`)
      .filter((f) => /\.ts$/.test(f) && !f.endsWith(".d.ts"))
      .map((f) => [`${dir}/${f.replace(/\.ts$/, "")}`, `src/${dir}/${f}`]),
  );
}

export default defineConfig({
  entry: {
    index: "src/index.ts",
    ...Object.assign({}, ...MODULES.map(moduleEntries)),
  },
  format: ["esm"],
  dts: true,
  sourcemap: false,
  clean: true,
  // Shared code lands in chunks rather than being copied into every entry,
  // so `core/output`'s one log stays one log however many entries import it.
  splitting: true,
  treeshake: true,
  target: "es2022",
});
