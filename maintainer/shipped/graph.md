# Graph 2.0 (partial — C1–C2 shipped)

Phase C in progress — namespace-first report and analytics shipped; **C3 filters next**. Active plan: [`phases/graph-2.md`](../phases/graph-2.md).

**Command:** `packages/core/src/commands/graph.ts` · **Analytics:** `packages/core/src/graph/analytics.ts`

---

## Shipped slices (C1–C2)

| Slice | Receipt |
|-------|---------|
| **C2** — Graph analytics | `computeGraphAnalytics`, `namespaceComposition`; human Summary block; JSON `data.analytics` (`b7a120b`) |
| **C1** — Namespace-first view | Namespaces section first (sorted by edge count); tier/category composition lines; meta `namespaces` count |

P17 graph insights (densest module, fan-out, category mix) remain — see [`runtime-cli.md`](./runtime-cli.md) P17.

---

## Pipeline (current)

```txt
resolveSourceRef → getSnapshot(profile: full)
computeGraphAnalytics(snapshot)
groupByTargetSubpath / topModules (unchanged helpers)
printGraphReport: meta → namespaces → re-export targets → subpaths → top modules → Summary → insights
```

---

## Code map

| Area | Path |
|------|------|
| Command host | `packages/core/src/commands/graph.ts` |
| Analytics | `packages/core/src/graph/analytics.ts` |
| Types | `packages/core/src/types/graph/analytics.ts` |
| Summary printer | `packages/core/src/logger/reports/graph/summary.ts` |
| Report | `packages/core/src/logger/reports/graph.ts` |
| Constants | `packages/core/src/shared/constants/graph.ts` |
| Tests | `shared/__tests__/graphAnalytics.test.ts` |

---

## Human output order

Meta → **Root namespaces** (edge count, module, composition) → re-export targets → published subpaths → top modules → **Summary** → Insights → footer.

## JSON (`kind: graph`)

`data.edgeCount`, `data.targetGroups`, `data.analytics`, `data.insights`.

---

## Next (not shipped)

**C3** — `--namespace`, `--module`, `--category`, `--subpath` filters (filter view-model before analytics; no inventory rebuild).

**C4** — `--view` modes, JSON node-link export, Mermaid (brainstorm only).

---

## Risks (carry forward)

| Risk | Mitigation |
|------|------------|
| Namespace-less packages | Fall back to subpath + module views only |
| Filter combo empty | Explicit empty-state message (C3) |
| JSON envelope growth | `analytics` optional; filters add scoped keys only |
