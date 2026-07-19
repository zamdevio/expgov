# Phase C — Graph 2.0

**Status:** C3 shipped · C4 deferred — receipts: [`../shipped/graph.md`](../shipped/graph.md).

**Companion:** [`../systems/exports.md`](../systems/exports.md) · [`../systems/cli.md`](../systems/cli.md) · Insights: [`../shipped/runtime-cli.md`](../shipped/runtime-cli.md)

---

## Shipped

| Slice | Receipt |
|-------|---------|
| **C2** — Analytics | `graph/analytics.ts`; Summary block; JSON `data.analytics` |
| **C1** — Namespace-first | Namespaces first, sorted by edge count; composition lines |
| **C3** — Graph filters | Shared `--namespace` / `--module` / `--subpath` (+ AG5 `--tier` / `--category`); filter view before analytics |

---

## Goals

1. ~~Reorient the graph around **root namespaces** as primary nodes~~ — **C1 shipped**
2. ~~Add **quantitative graph metadata** (density, fan-in/out, hottest modules)~~ — **C2 shipped**
3. ~~Introduce **consistent filters** (`--namespace`, `--module`, `--category`, `--subpath`)~~ — **C3 shipped**
4. Brainstorm **additional graph modes** (`--view`, JSON graph export) — **C4 deferred**

---

## C3 notes

- Filter helper: `packages/core/src/shared/filters.ts` (`filterSnapshotView`)
- CLI: `addFilterFlags` on inventory / diff / graph
- `--module` is substring match on `sourceModule` / `toModule`
- `--subpath` accepts `./types` or `types`
- `--depth` left for future nested barrels
- Empty filtered views print explicit empty sections

---

## C4 — Additional graph modes (brainstorm)

Planning only — no implementation commitment.

| Mode | Question answered |
|------|-------------------|
| **Tier graph** | Which modules contribute advanced vs stable? |
| **Diff graph** | What changed in the re-export map? |
| **JSON graph export** | Node-link JSON for D3 |
| **Mermaid emit** | Paste into docs |

Prefer **one flag** `--view <mode>` over many commands when modes share filters.
