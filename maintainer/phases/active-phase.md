# Active sprint

**Shipped receipts:** [`../shipped/README.md`](../shipped/README.md)

**Roadmap:** [`commands.md`](./commands.md) · **Principles:** [`../systems/principles.md`](../systems/principles.md)

**Engineering maps:** [`../systems/README.md`](../systems/README.md)

**Observability program:** [`observability-roadmap.md`](./observability-roadmap.md) (Phases A–G)

---

## Focus now

| Priority | Slice | Goal |
|----------|-------|------|
| **Now** | **Phase B** — Timeline 2.0 | Git ref ranges, release markers, snapshot summaries |

Check [`../shipped/README.md`](../shipped/README.md) before re-implementing runtime, init, or CLI styling.

---

## Backlog queue (dependency order)

Work top-to-bottom. **Depends on** lists hard prerequisites; soft deps in parentheses.

| # | Slice | Goal | Depends on | Doc |
|---|-------|------|------------|-----|
| 1 | Phase **B** — Timeline 2.0 | Git ref ranges, release markers, snapshot summaries | A (listing), cache (shipped) | [`timeline-2.md`](./timeline-2.md) |
| 2 | Phase **C** — Graph 2.0 | Namespace-first graph, analytics, filters | A (listing) | [`graph-2.md`](./graph-2.md) |
| 3 | Phase **D** — API chain | Execution introspection / tier rule trace | inventory snapshot (shipped) | [`../api-chain.md`](../api-chain.md) |
| 4 | Phase **F** — CLI output audit | UX audit receipt; close gaps from A + E | A, E | [`cli-output-audit.md`](./cli-output-audit.md) |
| 5 | Phase **G** — Long-term observability | Metrics/views over cached snapshots | B, C | [`../systems/observability.md`](../systems/observability.md) |

**Wave 1 entry** (governance + CI + docs) is **complete** — see [`observability-roadmap.md`](./observability-roadmap.md#entry-criteria-when-to-start-wave-1).

**One slice per PR** — pick the next open row only.

---

## Deferred (unscheduled)

| Slice | Why deferred |
|-------|----------------|
| Auto-fix PR bot | Needs stable `suggest` output + policy; out of scope for dry-run CLI |
| JSON config (`expgov.config.json`) | Config-as-code only — see [`../systems/principles.md`](../systems/principles.md) |
| Remote / shared cache | Local `.expgov/cache` only — see [`../systems/cache.md`](../systems/cache.md) |
| Source profiles (H) | `.ts` sufficient for v1 — see [`sourceProfiles.md`](./sourceProfiles.md) |
| SDK example workspace (I) | I1 skeleton shipped — see [`sdk.md`](./sdk.md) · [`examples/sdk/`](../../examples/sdk/) |

---

## Guiding rules

- **Config is TypeScript only:** `expgov.config.ts` via jiti — no JSON config.
- **Core purity:** `packages/core` never imports CLI, prompts, or chalk.
- **CLI is thin:** Commander host, banners, help colorization, `init` prompts only.
- **Tier sources:** `@sdkTier` JSDoc + nested config buckets — see [`systems/tiers.md`](../systems/tiers.md).

---

## Where detail lives

| Need | Doc |
|------|-----|
| What shipped, when | [`../shipped/README.md`](../shipped/README.md) |
| Command contracts | [`commands.md`](./commands.md) |
| Tiers, cache, CLI, config | [`../systems/`](../systems/README.md) |
| Agent layout + import rules | [`agents/architecture.md`](../agents/architecture.md) |
