// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// THE LAB SHELF — the Node half the games' `scripts/` import. Smoke-tested
// here because a broken flag parser is a lab that reports a confident wrong
// number, and a broken encoder is a picture nobody can open.

import { describe, expect, it } from "vitest";

import { parseArgs, pickList } from "../tooling/cli.mjs";
import { createDrawing } from "../tooling/draw.mjs";
import { encodePng } from "../tooling/png.mjs";

describe("the flag parser (cli.mjs)", () => {
  it("reads both spellings, a list and a boolean, and keeps positionals", () => {
    const spec = {
      seed: { kind: "number", default: 1, help: "seed" },
      views: { kind: "list", default: [], help: "views" },
      all: { kind: "flag", default: false, help: "all" },
    };
    const args = parseArgs(["--seed", "38", "--views=spawn,far", "--all", "tree"], spec, "usage");
    expect(args).toEqual({ _: ["tree"], seed: 38, views: ["spawn", "far"], all: true });
  });

  it("picks from a catalog", () => {
    expect(pickList(undefined, ["a", "b"])).toEqual(["a", "b"]);
    expect(pickList("b", ["a", "b"])).toEqual(["b"]);
  });
});

describe("the raster (png.mjs, draw.mjs)", () => {
  it("writes a PNG signature and draws without throwing", () => {
    const png = encodePng(2, 2, Buffer.alloc(12));
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const d = createDrawing(32, 16);
    expect(d.toPng().length).toBeGreaterThan(8);
  });
});
