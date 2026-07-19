# Changelog

All notable changes to **@expgov/cli** and **@expgov/core** are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/). Semver labels follow published tags.

GitHub releases: https://github.com/zamdevio/expgov/releases

---

## [Unreleased]

Breaking and additive work on `main` since **v1.0.1**.

### Breaking

- **Thin stable root** — `@expgov/core` root exports are the stable SDK only (`defineConfig`, `run*`, config/JSON types, `ExportError`). Host/runtime APIs moved to `@expgov/core/internal`; config tooling/init/help formatters to `@expgov/core/advanced`.
- **`runExports*` → `run*`** — `runValidate`, `runInventory`, `runDiff`, `runGraph`, `runTrend`, `runTimeline`, `runSuggest`, `runDoctor`.

### Added

- `diff --fail-on-removed` / `--fail-on-tier-violations` (CI fail gate).
- `validate --since <ref>` (removals ∪ existing validate checks).
- Inventory / graph / diff JSON detail under `-v` / `-F` (`symbols`, `namespaces`, `edges`, `addedDetail` / `removedDetail`) with shared `listGuidance`.
- Shared list filters on `inventory` / `diff` (detail) / `graph`: `--tier`, `--category`, `--namespace`, `--module`, `--subpath` (graph filters view before analytics).
- Active filters appear in human meta and JSON `data.filters` (omit empty keys).
- Inventory `-v` shows short tier provenance beside the tier column (`(exact)` / `(prefix)` / `(tag)` / `(default-prefix)`).
- Help Usage/Examples token hierarchy: bold blue `expgov`, bold cyan command path, dim flags/values/placeholders.
- Insights always `{ lines, …typedFields }` (never `null`); timeline/trend/diff Δ positive = growth toward newer/right/later.
- JSON error envelopes for thrown domain errors and Commander parser errors under `-j`.
- Release automation: `pnpm versions:up|sync|verify`, tag-triggered `.github/workflows/release.yml` (OIDC Trusted Publishing for both packages).

### Changed

- Layout hygiene: types under `types/`, constants under `shared/constants/` (or CLI `constants/`); logic modules import, do not re-export types.

---

## [1.0.1] - 2026-07-09

Patch for **legacy on-disk cache snapshots** that could crash `diff` (and other commands using tier insights) after upgrading from older builds.

### Fixed

- Auto-invalidate cache entries missing required tier rollup fields (`summary.root.custom`); rebuild from git on read.
- Diff/insights tolerate incomplete custom tier maps as a safety net.
- Docs: stale-cache recovery vs `-f` / `--no-cache` ([flags](https://expgov.pages.dev/cli/flags.html#stale-cache-schema)).

### Install

```bash
pnpm add -D @expgov/cli@1.0.1
pnpm add -D @expgov/core@1.0.1
```

---

## [1.0.0] - 2026-07-09

First **stable** release of export-governance for TypeScript SDK barrels.

### Added

- Full CLI: `init`, `inventory`, `diff`, `validate`, `doctor`, `suggest`, `trend`, `timeline`, `graph`, `version`, `help`.
- Dual publish: `@expgov/cli` (binary + `@expgov/cli/core`) and `@expgov/core` (SDK).
- Tier governance — `@sdkTier` + nested `tiers.*` buckets; tsconfig `paths` ↔ npm `exports` parity.
- Per-SHA cache (`.expgov/cache/`) with worktree freshness gate.
- Stable `--json` envelopes; VitePress docs at [expgov.pages.dev](https://expgov.pages.dev); `examples/sdk/`.

### Fixed (since 0.0.1)

- `expgov version --check` queries `@expgov/cli` on npm (not unscoped `expgov`).
- Update hints and `init` scaffold use `@expgov/cli` / `@expgov/cli/core`.

### Contract

- **Stable:** CLI argv, `--json` envelope shape, exit codes.
- **Additive minors OK** for new commands/flags/exports; **major** for breaking CLI/SDK contracts.

---

## [0.0.1] - 2026-07-09

First public release — portable export-governance for TypeScript SDK barrels (read-only by default except `init`).

### Added

- CLI `@expgov/cli@0.0.1` and SDK `@expgov/core@0.0.1` (npm blocks unscoped `expgov` as too similar to `expo`; command name remains `expgov`).
- Commands: `init`, `inventory`, `diff`, `validate`, `doctor`, `suggest`, `trend`, `timeline`, `graph`, `version`, `help`.
- Tier governance, parity checks, per-SHA cache, `--json` envelopes, TypeScript-only `expgov.config.ts`, docs site, example SDK fixture.

---

## Links

- Docs: https://expgov.pages.dev
- npm: [@expgov/cli](https://www.npmjs.com/package/@expgov/cli) · [@expgov/core](https://www.npmjs.com/package/@expgov/core)
- Maintainer release recipe: [`maintainer/systems/release.md`](./maintainer/systems/release.md)
