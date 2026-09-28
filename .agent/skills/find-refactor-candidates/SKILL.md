---
name: find-refactor-candidates
description: "Use when deciding what to extract from the games (game2, game3, game4) into the framework next. Clones the three games, ranks their files by cross-game similarity, and reports which shared code is worth making generic — and which only LOOKS shared."
---

# Find refactoring candidates

The framework exists so that a bug fixed once is fixed in every game. The
games were built by porting from one another, so the same file lives in two
or three of them and drifts. This skill finds those files and says which are
worth lifting. It does **not** do the extraction — `expand-framework` does.

## Run the report

```sh
npm run candidates                 # clones/refreshes .reference/game{2,3,4}
node .agent/skills/find-refactor-candidates/scripts/similarity.mjs --min 0.3 --no-fetch
```

Each row: the best pair's ratio, the path, and every pair (`23` = game2 ×
game3) with both line counts. `.reference/` is gitignored and read-only.

## Reading it

- **≥ 0.95 in two or three games** — copies. Diff them code-only (strip
  comments) before deciding: the games' comments are full of their own
  vocabulary, and a file that differs only in its comments is ONE module.
- **0.6–0.95** — drifted copies. One side usually carries a FIX the others
  lack (the screenshot roll's prune was one). Take the best version of each
  function; the extraction is how the fix reaches the rest.
- **Below 0.6** — the same IDEA written twice. Only a candidate when the
  shape can be designed generically first (a schema, options, a store) —
  list it in `docs/extraction-roadmap.md`'s Next table with what the design
  needs.

## What is NOT a candidate

- Game DATA: catalogs, tuning tables, a season's declination, rule books.
- Anything whose generic form would need the game's state type
  (`GameState`, `Level`): extract the arithmetic under it instead (the
  standings take a `Standing`, never a `GameState`).
- A UI component (Preact). The framework ships no UI framework; extract the
  DOM-free half (the `thumb-guard` split) and leave the component.
- Files that are identical but belong to a shell with its own toolchain
  (`tauri/`, `native/`) — they are on the roadmap with the packaging they need.

## Output

Update `docs/extraction-roadmap.md`: move what landed into **Landed**, and keep
**Next** ranked with the reason each is not in yet.
