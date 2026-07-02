# Phase B — Timeline 2.0

**Status:** Complete — B1–B5 shipped (B5 series metrics in default Summary; no `--cache-insights` flag).

**Active sprint:** [`active-phase.md`](./active-phase.md#focus-now--phase-b-timeline-20)

---

## Shipped (receipts only)

| Slice | Receipt |
|-------|---------|
| **B1** — Git ref ranges | `parseTimelineRange` time \| ref; `listBarrelCommitsByRef` |
| **B2** — Release markers | `indexVersionTagsByCommit`; dim `── v1.0.0 ──` rows |
| **B3** — Per-step metadata | `computeTimelineStepMeta` + `diffSnapshots`; JSON `rows[].step`; `-v` shorthand |
| **B4** — Summary block | `computeTimelineSummary`; human `Summary` section; JSON `data.summary` |
| **B5** — Series metrics | Symbol churn, tier/namespace drift, category/module shift, cache coverage in Summary |

---

## Pipeline (current)

```txt
parseTimelineRange(token) → TimeRange | RefRange
listBarrelCommits* → GitCommitRow[]
indexVersionTagsByCommit → rows[].tags
per commit: getSnapshot(profile: timeline) → light snapshot + flat symbol names
pairwise: computeTimelineStepMeta(newer, older)
computeTimelineSummary(rows, range)  # includes B5 series metrics
printTimelineReport (+ release markers; -v step shorthand; Summary block)
```

Reuse: `diffSnapshots`, `listVersionTags`, `getSnapshot`, `shared/listing` (`-T`/`-F`).

---

## Remaining slices

None for Phase B v1. Phase G may add cross-cache observability commands later.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Long ref ranges | `TimelineWarmer`; `-T` cap; cache hits |
| Stale timeline cache (pre-B3) | Auto-rebuild when `flat > 0` but `symbols` empty |
| Display overload | Step shorthand in `-v` only; JSON always has `step` |

**Future:** `--releases-only`, Phase G metrics, `doctor` cache coverage for ranges.
