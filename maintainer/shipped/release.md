# Release — v1.0.0 / v1.0.1

Stable dual npm publish + docs site. **No active phase doc** — check here before re-implementing. Phase plan removed after ship (`phases/release.md` → this receipt).

**Active sprint:** [`../phases/active-phase.md`](../phases/active-phase.md)

---

## Publish model

| Package | npm name | Built from | Notes |
|---------|----------|------------|-------|
| Root | `@expgov/cli` | `tsup` → `dist/cli.js` + `dist/core.js` | Self-contained CLI; no runtime dep on `@expgov/core` |
| `packages/core` | `@expgov/core` | `tsc` → `packages/core/dist/` | Standalone SDK for programmatic imports |

Both packages expose config types. CLI consumers: `import from '@expgov/cli/core'`. SDK consumers: `import from '@expgov/core'` (stable). Host/runtime APIs: `@expgov/core/internal`. Config tooling/init: `@expgov/core/advanced`.

npm rejected unscoped **`expgov`** (too similar to `expo`). Binary name stays `expgov`.

---

## R1–R4 — v1.0.0 (shipped) · `3eeb5cf` · 2026-W28

| Slice | Outcome |
|-------|---------|
| **R1** — Publish metadata | LICENSE, READMEs, `publishConfig`, `prepack`, dual packages, `EXPGOV_PUBLISH` sourcemap omit |
| **R2** — Docs site | VitePress `apps/docs/`, `pnpm docs:sync`, Cloudflare Pages → [expgov.pages.dev](https://expgov.pages.dev) |
| **R3** — Docs audit | Public `docs/` IA + branded theme; maintainer dual-publish notes |
| **R4** — Tag & publish | GitHub [v1.0.0](https://github.com/zamdevio/expgov/releases/tag/v1.0.0); npm `@expgov/cli@1.0.0` + `@expgov/core@1.0.0` |

**Git tag:** `v1.0.0` · **Commit:** `3eeb5cf`

---

## v1.0.1 patch (shipped) · `53dd15c` · 2026-W28

| Change | Commit | Notes |
|--------|--------|-------|
| Reject legacy snapshot schema; auto-rebuild on read | `4c8ea8e` | Missing `summary.root.custom` etc. → delete + rebuild ([`systems/cache.md`](../systems/cache.md)) |
| Guard custom tier rollups on incomplete summaries | `8f4273c` | Diff/insights path |
| Document stale cache recovery + `--force` | `8b83ff9` | `docs/cli/flags.md` |
| Bump both packages to `1.0.1` | `53dd15c` | [GitHub release](https://github.com/zamdevio/expgov/releases/tag/v1.0.1) |

**Git tag:** `v1.0.1` · **Latest npm:** `@expgov/cli@1.0.1` · `@expgov/core@1.0.1`

---

## Automation (shipped) — REL1–REL3

| Piece | Location |
|-------|----------|
| Version sync | `scripts/release/sync.ts` · `pnpm versions:up\|sync\|verify` |
| CI gate | `ci.yml` → `versions:verify` |
| Tag publish | `.github/workflows/release.yml` on `v*` → OIDC dual publish |
| Maintainer map | [`../systems/release.md`](../systems/release.md) |

Trusted Publishing is configured on npm for **both** `@expgov/cli` and `@expgov/core`.

---

## Next ship — v1.1.0 (planned)

Breaking SDK surface in a **minor** (early post-1.0 choice — document clearly in the GitHub/npm release notes):

| Change | Notes |
|--------|-------|
| Thin stable root + `./advanced` / `./internal` | Already on `main` (SF1) |
| `run*` command entrypoints | Planned with 1.1.0 |
| Release via `versions:up -- 1.1.0` + tag `v1.1.0` | Triggers `release.yml` |

Recipe: [`../systems/release.md`](../systems/release.md).

---

## v1 contract

CLI argv, `--json` envelope, and exit codes are **semver-stable**. `@expgov/core` may grow additively in minor releases; breaking SDK or CLI contract changes require a major bump.

**SF1 surface split (post-v1.0.1):** root `@expgov/core` is now a thin stable set (`defineConfig`, `run*` command APIs, config/JSON types). Symbols moved to `@expgov/core/advanced` / `@expgov/core/internal` are a **breaking import-path change** for anyone who imported them from the root — bump major on next publish.

---

## Out of scope at v1.0.0 (still backlog)

C3 graph filters · Diff fail gate · Agentic JSON · Severity / Suggest / Fix · Config JSON · Multibarrel · API chain · Observability G

**Planned automation:** [`../phases/releases.md`](../phases/releases.md) — `versions:*` + tag-triggered `release.yml` (i18nprune-style dual publish).