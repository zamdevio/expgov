# Git & commands

Ref resolution, wired governance verbs, and auxiliary commands.

---

## P0c — git & refs (shipped) · `a78a6fe`

- [x] `resolveSourceRef` — omit = worktree, `HEAD`, tags, short SHAs, explicit commits
- [x] `parseDiffRange` — single ref or `A..B` tag/SHA ranges; default HEAD → worktree
- [x] `listVersionTags` — configurable `git.tagPattern` (default `v*`) for trend
- [x] `listBarrelCommits` + `parseTimelineRange` — `@4w`, `@3m`, ISO dates (`time/ranges.ts`)
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
| `timeline [range]` | `runExportsTimeline` | Barrel-only git log; flat count + Δ per commit |
| `graph [ref]` | `runExportsGraph` | Target subpath groups, namespaces, top source modules |
| `help [topic]` | `printHelp` | Sectioned usage (all, per-command, global flags) |

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
