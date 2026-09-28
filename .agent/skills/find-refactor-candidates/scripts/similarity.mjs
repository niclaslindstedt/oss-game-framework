#!/usr/bin/env node
// SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
// Rank the games' files by how alike their copies are. Clones (or refreshes)
// game2, game3 and game4 into .reference/ — shallow, read-only — then pairs
// every file that shares a BASENAME in two or more games and scores the pair
// by line-level similarity (2·matches / total lines, the difflib ratio).
//
//   node .agent/skills/find-refactor-candidates/scripts/similarity.mjs [--min 0.5] [--no-fetch]
//
// Prints one row per file, highest first: the best pair's score, the path,
// and every pair's score with both line counts.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const GAMES = ["game2", "game3", "game4"];
const EXT = /\.(ts|tsx|mjs|js|rs|css|yml|sh|py|json)$/;
const args = process.argv.slice(2);
const min = Number(args[args.indexOf("--min") + 1] ?? 0) || 0.5;
const fetch = !args.includes("--no-fetch");
const root = join(process.cwd(), ".reference");
mkdirSync(root, { recursive: true });

for (const game of GAMES) {
  const dir = join(root, game);
  if (!existsSync(dir)) {
    execFileSync("git", ["clone", "--depth", "1", `https://github.com/niclaslindstedt/${game}`, dir], {
      stdio: "inherit",
    });
  } else if (fetch) {
    execFileSync("git", ["-C", dir, "pull", "--ff-only", "--depth", "1"], { stdio: "inherit" });
  }
}

const files = new Map();
for (const game of GAMES) {
  const dir = join(root, game);
  const listed = execFileSync("git", ["-C", dir, "ls-files"], { encoding: "utf8" }).split("\n");
  for (const f of listed) {
    if (!EXT.test(f) || f.includes("package-lock") || f.startsWith(".changes")) continue;
    const key = basename(f);
    if (!files.has(key)) files.set(key, {});
    files.get(key)[game] ??= f;
  }
}

/** The difflib ratio over lines, via the longest common subsequence. */
function ratio(a, b) {
  if (a.length + b.length === 0) return 1;
  if (a.length * b.length > 4_000_000) return -1;
  let prev = new Uint16Array(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    const cur = new Uint16Array(b.length + 1);
    for (let j = 1; j <= b.length; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return (2 * prev[b.length]) / (a.length + b.length);
}

const lines = (game, f) => readFileSync(join(root, game, f), "utf8").split("\n");
const rows = [];
for (const [, byGame] of files) {
  const games = Object.keys(byGame);
  if (games.length < 2) continue;
  const pairs = [];
  for (let i = 0; i < games.length; i++) {
    for (let j = i + 1; j < games.length; j++) {
      const a = lines(games[i], byGame[games[i]]);
      const b = lines(games[j], byGame[games[j]]);
      pairs.push({ tag: games[i].slice(-1) + games[j].slice(-1), s: ratio(a, b), la: a.length, lb: b.length });
    }
  }
  const best = Math.max(...pairs.map((p) => p.s));
  if (best >= min) rows.push({ best, path: Object.values(byGame)[0], pairs });
}
rows.sort((x, y) => y.best - x.best);
for (const r of rows) {
  const pairs = r.pairs.map((p) => `${p.tag}:${p.s.toFixed(2)}(${p.la}/${p.lb})`).join(" ");
  console.log(`${r.best.toFixed(2)} ${r.path} ${pairs}`);
}
