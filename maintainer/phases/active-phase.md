# Active sprint

**Shipped receipts:** [`../shipped/README.md`](../shipped/README.md)

**Roadmap:** [`commands.md`](./commands.md) · **Principles:** [`../systems/principles.md`](../systems/principles.md)

**Engineering maps:** [`../systems/README.md`](../systems/README.md)

---

## Focus now — Agentic JSON (post-D1)

**Doc:** [`agentic.md`](./agentic.md) · **Diff companion:** [`diff.md`](./diff.md)

D1 (`diff` fail flags) and AG1–AG2 (inventory/graph JSON detail) are shipped. Next: compose `validate --since`.

| # | Slice | Status | Goal |
|---|-------|--------|------|
| 1 | **D1** — `diff` fail flags | **Shipped** | `--fail-on-removed`, `--fail-on-tier-violations`; `ok: false` + `issues[]` when failing |
| 2 | **AG1** — inventory JSON symbols | **Shipped** | `symbols[]` / `namespaces[]` under `-v`/`-F` |
| 3 | **AG2** — graph JSON edges | **Shipped** | `edges[]` under `-v`/`-F` + shared listGuidance |
| 4 | **D2 / AG4** — `validate --since` | **Next** | Baseline vs worktree; fail on removals + existing validate rules |

**Ownership:** D1/D2 live in [`diff.md`](./diff.md). Agentic AG3/AG4 are the same work (JSON/detail integration) — do not implement twice. Optional D3 `compatBaseline` waits until flags are dogfooded.

**After AG4:** bump expgov in nodehunter CI; prefer `validate --since v1.0.0`.

### Parallel / follow-on engine phase

| Slice | Scheduling | Goal |
|-------|------------|------|
| **ID1 / ID2** — Inventory diagnostics | After AG1–AG2 preferred; parallel only if silent barrel misses hurt dogfood | Direct barrel decls + closure modules with no reachable exports — [`inventory-diagnostics.md`](./inventory-diagnostics.md). **ID-DOC** updates systems + `docs/` **after** code |
| **HELP1** — Help color hierarchy | Independent; first, parallel, or last | Blue `expgov`, cyan command path, dim flags/values in `Usage:` + `Examples:` — [`help.md`](./help.md) |
| **REL1–REL3** — Automated releases | Independent; pull REL1 forward before next npm bump | `versions:*` + tag `release.yml` dual publish — [`releases.md`](./releases.md) |

---

## Shipped — v1.0.0 / v1.0.1 release

**Receipt:** [`../shipped/release.md`](../shipped/release.md)

| # | Slice | Status |
|---|-------|--------|
| R1–R4 | Dual npm + docs site + tag | **Shipped** (`v1.0.0` → `v1.0.1`) |

---

## Paused — Phase C (Graph 2.0)

**Doc:** [`graph-2.md`](./graph-2.md) · **Shipped (C1–C2):** [`../shipped/graph.md`](../shipped/graph.md)

Resume **C3** after Diff D1–D2 and Agentic AG1–AG2 (share filter vocabulary with AG5).

| # | Slice | Status |
|---|-------|--------|
| C1–C2 | Namespace-first + analytics | **Shipped** |
| C3 | `--namespace`, `--module`, `--category`, `--subpath` | Paused — align with AG5 |
| C4 | Graph modes | Brainstorm |

---

## Program backlog (ordered)

| # | Slice | Goal | Doc |
|---|-------|------|-----|
| 1 | **Diff fail gate** | D1 shipped; implement `validate --since` (D2) | [`diff.md`](./diff.md) |
| 2 | **Agentic** | JSON completeness + flexible flags (inventory/graph/diff) | [`agentic.md`](./agentic.md) |
| 3 | **Inventory diagnostics** | Reachable-surface honesty (ID1/ID2) + ID-DOC | [`inventory-diagnostics.md`](./inventory-diagnostics.md) |
| P | **HELP1** — Help color hierarchy | Independent small slice; may accompany another CLI task | [`help.md`](./help.md) |
| P | **Releases** — versions + `release.yml` | i18nprune-style dual npm auto-publish | [`releases.md`](./releases.md) |
| 4 | Phase **C3** — Graph filters | Filtered graph view (shared vocab with AG5) | [`graph-2.md`](./graph-2.md) |
| 5 | Phase **D** — API chain | Execution introspection / tier rule trace | [`../api-chain.md`](../api-chain.md) |
| 6 | Phase **F** — CLI output audit | UX audit receipt; close gaps | [`cli-output-audit.md`](./cli-output-audit.md) |
| 7 | Phase **G** — Long-term observability | Metrics over cached snapshots | [`../systems/observability.md`](../systems/observability.md) |
| 8 | **Severity** | Policy `severity` rule, graded `issues[]` | [`severity.md`](./severity.md) |
| 9 | **Suggest** | Suggestion engine, full fixes, filters | [`suggest.md`](./suggest.md) |
| 10 | **Fix** | `fix tags`, `fix config` | [`fix.md`](./fix.md) |
| 11 | **Config** | `config show` / `export` / `convert` | [`config.md`](./config.md) |
| 12 | **Issues** | `issues/` registry, doc links | [`issues.md`](./issues.md) |
| 13 | **Multibarrel** | Multi-entry API surface, workspace | [`multibarrel.md`](./multibarrel.md) |

---

## Deferred (unscheduled)

| Slice | Why deferred |
|-------|----------------|
| Diff D3 `compatBaseline` | After D1/D2 dogfood |
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
