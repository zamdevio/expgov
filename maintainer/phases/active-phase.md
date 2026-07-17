# Active sprint

**Shipped receipts:** [`../shipped/README.md`](../shipped/README.md)

**Roadmap:** [`commands.md`](./commands.md) · **Principles:** [`../systems/principles.md`](../systems/principles.md)

**Engineering maps:** [`../systems/README.md`](../systems/README.md)

---

## Focus now — Diff fail gate

**Doc:** [`diff.md`](./diff.md) · **Companion:** [`agentic.md`](./agentic.md)

Ship an opt-in CI removal gate for frozen 1.x export surfaces (nodehunter and similar). Default `diff` stays informational (exit `0`).

| # | Slice | Status | Goal |
|---|-------|--------|------|
| 1 | **D1** — `diff` fail flags | Next | `--fail-on-removed`, `--fail-on-tier-violations`; `ok: false` + `issues[]` when failing |
| 2 | **AG1** — inventory JSON symbols | Next (after D1 or parallel) | `symbols[]` / `namespaces[]` under `-v`/`-F` |
| 3 | **AG2** — graph JSON edges | Next | `edges[]` under `-v`/`-F` |
| 4 | **D2 / AG4** — `validate --since` | After D1 | Shared compare core → baseline vs worktree; fail on removals + existing validate rules |

**Ownership:** D1/D2 live in [`diff.md`](./diff.md). Agentic AG3/AG4 are the same work (JSON/detail integration) — do not implement twice. Optional D3 `compatBaseline` waits until flags are dogfooded.

**After AG4:** bump expgov in nodehunter CI; prefer `validate --since v1.0.0`.

### Parallel small slice

| Slice | Scheduling | Goal |
|-------|------------|------|
| **HELP1** — Help color hierarchy | Independent; first, parallel, or last | Blue `expgov`, cyan command path, dim flags/values in `Usage:` + `Examples:` — [`help.md`](./help.md) |

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
| 1 | **Diff fail gate** | `--fail-on-removed`, implement `validate --since` | [`diff.md`](./diff.md) |
| 2 | **Agentic** | JSON completeness + flexible flags (inventory/graph/diff) | [`agentic.md`](./agentic.md) |
| P | **HELP1** — Help color hierarchy | Independent small slice; may accompany another CLI task | [`help.md`](./help.md) |
| 3 | Phase **C3** — Graph filters | Filtered graph view (shared vocab with AG5) | [`graph-2.md`](./graph-2.md) |
| 4 | Phase **D** — API chain | Execution introspection / tier rule trace | [`../api-chain.md`](../api-chain.md) |
| 5 | Phase **F** — CLI output audit | UX audit receipt; close gaps | [`cli-output-audit.md`](./cli-output-audit.md) |
| 6 | Phase **G** — Long-term observability | Metrics over cached snapshots | [`../systems/observability.md`](../systems/observability.md) |
| 7 | **Severity** | Policy `severity` rule, graded `issues[]` | [`severity.md`](./severity.md) |
| 8 | **Suggest** | Suggestion engine, full fixes, filters | [`suggest.md`](./suggest.md) |
| 9 | **Fix** | `fix tags`, `fix config` | [`fix.md`](./fix.md) |
| 10 | **Config** | `config show` / `export` / `convert` | [`config.md`](./config.md) |
| 11 | **Issues** | `issues/` registry, doc links | [`issues.md`](./issues.md) |
| 12 | **Multibarrel** | Multi-entry API surface, workspace | [`multibarrel.md`](./multibarrel.md) |

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
