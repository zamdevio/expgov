# Active sprint

**Shipped receipts:** [`../shipped/README.md`](../shipped/README.md)

**Principles:** [`../systems/principles.md`](../systems/principles.md) · **CLI map:** [`../systems/cli.md`](../systems/cli.md)

**Engineering maps:** [`../systems/README.md`](../systems/README.md)

---

## Release gate (do not bump early)

| Ship | When | Contents |
|------|------|----------|
| **v1.1.0** | After Near below is committed | Breaking Unreleased work on `main` (surface split, `run*`, AG*, C3, HELP1, ID1/ID2, D3, `--names-only`) |
| **v1.1.1+** | After v1.1.0 | **Mid** backlog (severity → suggest → fix → issues, …) as additive patches/minors |

**Do not** run `versions:up` / tag a release until Near is committed. Automation is ready ([`../systems/release.md`](../systems/release.md)); the hold is intentional.

### Near (block v1.1.0)

| Slice | Doc | Notes |
|-------|-----|-------|
| **ID1 / ID2** + inventory polish | [`../shipped/inventory-cache.md`](../shipped/inventory-cache.md) | Implemented — commit pending |
| **D3** — `compatBaseline` | [`../shipped/git-commands.md`](../shipped/git-commands.md) | Implemented — commit pending |
| **`--names-only`** | same | Implemented — commit pending |

Shipped Near (on `main`): AG1–AG8 · C3 · HELP1 — [`../shipped/README.md`](../shipped/README.md).

### Mid (after v1.1.0 → target v1.1.1+)

Severity → Suggest → Fix → Issues; then Config / Multibarrel / Source profiles / API chain — see Program backlog below.

UX leftovers + test waves live in [`../systems/cli.md`](../systems/cli.md) (not separate phase files).

---

## Focus now — commit Near WIP, then v1.1.0

**Release:** [`../systems/release.md`](../systems/release.md)

Near code is done (uncommitted). Next: commit, then **v1.1.0**.

| # | Slice | Status | Goal |
|---|-------|--------|------|
| 1 | **D1–D3** — diff / validate compat | **Shipped** (WIP) | fail flags, `--since`, `compatBaseline` |
| 2 | **AG*** · **C3** · **HELP1** · **ID1/ID2** · **`--names-only`** | **Shipped** (WIP) | [`../shipped/`](../shipped/README.md) |

**With v1.1.0:** consumers pin `@expgov/cli@^1.1.0` and set `git.compatBaseline` (nodehunter dogfood uses `file:../expgov` until publish).

**Release automation (shipped, hold until Near committed):** [`../systems/release.md`](../systems/release.md) · root [`CHANGELOG.md`](../../CHANGELOG.md)

---

## Shipped — v1.0.0 / v1.0.1 release

**Receipt:** [`../shipped/release.md`](../shipped/release.md)

| # | Slice | Status |
|---|-------|--------|
| R1–R4 | Dual npm + docs site + tag | **Shipped** (`v1.0.0` → `v1.0.1`) |

---

## Program backlog (ordered)

| # | Slice | Goal | Doc | Band |
|---|-------|------|-----|------|
| — | **v1.1.0 release** | After Near committed | [`../systems/release.md`](../systems/release.md) | Gate |
| 5 | Phase **D** — API chain | Execution introspection | [`../api-chain.md`](../api-chain.md) | Mid (1.1.1+) |
| 8 | **Severity** | Severity model | [`severity.md`](./severity.md) | Mid |
| 9 | **Suggest** | Engine + filters | [`suggest.md`](./suggest.md) | Mid |
| 10 | **Fix** | `fix tags` / `config` | [`fix.md`](./fix.md) | Mid |
| 11 | **Config** | show / export / convert | [`config.md`](./config.md) | Mid |
| 12 | **Issues** | Code registry + doc links | [`issues.md`](./issues.md) | Mid |
| 13 | **Multibarrel** | Multi-entry / workspace | [`multibarrel.md`](./multibarrel.md) | Mid |

---

## Deferred (unscheduled)

| Slice | Why deferred |
|-------|----------------|
| Graph C4 modes | Brainstorm — [`../shipped/graph.md`](../shipped/graph.md) |
| CLI UX leftovers | Tracked in [`../systems/cli.md`](../systems/cli.md) |
| Test expansion waves | Tracked in [`../systems/cli.md`](../systems/cli.md) |
| Auto-fix PR bot | Blocked on [`fix.md`](./fix.md) |
| `fix subpath` / barrel moves | Postponed in [`fix.md`](./fix.md) |
| JSON config | [`config.md`](./config.md) — TS stays primary |
| Remote / shared cache | [`../systems/cache.md`](../systems/cache.md) |
| Source profiles (H-src) | [`sourceProfiles.md`](./sourceProfiles.md) |
| Multibarrel / workspace | [`multibarrel.md`](./multibarrel.md) — MB4 |
| SDK monorepo example (I2) | [`../shipped/examples-sdk.md`](../shipped/examples-sdk.md) |

---

## Guiding rules

- **Config is TypeScript first:** `expgov.config.ts` via jiti.
- **Core purity:** `packages/core` never imports CLI, prompts, or chalk.
- **CLI is thin:** Commander host, banners, help colorization, `init` prompts only.
- **Tier sources:** `@sdkTier` JSDoc + nested config buckets — [`systems/tiers.md`](../systems/tiers.md).
- **Reachable SDK surface:** inventory/validate/graph scope — [`systems/principles.md`](../systems/principles.md).

---

## Where detail lives

| Need | Doc |
|------|-----|
| Release receipt (v1.0.0 / v1.0.1) | [`../shipped/release.md`](../shipped/release.md) |
| What shipped, when | [`../shipped/README.md`](../shipped/README.md) |
| Engineering maps | [`../systems/README.md`](../systems/README.md) |
| Agent onboarding | [`../agents/onboarding.md`](../agents/onboarding.md) |
