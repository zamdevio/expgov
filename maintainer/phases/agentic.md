# Phase — Agentic JSON & flexible flags

**Status:** Active — AG6 shipped; leftovers with C3 · **Companion:** [`diff.md`](./diff.md)

---

## Shipped

| ID | Outcome | Receipt |
|----|---------|---------|
| **AG1** | `inventory -v/-F -j` → `symbols` / `namespaces` + `listGuidance` | [`../shipped/inventory-cache.md`](../shipped/inventory-cache.md) |
| **AG2** | `graph -v/-F -j` → `edges` + `listGuidance` | [`../shipped/graph.md`](../shipped/graph.md) |
| **AG3** | `diff -v/-F -j` → `addedDetail` / `removedDetail` | [`../shipped/git-commands.md`](../shipped/git-commands.md) |
| **AG4 / D2** | `validate --since <ref>` | [`../shipped/git-commands.md`](../shipped/git-commands.md) · [`diff.md`](./diff.md) |
| **AG5** | Shared `--tier` / `--category` on inventory / diff detail / graph | this slice |
| **AG6** | Insights `{ lines, …typedFields }` everywhere; chronological Δ signs | this slice |
| **AG7** | CI recipes in workflows / validate / diff / json docs | with D2 |
| **AG8** | Thrown/parser errors → `ok:false` JSON envelopes | [`../shipped/runtime-cli.md`](../shipped/runtime-cli.md) |

List policy (`-T`/`-F`) is shared for human + JSON. Prefer `-j` alone for agents (`-s` redundant).

---

## Remaining

### AG5 leftovers (with C3)

| Flag | Notes |
|------|-------|
| `--names-only` | Optional compact listing — deferred |
| `--namespace` / `--module` / `--subpath` | Graph C3; same filter helper |

### Optional later

- `--no-insights`, `--include-cache-meta`
- `suggest` / `doctor` agent ergonomics (`--fail-on-warning`, exit/`ok` clarity) — see [`suggest.md`](./suggest.md)

---

## Principles (still apply)

1. `-T` / `-F` apply to JSON arrays the same as human lists (`listGuidance` when truncated).
2. `-v` expands JSON `data`, not only human reports.
3. Fail modes stay opt-in; stable `issues[].code`.
4. Grow `data` additively; bump `meta.apiVersion` only on shape breaks.
5. Insights always use `{ lines, …typedFields }` (empty `lines: []`, never `null`); Δ positive = growth toward newer/right/later.
