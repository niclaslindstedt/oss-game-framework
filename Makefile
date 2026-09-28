# Standard developer entry points. CI invokes these exact targets so local
# and CI environments stay in sync.

.PHONY: build test lint fmt fmt-check check-dist clean bump changelog check-changeset candidates

build: ## Build dist/ (ESM + d.ts) — COMMITTED, see AGENTS.md
	npm run build

test: ## Run the full test suite
	npm test

lint: ## Lint with zero-warning policy + typecheck
	npm run lint

fmt: ## Format the codebase in place
	npm run fmt

fmt-check: ## Verify formatting without modifying files
	npm run fmt:check

check-dist: build ## Fail when the committed dist/ is not what src/ builds to
	@git diff --exit-code --stat -- dist || { echo "dist/ is stale — run 'make build' and commit it"; exit 1; }
	@test -z "$$(git ls-files --others --exclude-standard dist)" || { echo "dist/ has uncommitted files — run 'make build' and commit them"; exit 1; }

clean: ## Remove build artifacts
	rm -rf dist

bump: ## Print the semver bump the unreleased changeset fragments imply
	@node tooling/release/compute-bump.mjs

changelog: ## Collate .changes/unreleased/ fragments into CHANGELOG.md (VERSION=X.Y.Z)
	node tooling/release/collate-changelog.mjs $(VERSION)

check-changeset: ## Verify the branch added a changelog fragment (BASE_SHA=<sha>)
	node tooling/release/check-changeset.mjs

candidates: ## Rank shared code across the sibling games (clones them into .reference/)
	npm run candidates
