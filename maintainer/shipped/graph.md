# Graph 2.0 (C1–C3 shipped)

**C4** graph modes remain brainstorm-only. Active note: [`phases/graph-2.md`](../phases/graph-2.md).

**Command:** `packages/core/src/commands/graph.ts` · **Analytics:** `packages/core/src/graph/analytics.ts`

---

## Shipped slices

| Slice | Receipt |
|-------|---------|
| **C2** — Graph analytics | `computeGraphAnalytics`, `namespaceComposition`; human Summary block; JSON `data.analytics` (`b7a120b`) |
| **C1** — Namespace-first view | Namespaces section first (sorted by edge count); tier/category composition lines; meta `namespaces` count |
| **C3** — Graph filters | Shared `--namespace` / `--module` / `--subpath` (+ AG5 `--tier` / `--category`); filter view before analytics |

P17 graph insights (densest module, fan-out, category mix) — see [`runtime-cli.md`](./runtime-cli.md) P17.

---

## AG2 — graph JSON edges (shipped) · 2026-W29

- [x] `graph --json` with `-v` or `-F` emits `data.edges[]` (kind, from, symbol, toModule, targetSubpath)
- [x] Shared list policy: same `-T`/`-F` as human lists; `top` + `edgesHidden` + single `listGuidance` block
- [x] Helpers: `format/graphJson.ts`; tests: `shared/__tests__/graphJson.test.ts`
- [x] Docs: `docs/cli/json.md`, `docs/commands/graph.md`

---

## Pipeline (current)

```txt
resolveSourceRef → getSnapshot(profile: full)
filterSnapshotView (shared list filters)
computeGraphAnalytics(view)
groupByTargetSubpath / topModules
printGraphReport: meta → namespaces → re-export targets → subpaths → top modules → Summary → insights
```

---

## Code map

| Area | Path |
|------|------|
| Command host | `packages/core/src/commands/graph.ts` |
| Analytics | `packages/core/src/graph/analytics.ts` |
| Filters | `packages/core/src/shared/filters.ts` |
| Types | `packages/core/src/types/graph/analytics.ts` |
| Summary printer | `packages/core/src/logger/reports/graph/summary.ts` |
| Report | `packages/core/src/logger/reports/graph.ts` |
| Constants | `packages/core/src/shared/constants/graph.ts` |
| Tests | `shared/__tests__/graphAnalytics.test.ts`, `filters.test.ts`, `graphJson.test.ts` |

---

## Human output order

Meta → **Root namespaces** (edge count, module, composition) → re-export targets → published subpaths → top modules → **Summary** → Insights → footer.

## JSON (`kind: graph`)

`data.edgeCount`, `data.targetGroups`, `data.analytics`, `data.insights`, optional `data.filters`, optional `data.edges` under `-v`/`-F`.

---

## Next (not shipped)

**C4** — `--view` modes, JSON node-link export, Mermaid (brainstorm only).

---

## Risks (carry forward)

| Risk | Mitigation |
|------|------------|
| Namespace-less packages | Fall back to subpath + module views only |
| Filter combo empty | Explicit empty-state message (shipped with C3) |
| JSON envelope growth | `analytics` optional; filters add scoped keys only |
