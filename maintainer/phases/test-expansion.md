# Test expansion plan

**Status:** Planning — slice tests shipped (`shared/listing`); expand by subsystem.

**Companion:** [`active-phase.md`](./active-phase.md) · [`../systems/README.md`](../systems/README.md)

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
| **Tier classifier** | `inventory/tiers.ts` | tag vs config precedence; exact/prefix/default-prefix provenance labels |
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

1. Wave 1: `config/tiers` + `inventory/tiers` (highest governance risk).
2. Wave 1: `tierCounts` + `categories` (quick wins).
3. Wave 2: `parse-barrel` fixtures.
4. Wave 3: CLI argv when A5 help work stabilizes.
5. Wave 4: only if git/cache flakes are controlled.

---

## CI wiring

| Gate | Workflow | Blocking |
|------|----------|----------|
| typecheck + test + build + madge:circular + validate | `.github/workflows/ci.yml` | yes |
| knip + madge orphans/leaves | `.github/workflows/architecture.yml` | no (advisory) |

Add `pnpm test` to PR checklist in [`../agents/onboarding.md`](../agents/onboarding.md) when Wave 1 lands.
