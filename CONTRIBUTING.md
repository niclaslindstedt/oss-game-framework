# Contributing

Thanks for helping build the OSS Game Framework. This document is the contract
between the project and contributors (OSS_SPEC §4).

## Prerequisites

- Node.js 22+ (see `.nvmrc`)
- npm 10+

## Getting the source

```bash
git clone https://github.com/niclaslindstedt/oss-game-framework.git
cd oss-game-framework
npm install
```

## Build, test, lint

Use the Makefile targets — CI runs the same ones:

```bash
make build       # rebuild dist/ (committed — commit it with the change)
make test        # run the Vitest suite
make lint        # eslint + tsc --noEmit (zero warnings)
make fmt         # format in place
make fmt-check   # verify formatting
make check-dist  # fail if the committed dist/ is stale
```

## Development workflow

1. Branch: `feat/<slug>` or `fix/<slug>`.
2. Make your change with a test alongside it, then `make build` and commit
   `dist/` with it.
3. Run `make lint && make test` before pushing.
4. Add a `.changes/unreleased/` fragment for anything a game would notice.
5. Open a PR; its title must be a valid conventional-commit subject.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/) (OSS_SPEC §8.1):

```
feat(racing): add a lap-split board
fix(shots): prune from the stored keys, not the roll in hand
```

Allowed types: `feat`, `fix`, `perf`, `docs`, `test`, `refactor`, `chore`.

## Testing expectations

- Tests live in `tests/`, named `<module>.test.ts` (OSS_SPEC §20).
- New behavior ships with a test. Bug fixes ship with a regression test.
- Anything under `core/` or `racing/` that a game's determinism digest can see
  is held to BITS, not to closeness: a change that moves a single last bit is
  a breaking change for every game (see AGENTS.md).
- Source files stay under 1000 physical lines (OSS_SPEC §20.5).

## Pull request process

PRs are squash-merged after review. The squash commit is the PR title, so keep
it a clean conventional-commit subject.

## Code of conduct & security

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). Report
vulnerabilities via the process in [SECURITY.md](SECURITY.md), not public
issues.
