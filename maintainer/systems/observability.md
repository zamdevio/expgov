# Observability model

How future metrics relate to the existing inventory/cache architecture — not a feature backlog.

---

## Foundation

```txt
Git refs / worktree
       ↓
  buildInventorySnapshot
       ↓
  .expgov/cache/<sha>/inventory.full.json
       ↓
  diff · trend · graph · timeline · insights
       ↓
  derived metrics (Phase G — planned)
```

**Rules:**

- Metrics are **views** over snapshots, not a parallel indexer.
- Prefer **derived-on-read** for local CLI; optional JSON export for CI.
- No remote cache or shared store — see [`principles.md`](./principles.md).
- `validate` remains the CI gate; observability commands are opt-in.
- Human output stays information-dense (Phase F audit rules).

Cache layout: [`cache.md`](./cache.md). Insights (shipped partial): [`cli.md`](./cli.md#insights-phase-e--partial).

---

## Explicit non-goals

| Idea | Why defer |
|------|-----------|
| Remote telemetry / SaaS | Local-only cache principle |
| Runtime API usage tracking | Needs consumer instrumentation |
| Auto-fix tier PR bot | Deferred — after [`phases/fix.md`](../phases/fix.md) (`fix tags`, `fix config`) |
| JSON config | TypeScript-only config principle |

---

## Phase G metric catalog (planned)

Full sequencing: [`phases/active-phase.md`](../phases/active-phase.md).

| ID | Metric | Source | Depends on |
|----|--------|--------|------------|
| G1 | API health score | validate + snapshot weights | validate |
| G2 | API growth velocity | tag/timeline snapshot series | [`shipped/timeline.md`](../shipped/timeline.md) B4–B5 |
| G3 | Export churn | `\|added\| + \|removed\|` per diff step | diff engine |
| G4 | Namespace growth | namespace set deltas | snapshot |
| G5 | Release comparisons | `diff v1..v2` workflow wrapper | timeline B2, insights E |
| G6 | Historical trends | cache scan → JSON Lines series | timeline B5 + Phase G command |
| G7 | Public surface analytics | stable flat filter + categories | tiers |
| G8 | SDK evolution report | aggregate bundle (modules, tiers, cache meta) | timeline, graph C+, insights E |

Recommended build order after C/E: G3 → G4 → G2 → G7 → G1 → G6 → G8. (G2 partial — timeline Summary ships net growth and churn.)
