# Phase E — Rich Command Metadata

**Status:** In progress — `inventory` + `validate` shipped; `diff` / `trend` / `graph` / `timeline` pending.

**Companion:** [`commands.md`](./commands.md) · Phase A [`cli-dx-polish.md`](./cli-dx-polish.md) · Phase C [`graph-2.md`](./graph-2.md)

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

## Per-command plan

### `inventory [ref]`

**Primary output:** Root tiers, SDK-wide tiers, subpath rollups, top categories.

| Next question | Proposed answer | Source |
|---------------|-----------------|--------|
| Largest namespace? | `largest ns: runtime (18 symbols)` | `namespaces[]` |
| Largest source module? | `largest module: …/commands/index.ts (22 edges)` | `edges[]` |
| Median exports per module? | `median 4 exports/module (12 modules)` | `edges` grouped |
| Any unclassified? | Already in tier counts | `summary.root` |

**Placement:** Dim block before footer; JSON `data.insights`.

**Complexity:** Low.

**Risks:** Median obscure for small SDKs — hide when &lt;3 modules.

---

### `diff [range]`

**Primary output:** Tier deltas, added/removed flats, violations.

| Next question | Proposed answer | Source |
|---------------|-----------------|--------|
| Biggest source module change? | `largest module delta: +5 edges in …/runtime/` | diff edge counts |
| Largest namespace change? | `namespace analysis: +3 symbols` | namespace sets |
| Tier movement? | `stable +2 · advanced −1` | `summaryDelta` |
| New advanced APIs? | `new advanced: foo, bar` (top 3) | `right.symbols` |
| Removed APIs? | top 3 names in footer if truncated list | `diff.removed` |

**Placement:** After added/removed sections; respect Phase A `--top` with “+N more in footer insight”.

**Complexity:** Medium.

**Dependencies:** `diffSnapshots` extension for module/namespace deltas (shared with Timeline B3).

---

### `validate`

**Primary output:** Pass/fail, violations, notes.

| Next question | Proposed answer | Source |
|---------------|-----------------|--------|
| Largest unclassified module? | `hot spot: …/internal/foo.ts (4 unclassified)` | symbols grouped by `sourceModule` |
| Largest offending namespace? | `namespace experimental: 3 unclassified` | `namespaces` + symbols |
| Worst subpath? | Already partially in violations | `summary.subpaths` |

**Placement:** Only on **failure** or `-v`; avoid noise on green CI.

**Complexity:** Low.

**Risks:** Actionable text must cite config fix (`tiers.stable.exact`).

---

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

### `trend`

**Primary output:** Per-tag flat/stable/adv/int table.

| Next question | Proposed answer | Source |
|---------------|-----------------|--------|
| Fastest growth tag pair? | `largest jump: v1.0.0→v1.1.0 (+14 flat)` | consecutive rows |
| Stable ratio trend? | `stable %: 72% → 81%` | rollups |
| Regression tag? | tag where flat dropped most | row deltas |

**Placement:** After Δ footer line (extends existing first→last Δ).

**Complexity:** Low.

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

## Architecture considerations

### Shared insights module

`packages/core/src/insights/` (or `shared/insights.ts`):

```ts
computeInventoryInsights(snapshot): InventoryInsights
computeDiffInsights(left, right, diff): DiffInsights
// etc.
```

- Pure functions over snapshots.
- No I/O.
- Unit-tested against dogfood `inventory.full.json` fixture.

### Rendering

- `printInsightsBlock(insights, { top })` in logger — consistent dim prefix `       ◇ ` or reuse summary style.
- JSON: always include `data.insights` object (additive).
- Policy: suppress under `--quiet`? **No** — insights are primary value; suppress only under `--silent` / `--json` optional key.

### Footer vs body

| Layer | Content |
|-------|---------|
| Report body | Tables, lists (Phase A limits) |
| Insights block | 3–5 lines max, next-question answers |
| Footer | `counts=` timer line (existing) |

---

## Dependencies

| Phase | Provides |
|-------|----------|
| Phase A | Truncation + “see --full” hints |
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

## Recommended execution order

1. **Shared insights module** + unit tests.
2. **inventory** + **validate** (single-snapshot, low risk).
3. **diff** + **trend** (delta logic).
4. **graph** (after Phase C analytics).
5. **timeline** (merge with Phase B4 summary).

Estimated: **2 PRs** parallel to Phase B/C where noted.
