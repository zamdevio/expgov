# Phase C — Graph 2.0

**Status:** Planning only.

**Companion:** [`../systems/exports.md`](../systems/exports.md) · [`../systems/cli.md`](../systems/cli.md) · Insights shipped [`../shipped/runtime-cli.md`](../shipped/runtime-cli.md) P17

---

## Goals

1. Reorient the graph around **root namespaces** as primary nodes (not folder scans).
2. Add **quantitative graph metadata** (size, density, fan-in/out, hottest modules).
3. Introduce **consistent filters** (`--top`, `--full`, depth, module, category).
4. Brainstorm **additional graph modes** that reuse `InventorySnapshot.edges[]` and `namespaces[]`.

---

## Rationale

`graph` has outgrown its original “re-export map” description. It already consumes the richest snapshot artifact (`edges[]`, `namespaces[]`, `symbols[]`) but presents a **flat, truncated report**:

- Groups by npm `targetSubpath` (12 rows default).
- Lists namespaces alphabetically (15 rows).
- Top modules by edge count (8 default, 20 verbose).

Users treating expgov as an SDK observability tool need **structure**: which namespace owns the surface, which modules are hubs, where coupling is dense. The inventory build already resolves `export * as ns` to `sourceModule` — no filesystem walk required.

Phase C builds on existing architecture: **parse barrel → resolve exports → edges**. Namespace is the governance boundary; subpath is the publish boundary; module is the implementation unit.

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

### Shared analytics module

Plan `packages/core/src/graph/analytics.ts`:

| Function | Output |
|----------|--------|
| `namespaceComposition(snapshot)` | per-ns symbol count, tier mix, categories |
| `moduleFanout(edges)` | out-degree from barrel/ns to modules |
| `moduleFanin(edges)` | in-degree (same as fanout for tree; useful if multi-ns → same module) |
| `edgeDensity(snapshot)` | edges / (modules × namespaces) |
| `hottestModules(edges, n)` | sorted by edge count |
| `symbolCategoryMix(symbols)` | category histogram per namespace |

Commands stay thin; `runExportsGraph` composes analytics + `printGraphReport`.

### Modes (CLI shape)

```txt
expgov graph [ref]              # default: overview (current behavior, enhanced)
expgov graph namespace [name]   # drill-down (future subcommand or --ns=)
expgov graph module [path]      # fan-in view for one module
```

Prefer **flags first** to avoid subcommand proliferation: `--namespace analysis`, `--module packages/core/src/...`.

---

## Implementation strategy

### C1 — Namespace-centric default view

**Motivation:** Namespaces are the intentional SDK surface areas (`export * as analysis`).

**User value:** See SDK composition at a glance.

**Approach:**

1. Reorder report sections:
   - Meta (ref, cache, edges, symbols)
   - **Namespaces** (primary) — sorted by **symbol/edge count**, not alpha.
   - Target subpath groups (secondary governance view).
   - Top modules (tertiary).
2. Per namespace row:

   ```txt
   · analysis          24 symbols → runtime/commands  · @expgov/core/analysis
     stable 18 · adv 4 · run 12 · type 8
   ```

3. Reuse `compactCoreSourcePath(ns.sourceModule)` — already in verbose inventory.

**Dependencies:** Phase A listing (`--top 10` default).

**Complexity:** Medium (report restructure, no new parsing).

**Risks:** SDKs without namespaces — fall back to current subpath grouping only.

**Future extensions:** `graph --namespace analysis` expands one row to symbol list.

---

### C2 — Rich graph metadata

**Motivation:** Scalar counts (edges, symbols) are insufficient for observability.

**User value:** Identify hotspots and coupling before refactors.

**Metrics to add (default summary block, details in `-v`):

| Metric | Description |
|--------|-------------|
| Namespace size | symbols + namespace-mirror edges per `ns.name` |
| Module size | edge count per `toModule` |
| Edge density | `edges.length / uniqueModules` |
| Hottest module | max edge count module |
| Fan-out | max namespaces pointing at distinct modules (usually 1:1) |
| Fan-in | modules receiving edges from multiple namespaces |
| Namespace composition | category + tier histogram per ns |
| Symbol categories | aggregate `byCategory` under each ns |

**Approach:** Implement in `graph/analytics.ts`; unit-test with dogfood snapshot fixtures.

**Dependencies:** C1 namespace ordering.

**Complexity:** Medium.

**Risks:** Misleading metrics if namespace-mirror edges double-count — document edge `kind` weighting.

**Future extensions:** JSON `data.analytics` object for dashboards.

---

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

1. **C2** Analytics module (testable in isolation).
2. **C1** Namespace-centric report restructure.
3. **C3** Filters (namespace, module, category).
4. **C4** Modes as incremental flags (`--view subpath` default, `--view namespace`).

Estimated: **2–3 PRs** after Phase A.
