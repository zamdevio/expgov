# Phase C — Graph 2.0

**Status:** In progress — **C3 next** (filters). C1–C2 shipped — receipts: [`../shipped/graph.md`](../shipped/graph.md).

**Companion:** [`../systems/exports.md`](../systems/exports.md) · [`../systems/cli.md`](../systems/cli.md) · Insights: [`../shipped/runtime-cli.md`](../shipped/runtime-cli.md) P17

---

## Shipped (C1–C2)

| Slice | Receipt |
|-------|---------|
| **C2** — Analytics | `graph/analytics.ts`; Summary block; JSON `data.analytics` |
| **C1** — Namespace-first | Namespaces first, sorted by edge count; composition lines |

---

## Goals (remaining)

1. ~~Reorient the graph around **root namespaces** as primary nodes~~ — **C1 shipped**
2. ~~Add **quantitative graph metadata** (density, fan-in/out, hottest modules)~~ — **C2 shipped**
3. Introduce **consistent filters** (`--namespace`, `--module`, `--category`, `--subpath`) — **C3 next**
4. Brainstorm **additional graph modes** (`--view`, JSON graph export) — **C4 deferred**

---

## Rationale

`graph` consumes `edges[]`, `namespaces[]`, and `symbols[]` from a full inventory snapshot. **C1–C2** reordered the report (namespaces first, sorted by edge count) and added a Summary block + `data.analytics`. **C3** adds scoped filters without rebuilding inventory.

Namespace is the governance boundary; subpath is the publish boundary; module is the implementation unit. No filesystem walks — derive nodes from snapshot only.

---

## Architecture considerations

### Current data (already in snapshot)

```ts
GraphEdge { kind, from, symbol, toModule, targetSubpath }
InventoryNamespace { name, tier, category, targetSubpath, sourceModule }
InventorySymbol { name, category, symbolKind, sourceModule, ... }
```

### Namespace-root graph model

```txt
Root barrel (packages/core/src/index.ts)
  ├── namespace: analysis  → sourceModule: .../commands/analysis.ts
  │     └── symbols via edges (flat-reexport / namespace-mirror)
  ├── namespace: runtime
  └── flat exports → modules directly
```

**Do not** scan `packages/core/src/**` directories. Derive nodes only from:

1. `snapshot.namespaces[]` — namespace nodes.
2. `snapshot.edges[]` — module leaves + edge weights.
3. `snapshot.symbols[]` — flat exports without namespace (attach to synthetic `"(root flat)"` or target subpath group).

### Shared analytics module (shipped C2)

`packages/core/src/graph/analytics.ts` — `computeGraphAnalytics`, `namespaceComposition`. See [`../shipped/graph.md`](../shipped/graph.md).

---

## Remaining slices

### C3 — Graph filters

**Motivation:** Large SDKs need scoped views.

**User value:** `expgov graph --top 5 --category run` answers targeted questions.

**Filters:**

| Flag | Effect |
|------|--------|
| `--top <n>` / `--full` | Phase A listing contract |
| `--namespace <name>` | Single namespace subgraph |
| `--module <path>` | Edges touching module (substring match on `toModule`) |
| `--category <cat>` | Filter symbols/edges by `ExportCategory` |
| `--depth <n>` | Limit expansion depth (default unlimited; for future nested barrels) |
| `--subpath <npm>` | Filter by `targetSubpath` |

**Approach:** Filter snapshot view-model before analytics; do not rebuild inventory.

**Dependencies:** Phase A aliases (`-l` for `--top`).

**Complexity:** Medium.

**Risks:** Filter combinations with zero results — print explicit empty state.

**Future extensions:** `--tier stable` filter for public-surface-only graph.

---

### C4 — Additional graph modes (brainstorm)

Planning only — no implementation commitment.

| Mode | Question answered | Data source |
|------|-------------------|-------------|
| **Tier graph** | Which modules contribute advanced vs stable? | `symbols[].tier` + `edges` |
| **Diff graph** | What changed in the re-export map? | `diffSnapshots` on two refs |
| **Category graph** | Run vs type vs config cluster map | `byCategory` |
| **Subpath graph** | npm publish surface only | group by `targetSubpath` (current default) |
| **Symbol adjacency** | Which symbols share a module? | `edges` grouped by `toModule` |
| **Orphan detection** | Modules in barrel path not referenced? | requires tsconfig path list vs edges (validate crossover) |
| **JSON graph export** | Node-link JSON for D3 | `nodes[]`, `links[]` in `--json` |
| **Mermaid emit** | Paste into docs | optional `--format mermaid` |

Prefer **one flag** `--view <mode>` over many commands when modes share filters.

---

## Dependencies

| Item | Role |
|------|------|
| `InventorySnapshot` | Single source — no parallel graph builder |
| Phase A listing | `--top` / `--full` |
| Phase E metadata | Footer hints (densest module, largest fan-out) |
| Cache `full` profile | Required for complete edges |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Report too long | Namespace-first + `--top`; metadata in summary block |
| Namespace-less packages | Graceful degradation to subpath view |
| Performance | Analytics on in-memory snapshot only |
| JSON envelope growth | `analytics` optional key; omit in quiet human mode |

---

## Future extensions

- `graph diff A..B` or `expgov diff --graph` unified view.
- Interactive TUI (out of scope pre-v1).
- Phase G: API health score from graph centrality metrics.

---

## Recommended execution order

1. ~~**C2** Analytics module~~ — shipped
2. ~~**C1** Namespace-centric report~~ — shipped
3. **C3** Filters (namespace, module, category, subpath)
4. **C4** Modes as incremental flags (`--view subpath` default)

Estimated: **2–3 PRs** after Phase A.
