// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// ALIASES FOR PLAIN NODE, for a script that imports an APP module.
//
// A game's app and tests spell its engine `@engine`, which Vite and vitest
// resolve from their configs. Plain Node knows nothing of it, so a tooling
// script that wants a data module out of the app (a campaign's level table,
// a vehicle's paint schemes) dies on that module's first `@engine` import —
// and the alternative, a Vite build of a page just to read a table, is a
// browser and a bundler to look up a seed.
//
// One resolve hook instead: anything asking for an aliased specifier is
// handed its file, on the same thread, before the import that needs it.
// Everything else resolves as Node would. Types in the imported `.ts` files
// are stripped by `--experimental-strip-types`.

import { registerHooks } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/** Route every specifier in `aliases` (`{ "@engine": "<abs path>" }`) at
 * its file for every import that follows. Call it once, before the first
 * dynamic `import()` of an app module. */
export function aliasModules(aliases) {
  const urls = new Map(
    Object.entries(aliases).map(([spec, file]) => [spec, pathToFileURL(file).href]),
  );
  registerHooks({
    resolve(specifier, context, next) {
      const url = urls.get(specifier);
      if (url) return { url, shortCircuit: true };
      return next(specifier, context);
    },
  });
}

/** Route `@engine` at `<root>/engine/index.ts` — the layout every game here
 * shares. The engine itself needs nothing from it. */
export function aliasEngine(root) {
  aliasModules({ "@engine": join(root, "engine", "index.ts") });
}
