// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
import { defineConfig } from "vitest/config";

// Node, not jsdom: nearly everything here is DOM-free by design, and what is
// not (the synth, the IndexedDB store) is exercised by the games' own labs in
// a real browser. A test that needs a DOM global stubs the few it reads.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
