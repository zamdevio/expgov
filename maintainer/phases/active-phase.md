# Active sprint

**Shipped receipts:** [`shipped-slices.md`](./shipped-slices.md)

**Roadmap:** [`commands.md`](./commands.md) · **Blueprint:** [`architecture.md`](./architecture.md)

**Engineering maps:** [`systems/README.md`](../systems/README.md)

**Observability program:** [`observability-roadmap.md`](./observability-roadmap.md) (Phases A–G)

---

## Focus now

| Priority | Slice | Goal |
|----------|-------|------|
| **Now** | Phase **A** — CLI DX polish | Shared `--top` / `--full`, aliases, provenance, help |

Check [`shipped-slices.md`](./shipped-slices.md) before re-implementing runtime, init, or CLI styling.

---

## Backlog queue (dependency order)

Work top-to-bottom. **Depends on** lists hard prerequisites; soft deps in parentheses.

| # | Slice | Goal | Depends on | Doc |
|---|-------|------|------------|-----|
| ~~1~~ | ~~**`suggest`**~~ | ~~Dry-run `tiers.stable.exact` suggestions~~ | shipped | [`shipped-slices.md`](./shipped-slices.md) |
| **2** | Phase **A** — CLI DX polish | Shared `--top` / `--full`, aliases, provenance, help | — | [`cli-dx-polish.md`](./cli-dx-polish.md) |
| 3 | Phase **E** — Rich command metadata | Answer the “next question” per command inline | A (listing contract) | [`rich-command-metadata.md`](./rich-command-metadata.md) |
| 4 | Phase **B** — Timeline 2.0 | Git ref ranges, release markers, snapshot summaries | A (listing), cache (shipped) | [`timeline-2.md`](./timeline-2.md) |
| 5 | Phase **C** — Graph 2.0 | Namespace-first graph, analytics, filters | A (listing) | [`graph-2.md`](./graph-2.md) |
| 6 | Phase **D** — API chain | Execution introspection / tier rule trace | inventory snapshot (shipped) | [`../api-chain.md`](../api-chain.md) |
| 7 | Phase **F** — CLI output audit | UX audit receipt; close gaps from A + E | A, E | [`cli-output-audit.md`](./cli-output-audit.md) |
| 8 | Phase **G** — Long-term observability | Metrics/views over cached snapshots | B, C | [`observability.md`](./observability.md) |

**Wave 1 entry** (governance + CI + docs) is **complete** — see [`observability-roadmap.md`](./observability-roadmap.md#entry-criteria-when-to-start-wave-1).

**One slice per PR** — pick the next open row only.

---

## Deferred (unscheduled)

| Slice | Why deferred |
|-------|----------------|
| Auto-fix PR bot | Needs stable `suggest` output + policy; out of scope for dry-run CLI |
| JSON config (`expgov.config.json`) | Config-as-code only — see [`architecture.md`](./architecture.md) |
| Remote / shared cache | Local `.expgov/cache` only — see [`systems/cache.md`](../systems/cache.md) |

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
| What shipped, when | [`shipped-slices.md`](./shipped-slices.md) |
| Command contracts | [`commands.md`](./commands.md) |
| Tiers, cache, CLI, config | [`systems/`](../systems/README.md) |
| Agent layout + import rules | [`agents/architecture.md`](../agents/architecture.md) |
