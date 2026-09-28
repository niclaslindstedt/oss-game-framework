// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// A COPY CLAIMED BEFORE ITS PICTURE EXISTS — the two ways in and the bounded
// wait, under a stubbed clipboard (Node has none).

import { afterEach, describe, expect, it, vi } from "vitest";

import { copiedWithin, copyWhenReady } from "../src/shots/share-image";

type Written = { items: unknown[] };

function stubClipboard(write: (items: unknown[]) => Promise<void>, ctorThrowsOnPromise = false) {
  const written: Written = { items: [] };
  class Item {
    constructor(data: Record<string, unknown>) {
      if (ctorThrowsOnPromise && Object.values(data).some((v) => v instanceof Promise)) {
        throw new TypeError("promise values not supported");
      }
      Object.assign(this, data);
      written.items.push(data);
    }
    static supports = () => true;
  }
  vi.stubGlobal("ClipboardItem", Item);
  vi.stubGlobal("navigator", { clipboard: { write } });
  return written;
}

const png = () => new Blob(["png"], { type: "image/png" });

afterEach(() => vi.unstubAllGlobals());

describe("copyWhenReady (share-image.ts)", () => {
  it("writes the promise form from the press and settles when the picture arrives", async () => {
    stubClipboard(async (items) => {
      const value = Object.values(items[0] as object)[0];
      await value;
    });
    const copy = copyWhenReady()!;
    copy.ready(png());
    expect(await copy.done).toBe(true);
  });

  it("falls back to the finished blob when the constructor refuses a promise", async () => {
    const written = stubClipboard(async () => {}, true);
    const copy = copyWhenReady()!;
    copy.ready(png());
    expect(await copy.done).toBe(true);
    expect(Object.values(written.items[0] as object)[0]).toBeInstanceOf(Blob);
  });

  it("falls back when the write refuses the promise form, and fails with no picture", async () => {
    let calls = 0;
    stubClipboard(async (items) => {
      calls++;
      if (Object.values(items[0] as object)[0] instanceof Promise) throw new Error("refused");
    });
    const copy = copyWhenReady()!;
    copy.ready(png());
    expect(await copy.done).toBe(true);
    expect(calls).toBe(2);

    const none = copyWhenReady()!;
    none.ready(null);
    expect(await none.done).toBe(false);
  });

  it("answers within the wait even when the clipboard never does", async () => {
    stubClipboard(() => new Promise(() => {}));
    const copy = copyWhenReady()!;
    copy.ready(png());
    expect(await copiedWithin(copy, 10)).toBe(false);
  });
});
