# Active sprint

**Shipped receipts:** [`../shipped/README.md`](../shipped/README.md)

**Roadmap:** [`commands.md`](./commands.md) · **Principles:** [`../systems/principles.md`](../systems/principles.md)

**Engineering maps:** [`../systems/README.md`](../systems/README.md)

---

## Focus now — Phase C (Graph 2.0)

**Doc:** [`graph-2.md`](./graph-2.md) · **Command:** `packages/core/src/commands/graph.ts`

Timeline 2.0 shipped — [`../shipped/timeline.md`](../shipped/timeline.md).

| # | Slice | Status | Goal |
|---|-------|--------|------|
| 1 | **C2** — Graph analytics | **Shipped** | `graph/analytics.ts`; Summary block; JSON `data.analytics` |
| 2 | **C1** — Namespace-first view | **Shipped** | Namespaces first, sorted by edge count; composition lines |
| **→ 3** | **C3** — Graph filters | **Next PR** | `--namespace`, `--module`, `--category`, `--subpath` |
| 4 | **C4** — Graph modes | Brainstorm | `--view`, JSON graph export, Mermaid (deferred) |

**C2 exit (shipped):**

- [x] `computeGraphAnalytics` + `namespaceComposition` in `graph/analytics.ts`
- [x] Human Summary block; JSON `data.analytics`
- [x] Tests: `graphAnalytics.test.ts`

**C1 exit (shipped):**

- [x] Namespaces section first (sorted by edge count)
- [x] Per-namespace composition line (tier + category mix)
- [x] Meta includes `namespaces` count

Check [`../shipped/README.md`](../shipped/README.md) before re-implementing graph layout or insights.

---

## Program backlog (after Phase C)

| # | Slice | Goal | Doc |
|---|-------|------|-----|
| 1 | Phase **D** — API chain | Execution introspection / tier rule trace | [`../api-chain.md`](../api-chain.md) |
| 2 | Phase **F** — CLI output audit | UX audit receipt; close gaps | [`cli-output-audit.md`](./cli-output-audit.md) |
| 3 | Phase **G** — Long-term observability | Metrics over cached snapshots | [`../systems/observability.md`](../systems/observability.md) |
| 4 | **Severity** | Policy `severity` rule, graded `issues[]` | [`severity.md`](./severity.md) |
| 5 | **Suggest** | Suggestion engine, full fixes, filters | [`suggest.md`](./suggest.md) |
| 6 | **Fix** | `fix tags`, `fix config` | [`fix.md`](./fix.md) |
| 7 | **Config** | `config show` / `export` / `convert` | [`config.md`](./config.md) |
| 8 | **Issues** | `issues/` registry, doc links | [`issues.md`](./issues.md) |
| 9 | **Multibarrel** | Multi-entry API surface, workspace | [`multibarrel.md`](./multibarrel.md) |

**One slice per PR** — finish C3 before starting D.

---

## Deferred (unscheduled)

| Slice | Why deferred |
|-------|----------------|
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
| What shipped, when | [`../shipped/README.md`](../shipped/README.md) |
| Timeline (Phase B) | [`../shipped/timeline.md`](../shipped/timeline.md) |
| Command contracts | [`commands.md`](./commands.md) |
| Tiers, cache, CLI, config | [`../systems/`](../systems/README.md) |
| Agent layout + import rules | [`agents/architecture.md`](../agents/architecture.md) |
