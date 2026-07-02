# Timeline 2.0 (shipped)

Phase B complete — ref ranges, release markers, per-step metadata, Summary block, and series metrics. **No active phase doc** — check here before re-implementing.

**Command:** `packages/core/src/commands/timeline.ts` · **Ranges:** `packages/core/src/time/ranges.ts`

---

## Pipeline

```txt
parseTimelineRange(token) → TimeRange | RefRange
listBarrelCommits* → GitCommitRow[]
indexVersionTagsByCommit → rows[].tags
per commit: getSnapshot(profile: timeline) → light snapshot + flat symbol names
pairwise: computeTimelineStepMeta(newer, older)
computeTimelineSummary(rows, range)
printTimelineReport (+ release markers; -v step shorthand; Summary block)
```

---

## Slices (B1–B5)

| Slice | Receipt |
|-------|---------|
| **B1** — Git ref ranges | `parseTimelineRange` time \| ref; `listBarrelCommitsByRef` (`495f6ec`) |
| **B2** — Release markers | `indexVersionTagsByCommit`; dim `── v1.0.0 ──` rows; JSON `rows[].tags` |
| **B3** — Per-step metadata | `computeTimelineStepMeta` + `diffSnapshots`; JSON `rows[].step`; `-v` shorthand |
| **B4** — Summary block | `computeTimelineSummary`; human `Summary` section; JSON `data.summary` |
| **B5** — Series metrics | Symbol churn, tier/namespace drift, category/module shift, cache coverage in default Summary |

Also shipped: time windows (`@4w`, `@3m`, ISO dates), flat Δ table, insights (P17), warm log (P20) — see [`runtime-cli.md`](./runtime-cli.md) P17/P20.

---

## Code map

| Area | Path |
|------|------|
| Command host | `packages/core/src/commands/timeline.ts` |
| Range parsing | `packages/core/src/time/ranges.ts` |
| Step meta | `packages/core/src/timeline/stepMeta.ts` |
| Summary | `packages/core/src/timeline/summary.ts` |
| Rollup | `packages/core/src/timeline/rollup.ts` |
| Warm log | `packages/core/src/timeline/warmer.ts`, `logger/reports/timeline/warm.ts` |
| Report | `packages/core/src/logger/reports/timeline/` |
| Constants | `packages/core/src/shared/constants/timeline.ts` |
| Tests | `timelineRange`, `timelineStepMeta`, `timelineReleaseMarkers`, `timelineSummary`, `timelineWarm` |

---

## Human output order

Meta → **Snapshot warm** → commit table → **Summary** → Insights → footer.

## JSON (`kind: timeline`)

`data.range`, `data.rows[]` (`tags`, `step`, `rollup`, `delta`), `data.summary`, `data.insights`, `data.warmStats`.

---

## Future (not shipped)

`--releases-only`, Phase G cross-cache observability, `doctor` cache coverage for ranges.
