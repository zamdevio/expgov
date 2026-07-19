# Active sprint

**Shipped receipts:** [`../shipped/README.md`](../shipped/README.md)

**Roadmap:** [`commands.md`](./commands.md) · **Principles:** [`../systems/principles.md`](../systems/principles.md)

**Engineering maps:** [`../systems/README.md`](../systems/README.md)

---

## Release gate (do not bump early)

| Ship | When | Contents |
|------|------|----------|
| **v1.1.0** | After **all Near** slices below are done | Breaking Unreleased work already on `main` (surface split, `run*`, AG*, C3, HELP1) **plus** remaining Near: ID1/ID2, optional D3 |
| **v1.1.1+** | After v1.1.0 | **Mid** backlog (severity → suggest → fix → issues, …) as additive patches/minors |

**Do not** run `versions:up` / tag a release until the Near list is complete. Automation is ready ([`../systems/release.md`](../systems/release.md)); the hold is intentional.

### Near (block v1.1.0)

| Slice | Doc | Notes |
|-------|-----|-------|
| **ID1 / ID2** — inventory diagnostics | [`inventory-diagnostics.md`](./inventory-diagnostics.md) | **Next** — + ID-DOC after code |
| **D3** — `compatBaseline` | [`diff.md`](./diff.md) | Optional; after `--since` dogfood |

Shipped Near (receipts only): AG1–AG8 · C3 · HELP1 — [`../shipped/README.md`](../shipped/README.md).

### Mid (after v1.1.0 → target v1.1.1+)

Severity → Suggest → Fix → Issues; then Config / Multibarrel / Source profiles / API chain / Observability G / CLI output audit leftovers — see Program backlog below.

---

## Focus now — inventory diagnostics

**Doc:** [`inventory-diagnostics.md`](./inventory-diagnostics.md)

Near remaining: **ID1/ID2**, optional **D3**.

| # | Slice | Status | Goal |
|---|-------|--------|------|
| 1 | **D1** — `diff` fail flags | **Shipped** | `--fail-on-removed`, `--fail-on-tier-violations`; `ok: false` + `issues[]` when failing |
| 2–7 | **AG1–AG8** · **C3** · **HELP1** | **Shipped** | Receipts: [`../shipped/`](../shipped/README.md) (inventory-cache, graph, git-commands, runtime-cli) |

**Ownership:** D1/D2 live in [`diff.md`](./diff.md). Optional D3 `compatBaseline` waits until `--since` is dogfooded.

**After D2 / before or with v1.1.0:** bump expgov in nodehunter CI; prefer `validate --since v1.0.0`.

### Focus

| Slice | Scheduling | Goal |
|-------|------------|------|
| **ID1 / ID2** — Inventory diagnostics | Near; **next** | Direct barrel decls + closure modules with no reachable exports — [`inventory-diagnostics.md`](./inventory-diagnostics.md). **ID-DOC** after code |

**Release automation (shipped, hold until Near done):** [`../systems/release.md`](../systems/release.md) · root [`CHANGELOG.md`](../../CHANGELOG.md)

---

## Shipped — v1.0.0 / v1.0.1 release

**Receipt:** [`../shipped/release.md`](../shipped/release.md)

| # | Slice | Status |
|---|-------|--------|
| R1–R4 | Dual npm + docs site + tag | **Shipped** (`v1.0.0` → `v1.0.1`) |

---

## Paused — Phase C (Graph 2.0)

**Doc:** [`graph-2.md`](./graph-2.md) · **Shipped (C1–C3):** [`../shipped/graph.md`](../shipped/graph.md)

C1–C3 done. **C4** graph modes remain brainstorm-only.

| # | Slice | Status |
|---|-------|--------|
| C1–C2 | Namespace-first + analytics | **Shipped** |
| C3 | `--namespace`, `--module`, `--subpath` (+ tier/category) | **Shipped** |
| C4 | Graph modes | Later / brainstorm |

---

## Program backlog (ordered)

| # | Slice | Goal | Doc | Band |
|---|-------|------|-----|------|
| 1 | **Diff fail gate** | D1–D2 shipped; optional D3 | [`diff.md`](./diff.md) | Near (D3) |
| 3 | **Inventory diagnostics** | ID1/ID2 + ID-DOC — **next** | [`inventory-diagnostics.md`](./inventory-diagnostics.md) | Near |
| — | **v1.1.0 release** | After Near complete | [`../systems/release.md`](../systems/release.md) | Gate |
| 5 | Phase **D** — API chain | Execution introspection | [`../api-chain.md`](../api-chain.md) | Mid (1.1.1+) |
| 6 | Phase **F** — CLI output audit | Close remaining UX gaps | [`cli-output-audit.md`](./cli-output-audit.md) | Mid |
| 7 | Phase **G** — Observability | Metrics over snapshots | [`../systems/observability.md`](../systems/observability.md) | Mid |
| 8 | **Severity** | Graded `issues[]` | [`severity.md`](./severity.md) | Mid |
| 9 | **Suggest** | Engine + filters | [`suggest.md`](./suggest.md) | Mid |
| 10 | **Fix** | `fix tags` / `config` | [`fix.md`](./fix.md) | Mid |
| 11 | **Config** | show / export / convert | [`config.md`](./config.md) | Mid |
| 12 | **Issues** | Code registry + doc links | [`issues.md`](./issues.md) | Mid |
| 13 | **Multibarrel** | Multi-entry / workspace | [`multibarrel.md`](./multibarrel.md) | Mid |

---

## Deferred (unscheduled)

| Slice | Why deferred |
|-------|----------------|
| Diff D3 `compatBaseline` | Near-optional; after D1/D2 dogfood |
| `--names-only` compact listing | Optional AG leftover; not blocking v1.1.0 |
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
- **Reachable SDK surface:** inventory/validate/graph scope — [`systems/principles.md`](../systems/principles.md); diagnostics phase [`inventory-diagnostics.md`](./inventory-diagnostics.md).

---

## Where detail lives

| Need | Doc |
|------|-----|
| Release receipt (v1.0.0 / v1.0.1) | [`../shipped/release.md`](../shipped/release.md) |
| What shipped, when | [`../shipped/README.md`](../shipped/README.md) |
| Timeline (Phase B) | [`../shipped/timeline.md`](../shipped/timeline.md) |
| Graph (Phase C partial) | [`../shipped/graph.md`](../shipped/graph.md) |
| Command contracts | [`commands.md`](./commands.md) |
| Tiers, cache, CLI, config | [`../systems/`](../systems/README.md) |
| Agent layout + import rules | [`agents/architecture.md`](../agents/architecture.md) |
