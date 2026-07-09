# Tooling & docs

Maintainer hub, user docs, CI, and project hygiene.

---

## P2 — maintainer hub (shipped) · `daa4615`

- [x] `maintainer/README.md` — entrypoint index
- [x] `maintainer/phases/` — active sprint + command roadmap + observability plans
- [x] `maintainer/shipped/` — closed work receipts (this tree)
- [x] `maintainer/agents/` — architecture, rules, onboarding
- [x] `maintainer/systems/` — tiers, exports, config, cli, cache
- [x] `.cursor/rules/expgov.mdc` — agent source-of-truth (build gate, core purity, tier schema)
- [x] `maintainer/temp/` scratch (gitignored)

---

## P3 — user docs (shipped) · 2026-W26

- [x] `docs/install.md`, `docs/config.md`, `docs/governance.md`
- [x] `docs/guides/workflows.md` — practical recipes
- [x] `docs/cli/` — overview, global flags, JSON envelope
- [x] `docs/commands/` — per-verb reference pages
- [x] `docs/sdk/README.md` — `@expgov/core` install and host contract

---

## P3a — CI gate (shipped) · 2026-W26

- [x] GitHub Actions: `pnpm install`, `build`, `typecheck`, `expgov validate` on PRs
- [x] Triggers on `push` to `main` and `pull_request`
- Superseded by **P12** / **P19** — `.github/workflows/ci.yml` (+ `architecture.yml`)

---

## P12 — cache config + CI hygiene (shipped) · `55eab70`

- [x] `cache: true | false | { enabled?, dir? }` — config-level disable (`disabled` cache status)
- [x] `resolveCacheOptions` — merges CLI flags with `cache.enabled`
- [x] Domain types under `packages/core/src/types/`; constants under `shared/constants/`
- [x] `ci.yml` — typecheck, test, build, madge:circular, `expgov validate`
- [x] `architecture.yml` — advisory knip + madge orphans/leaves
- [x] Root `knip.json`, `vitest.config.ts`, `scripts/madge/run.mjs`
- [x] `printCliHelp` scaffolding (A5 precursor)
- [x] Workspace CLI package name `expgov` (private sources); npm publish root `@expgov/cli`

---

## P19 — CI job split (shipped) · `7698189`

- [x] `ci.yml` — parallel `typecheck` and `test` jobs; `build` → madge → dogfood `validate`
- [x] Typecheck job: `core:typecheck` → `core:build` (declarations) → `cli:typecheck`
- [x] `architecture.yml` — advisory knip + madge orphans/leaves (unchanged role)

---

## Phase I — SDK example CI (shipped) · `b8ccbdb`

- [x] `ci.yml` — `node dist/cli.js -C examples/sdk validate` after dogfood validate
- [x] Receipt: [`examples-sdk.md`](./examples-sdk.md)

---

## R0 — First release prep (in progress) · 2026-W27

- [x] Dual npm publish model — `@expgov/cli` + `@expgov/core` (unscoped `expgov` blocked by npm; see `docs/install.md`)
- [x] `LICENSE`, root `README.md`, `packages/core/README.md`
- [x] `publishConfig`, `prepack`, `EXPGOV_PUBLISH` sourcemap omit
- [x] `apps/docs/` VitePress + branded theme + `expgov.svg` logo
- [x] `docs/sdk/README.md` — SDK install and host contract
- [x] `maintainer/phases/release.md` — v1.0.0 checklist
- [ ] npm publish `@expgov/cli@1.0.0` + `@expgov/core@1.0.0`; git tag `v1.0.0`; Cloudflare Pages deploy
