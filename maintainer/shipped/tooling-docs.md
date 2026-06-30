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

- [x] `docs/README.md` — index + quick start
- [x] `docs/install.md` — requirements, init, local dev, cache
- [x] `docs/config.md` — `expgov.config.ts` fields, tiers, policies, `@sdkTier`
- [x] `docs/commands.md` — all wired verbs + global flags
- [x] `docs/json.md` — `--json` contract, `kind` values, CI examples

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
- [x] Workspace CLI package name `expgov` (publish root binary)

---

## P19 — CI job split (shipped) · `7698189`

- [x] `ci.yml` — parallel `typecheck` and `test` jobs; `build` → madge → dogfood `validate`
- [x] Typecheck job: `core:typecheck` → `core:build` (declarations) → `cli:typecheck`
- [x] `architecture.yml` — advisory knip + madge orphans/leaves (unchanged role)
