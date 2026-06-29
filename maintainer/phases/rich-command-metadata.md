# Phase E — Rich Command Metadata

**Status:** In progress — `inventory`, `validate`, `diff`, and `trend` shipped; `graph` / `timeline` pending (Phase B/C deps).

---

## Shipped

| Command | Insights | Receipt |
|---------|----------|---------|
| `inventory` | Largest module (edges), median exports/module, unclassified warnings | `006b45a` |
| `validate` | Hot spot / worst subpath on failure; internal/advanced counts on `-v` | `006b45a` |
| `diff` | Module edge delta, tier movement, new advanced, truncated add/remove samples | `b60faad` |
| `trend` | Largest tag-pair jump/drop, stable % shift | `b60faad` |

**Module:** `packages/core/src/insights/` — pure functions over snapshots (no I/O).

**Render:** `logger/reports/insights.ts` — dim `◇` block before footer; max 5 lines; shown under `--quiet`; suppressed under `--silent`.

**JSON:** additive `data.insights` on inventory, validate, diff, trend.

**Tests:** `shared/__tests__/insights.test.ts` (9 cases).

**Engineering map:** [`systems/cli.md`](../systems/cli.md#insights-phase-e--partial).

---

## Goals

For every command, answer the **very next question** a developer would ask — inline, without running another command.

Add command-relevant statistics only. No generic dashboard noise.

---

## Rationale

expgov commands already emit footers (`flat=80 · stable=75`) via `finishCommand` + `emitCommandFooter`. Footers count outcomes; they do not **anticipate curiosity**.

Example gap: after `expgov diff HEAD`, the user wonders *“which module grew the most?”* — today they must run `graph` or `inventory -v` manually.

Rich metadata reuses **snapshot data already loaded** in each command host. Incremental cost is one aggregation pass; user value is high for observability positioning.

---

## Design principle

> **Next-question heuristic:** For command C with primary output P, list the top 1–3 questions Q₁,Q₂,Q₃ that follow P. Answer Qᵢ if computable from data already in memory at end of C.

If data requires a new git fetch or second snapshot, either:

- pre-load it (diff already loads two), or
- defer to a hint (`Run expgov graph for module breakdown`) — not a stat.

---

## Per-command plan (remaining)

### `graph [ref]`

**Primary output:** Namespace / subpath / module map (Phase C).

| Next question | Proposed answer | Source |
|---------------|-----------------|--------|
| Densest module? | `densest: …/logger/index.ts (42 edges)` | `graph/analytics` |
| Largest fan-out? | `fan-out: runtime → 8 modules` | namespace → module edges |
| Symbol composition? | `run 45% · type 30% · config 10%` | `byCategory` |

**Placement:** Summary block under meta (Phase C2).

**Complexity:** Low after Phase C analytics.

---

### `timeline [range]`

**Primary output:** Commit table with flat Δ.

| Next question | Proposed answer | Source |
|---------------|-----------------|--------|
| Top changed module overall? | From B4 summary | step diffs |
| Largest namespace in window? | aggregate namespace deltas | B3 |
| Exports added/removed total? | `Σ +12 −4 over 8 commits` | sum step diffs |
| Busiest week? | B4 most active period | dates |

**Placement:** Timeline summary block (Phase B4) — merge E + B to avoid duplicate sections.

**Complexity:** Medium (coordinate with Phase B).

---

### `init`

**Primary output:** Config written / skipped.

| Next question | Proposed answer | Source |
|---------------|-----------------|--------|
| What now? | `next: expgov inventory` tip | static workflow |
| Monorepo detected? | Already in tips | detection result |

**Placement:** `coreLogTip` only — no stats.

**Complexity:** Low (help strings).

---

## Architecture (shared)

- Pure functions in `packages/core/src/insights/`.
- `printInsightsBlock` in logger — consistent dim prefix `◇`.
- JSON: always include `data.insights` object (additive).
- Policy: suppress only under `--silent` (not `--quiet`).

| Layer | Content |
|-------|---------|
| Report body | Tables, lists (Phase A limits) |
| Insights block | 3–5 lines max, next-question answers |
| Footer | `counts=` timer line (existing) |

---

## Dependencies

| Phase | Provides |
|-------|----------|
| Phase A (shipped) | Truncation + “see --full” hints |
| Phase B | Timeline summaries |
| Phase C | Graph analytics |
| Phase D | Optional trace when insights look wrong |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Clutter | Max 5 insight lines; command-specific |
| Wrong “largest” tie-break | Document sort key (edge count vs symbol count) |
| JSON size | Flat insights object, no full symbol lists |
| Duplicate with Phase B/C | Single owner per metric — cross-link in docs |

---

## Future extensions

- `insights` section in `expgov.config.ts` to disable metrics.
- `--insights none` for scripting.
- CI JSON gates on `insights.unclassifiedModules > 0`.

---

## Remaining execution order

1. **graph** (after Phase C analytics).
2. **timeline** (merge with Phase B4 summary).
