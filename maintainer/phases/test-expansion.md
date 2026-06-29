# Test expansion plan

**Status:** Planning — unit tests shipped across listing, cache, tiers, insights; expand by subsystem.

---

## Shipped

| Area | Test file | What it locks |
|------|-----------|---------------|
| Listing contract | `shared/__tests__/listing.test.ts` | `resolveListLimit`, `limitList`, truncation hint |
| Insights (Phase E) | `shared/__tests__/insights.test.ts` | inventory, validate, diff, trend insight shapes |
| Worktree cache gate | `shared/__tests__/worktreeSnapshot.test.ts`, `worktreeTrack.test.ts` | `files.json` epoch, barrel + re-export closure |
| Cache mode | `shared/__tests__/cacheMode.test.ts`, `resolveCache.test.ts` | hit/miss/bypass, `cache.enabled` |
| Tier classifier | `shared/__tests__/tiers.test.ts` | tag vs config precedence, provenance |
| Subpath key | `shared/__tests__/context.test.ts` | `npmSubpathKey` strips `./` prefix |
| Init template | `shared/__tests__/initTemplate.test.ts` | conservative default buckets |

**Runner:** vitest (`pnpm test` at repo root). **CI:** `ci.yml` runs typecheck + test + build + validate.

---

## Goals

1. Lock **user-facing contracts** (listing limits, JSON envelope, tier classifier, prefix compiler).
2. Cover **pure core** without git subprocess or full barrel fixtures first.
3. Add **thin CLI smoke** only where argv/preprocess or Commander wiring is non-trivial.
4. Keep tests **fast** (< 5s total on CI) until fixture-based integration slice lands.

---

## Wave 1 — Pure units (next PRs)

| Area | Path | What to assert |
|------|------|----------------|
| **Prefix compiler** | `config/tiers.ts` | `compilePrefixMatcher`: literal, `/regex/`, metachar auto-regex; `matchesTierBucket` |
| **Category heuristics** | `inventory/categories.ts` | `runX`, `createFooContext`, type vs flat |
| **Tier counts** | `inventory/tierCounts.ts` | `sumSdkTierCounts` merges `custom`; footer fields |
| **Re-export chain** | `inventory/reexport-chain.ts` | single-hop and multi-hop `@sdkTier` resolution (fixture strings) |
| **Timeline range** | `time/ranges.ts` | `@4w`, ISO week, date range parse |
| **Diff engine** | `format/diff.ts` | added/removed flats; tier violation notes (mock context) |

**Pattern:** `packages/core/src/<area>/__tests__/*.test.ts` colocated with source (nodehunter style).

---

## Wave 2 — Snapshot / parse fixtures

| Area | Fixtures | Notes |
|------|----------|-------|
| **Barrel parse** | `inventory/parse-barrel.ts` | Small TS strings inline — flat, namespace, re-export |
| **Inventory build** | `inventory/build.ts` | Minimal fake barrel + reader; no git |
| **Suggest snippet** | `commands/suggest.ts` | Unclassified list → `tiers.stable.exact` snippet shape |

Use `tests/fixtures/barrels/` only when strings get large; keep Wave 1 inline.

---

## Wave 3 — CLI host

| Area | Path | What to assert |
|------|------|----------------|
| **Argv preprocess** | `packages/cli/src/argv/` | Global flags, `-T`/`--top`, `--no-cache` aliases |
| **Help delegate** | `packages/cli/src/utils/help/printCliHelp.ts` | Smoke: does not throw; optional snapshot of stdout |
| **List flags** | `packages/cli/src/utils/cli/listFlags.ts` | Commander option registration |

Avoid e2e subprocess CLI in Wave 3 unless necessary — prefer importing built program pieces.

---

## Wave 4 — Integration (optional, slower)

- Temp git repo fixture for `listBarrelCommits`, `resolveSourceRef` (mark `@git` or `describe.skip` in CI without git).
- Cache round-trip: write/read `inventory.full.json` under tmp dir.
- **Dogfood** `expgov validate` already runs in CI — do not duplicate unless regression-specific.

---

## Conventions

- **Runner:** vitest (`pnpm test` at repo root).
- **Layout:** `**/__tests__/**/*.test.ts` next to implementation.
- **No** `console.*` assertions in core command paths — test return values / thrown `ExportError`.
- **Coverage target (informal):** Wave 1+2 should cover tier + inventory + listing contracts before v1.

---

## Execution order

1. Wave 1: `config/tiers` prefix compiler (highest governance risk after tiers.test).
2. Wave 1: `categories` + `tierCounts` (quick wins).
3. Wave 2: `parse-barrel` fixtures.
4. Wave 3: CLI argv smoke.
5. Wave 4: only if git/cache flakes are controlled.

---

## CI wiring

| Gate | Workflow | Blocking |
|------|----------|----------|
| typecheck + test + build + madge:circular + validate | `.github/workflows/ci.yml` | yes |
| knip + madge orphans/leaves | `.github/workflows/architecture.yml` | no (advisory) |
