// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  {
    // Build output (committed, but generated), dependencies and the cloned
    // reference games are not source.
    ignores: ["dist/**", "node_modules/**", "coverage/**", ".reference/**"],
  },
  js.configs.recommended,
  {
    // Node tooling: the shipped lab shelf, the release plumbing, the bins
    // and the skills' helpers.
    files: ["tooling/**/*.mjs", "bin/**/*.mjs", ".agent/**/*.mjs"],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 2022,
      globals: { ...globals.node },
    },
  },
  {
    files: ["src/**/*.ts", "tests/**/*.ts", "*.config.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: 2022, sourceType: "module" },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      // TypeScript checks for undefined identifiers itself.
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-useless-assignment": "off",
    },
  },
];
