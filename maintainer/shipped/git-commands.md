# Git & commands

Ref resolution, wired governance verbs, and auxiliary commands.

**Timeline 2.0 (B1–B5):** [`timeline.md`](./timeline.md) · **Graph 2.0 (C1–C2):** [`graph.md`](./graph.md) · active plan: [`phases/graph-2.md`](../phases/graph-2.md).

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
| `inventory [ref]` | `runExportsInventory` | Root barrel tiers, categories, subpath rollups; `-v` symbol table |
| `diff [range]` | `runExportsDiff` | Added/removed flats, tier violations, summary deltas |
| `validate` | `runExportsValidate` | tsconfig ↔ npm `exports` parity; unclassified root flats → exit 1 |
| `trend` | `runExportsTrend` | Flat/stable/adv/int per tag; Δ footer between first/last in window |
| `timeline [range]` | `runExportsTimeline` | Barrel git log; ref/time ranges; Summary + step meta (B1–B5) |
| `graph [ref]` | `runExportsGraph` | Namespace-first graph; analytics Summary; JSON `data.analytics` (C1–C2) |
| `help [topic]` | `printCliHelp` | Commander help + Examples / Range formats / Related (`commandHelp.ts`) |

- [x] Per-command `-v/--verbose` where applicable

Command contracts: [`phases/commands.md`](../phases/commands.md).

---

## P4a — `doctor` command (shipped) · 2026-W26

- [x] `runExportsDoctor` — config paths, cache gitignore, tsconfig/npm drift hints
- [x] CLI `doctor` + help/banner; `--json` kind `doctor`
- [x] Exit 0 healthy / 1 when actionable warnings remain

---

## P5 — `suggest` command (shipped) · 2026-W26

- [x] `runExportsSuggest` — collect unclassified flat exports; `formatStableExactSnippet`
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
