# Phase B — Timeline 2.0

**Status:** Complete — B1–B4 shipped. B5 (`--cache-insights`) optional / deferred.

**Active sprint:** [`active-phase.md`](./active-phase.md#focus-now--phase-b-timeline-20)

---

## Shipped (receipts only)

| Slice | Receipt |
|-------|---------|
| **B1** — Git ref ranges | `parseTimelineRange` time \| ref; `listBarrelCommitsByRef` |
| **B2** — Release markers | `indexVersionTagsByCommit`; dim `── v1.0.0 ──` rows |
| **B3** — Per-step metadata | `computeTimelineStepMeta` + `diffSnapshots`; JSON `rows[].step`; `-v` shorthand |
| **B4** — Summary block | `computeTimelineSummary`; human `Summary` section; JSON `data.summary` |

---

## Pipeline (current)

```txt
parseTimelineRange(token) → TimeRange | RefRange
listBarrelCommits* → GitCommitRow[]
indexVersionTagsByCommit → rows[].tags
per commit: getSnapshot(profile: timeline) → light snapshot + flat symbol names
pairwise: computeTimelineStepMeta(newer, older)
computeTimelineSummary(rows, range)
printTimelineReport (+ release markers; -v step shorthand; Summary block)
```

Reuse: `diffSnapshots`, `listVersionTags`, `getSnapshot`, `shared/listing` (`-T`/`-F`).

---

## Remaining slices

### B5 — Cache insights (optional)

Cache-derived series metrics or `--cache-insights` — defer with reason if not taken in a follow-up PR.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Long ref ranges | `TimelineWarmer`; `-T` cap; cache hits |
| Stale timeline cache (pre-B3) | Auto-rebuild when `flat > 0` but `symbols` empty |
| Display overload | Step shorthand in `-v` only; JSON always has `step` |

**Future:** `--releases-only`, Phase G metrics, `doctor` cache coverage for ranges.
