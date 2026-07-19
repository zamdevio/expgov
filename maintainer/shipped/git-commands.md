# Git & commands

Ref resolution, wired governance verbs, and auxiliary commands.

**Timeline 2.0 (B1–B5):** [`timeline.md`](./timeline.md) · **Graph 2.0 (C1–C3):** [`graph.md`](./graph.md).

---

## P0c — git & refs (shipped) · `a78a6fe`

- [x] `resolveSourceRef` — omit = worktree, `HEAD`, tags, short SHAs, explicit commits
- [x] `parseDiffRange` — single ref or `A..B` tag/SHA ranges; default HEAD → worktree
- [x] `listVersionTags` — configurable `git.tagPattern` (default `v*`) for trend
- [x] `listBarrelCommits` + `parseTimelineRange` — `@4w`, `@3m`, ISO dates (`time/ranges.ts`)
- [x] **B1** — timeline git ref ranges — `v1.0.0..HEAD`, single ref → `ref..HEAD`; `listBarrelCommitsByRef` (`495f6ec`)
- [x] **B2** — release markers — `indexVersionTagsByCommit`; dim `── v1.0.0 ──` below tagged commits; JSON `rows[].tags`
- [x] **B3** — per-step metadata — `computeTimelineStepMeta`; JSON `rows[].step`; `-v` shorthand
- [x] **B4** — summary block — `computeTimelineSummary`; human `Summary` section; JSON `data.summary`
- [x] **B5** — series metrics — symbol churn, tier/namespace drift, cache coverage in default Summary (no flag)
- [x] `TimelineWarmer` — per-commit cache warm; report-layer warm log below meta (`timeline/warmer.ts`, `logger/reports/timeline/warm.ts`)
- [x] Git run stats for verbose inventory/timeline

---

## P0d — governance commands (shipped) · `a78a6fe`

| Command | Core entry | Shipped behavior |
|---------|------------|------------------|
| `inventory [ref]` | `runInventory` | Root barrel tiers, categories, subpath rollups; `-v` symbol table |
| `diff [range]` | `runDiff` | Added/removed flats, tier violations, summary deltas |
| `validate` | `runValidate` | tsconfig ↔ npm `exports` parity; unclassified root flats → exit 1 |
| `trend` | `runTrend` | Flat/stable/adv/int per tag; Δ footer between first/last in window |
| `timeline [range]` | `runTimeline` | Barrel git log; ref/time ranges; Summary + step meta (B1–B5) |
| `graph [ref]` | `runGraph` | Namespace-first graph; analytics Summary; JSON `data.analytics` (C1–C2) |
| `help [topic]` | `printCliHelp` | Commander help + Examples / Range formats / Related (`commandHelp.ts`) |

- [x] Per-command `-v/--verbose` where applicable

Command contracts: [`phases/commands.md`](../phases/commands.md).

---

## P4a — `doctor` command (shipped) · 2026-W26

- [x] `runDoctor` — config paths, cache gitignore, tsconfig/npm drift hints
- [x] CLI `doctor` + help/banner; `--json` kind `doctor`
- [x] Exit 0 healthy / 1 when actionable warnings remain

---

## P5 — `suggest` command (shipped) · 2026-W26

- [x] `runSuggest` — collect unclassified flat exports; `formatStableExactSnippet`
- [x] CLI `suggest` + help/banner; `--json` kind `suggest`
- [x] Exit 0 when clean, 1 when names to add (dry-run — no config writes)

---

## P8 — `version` command (shipped) · `e00cdf3`

- [x] `expgov version` — CLI + `@expgov/core` SDK semver lines
- [x] Global `-V` when no subcommand (Commander version flag)
- [x] Build-time defines `__EXPGOV_CLI_VERSION__` / `__EXPGOV_SDK_VERSION__` via tsup
- [x] `--check` / `--reset` for npm registry update hint + cached state

---

## P25 — diff custom-tier guard (shipped) · `8f4273c`

- [x] Diff / insights tolerate incomplete summary tier rollups (missing `custom`) without throwing
- [x] Complements P24 cache validation — old in-memory paths stay safe during upgrade

Release context: [`release.md`](./release.md) (v1.0.1).

---

## D1 — diff fail gate (shipped) · 2026-W29

- [x] `--fail-on-removed` / `--fail-on-tier-violations` on `expgov diff` (opt-in; default still exit `0`)
- [x] `evaluateDiffFailMode` — `format/diffFail.ts`; codes `expgov.diff.exports_removed`, `expgov.diff.tier_violation`
- [x] JSON `ok: false` + `issues[]` when failing; `data.tierViolations` always included
- [x] Tests: `shared/__tests__/diffFail.test.ts`
- [x] Docs: `docs/commands/diff.md`, workflows CI snippet, `docs/cli/json.md`

## D2 — validate --since (shipped) · 2026-W29

- [x] `evaluateValidateSince` — `format/validateSince.ts` (compose `diffSnapshots` + `evaluateDiffFailMode({ failOnRemoved: true })`)
- [x] `runValidate({ since })` — baseline commit → worktree; merge removal issues with current-tree validate
- [x] JSON: `data.since` / `sinceLabel` / `added` / `removed`; issue code `expgov.diff.exports_removed`
- [x] CLI/help un-reserved: `--since <ref>` fail if flats removed since ref
- [x] Tests: `shared/__tests__/validateSince.test.ts`
- [x] Docs: `docs/commands/validate.md`, `diff.md`, `guides/workflows.md` CI recipes, `docs/cli/json.md`

Still open: D3 `compatBaseline` — [`phases/diff.md`](../phases/diff.md).

## AG3 — diff JSON detail (shipped) · 2026-W29

- [x] `buildDiffJsonListDetail` — `format/diffJson.ts`; `addedDetail` / `removedDetail` under `-v`/`-F`
- [x] Shared `-T`/`-F` list policy + `listGuidance`; name arrays `added`/`removed` stay complete
- [x] Tests: `shared/__tests__/diffJson.test.ts`
- [x] Docs: `docs/cli/json.md`, `docs/commands/diff.md`, `systems/cli.md`

## AG5 — shared list filters (shipped) · 2026-W29

- [x] Repeatable `--tier` / `--category` on inventory, diff detail, and graph (before `-T`/`-F`)
- [x] Extended by **C3** with `--namespace` / `--module` / `--subpath` — [`graph.md`](./graph.md)
- [x] Active filters in human meta + JSON `data.filters` (omit empty keys)
- [x] Helpers: `shared/filters.ts`; tests: `shared/__tests__/filters.test.ts`
- [x] Docs: `docs/cli/flags.md`

Deferred (not blocking): `--names-only` compact listing — see [`phases/active-phase.md`](../phases/active-phase.md) Deferred.
