# Phase B — Timeline 2.0

**Status:** In progress — **B4 next** (summary block). B1–B3 shipped — receipts in [`../shipped/git-commands.md`](../shipped/git-commands.md) and [`../shipped/runtime-cli.md`](../shipped/runtime-cli.md).

**Active sprint:** [`active-phase.md`](./active-phase.md#focus-now--phase-b-timeline-20)

---

## Shipped (receipts only)

| Slice | Receipt |
|-------|---------|
| **B1** — Git ref ranges | `parseTimelineRange` time \| ref; `listBarrelCommitsByRef` |
| **B2** — Release markers | `indexVersionTagsByCommit`; dim `── v1.0.0 ──` rows |
| **B3** — Per-step metadata | `computeTimelineStepMeta` + `diffSnapshots`; JSON `rows[].step`; `-v` shorthand |

---

## Pipeline (current)

```txt
parseTimelineRange(token) → TimeRange | RefRange
listBarrelCommits* → GitCommitRow[]
indexVersionTagsByCommit → rows[].tags
per commit: getSnapshot(profile: timeline) → light snapshot + flat symbol names
pairwise: computeTimelineStepMeta(newer, older)
printTimelineReport (+ release markers; -v step shorthand)
```

Reuse: `diffSnapshots`, `listVersionTags`, `getSnapshot`, `shared/listing` (`-T`/`-F`).

---

## Remaining slices

### B4 — Timeline summaries

Executive summary after the commit list: API growth, largest expansion/reduction, busiest period. Pure aggregation over existing rows — see prior plan in git history / [`../shipped/README.md`](../shipped/README.md) when shipped.

### B5 — Cache insights (optional)

Cache-derived series metrics or `--cache-insights` — defer with reason if not taken in B4 PR.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Long ref ranges | `TimelineWarmer`; `-T` cap; cache hits |
| Stale timeline cache (pre-B3) | Auto-rebuild when `flat > 0` but `symbols` empty |
| Display overload | Step shorthand in `-v` only; JSON always has `step` |

**Future:** `--releases-only`, Phase G metrics, `doctor` cache coverage for ranges.
