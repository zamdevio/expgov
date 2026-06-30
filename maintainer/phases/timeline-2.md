# Phase B — Timeline 2.0

**Status:** Planning only.

**Companion:** [`commands.md`](./commands.md) · [`../systems/cli.md`](../systems/cli.md) (Phase A shipped)

---

## Goals

1. Support **git-ref ranges** on timeline (`v1.0.0..HEAD`, tag-to-tag, tag-to-branch).
2. Overlay **release markers** (version tags) on commit history.
3. Add **richer per-step metadata** without cluttering the default view.
4. Ship **summary sections** (API growth, largest expansion/reduction, active periods).
5. Unlock **historical observability** from cached inventory snapshots alone.

---

## Rationale

`timeline` today answers: *“Which barrel edits happened recently, and how did flat count change?”* It uses `listBarrelCommits` + `parseTimelineRange` (time windows only: `@4w`, ISO week, date range). It does **not** reuse `parseDiffRange` git ref grammar.

That gap blocks the most natural maintainer questions:

- *What changed between v1.0.0 and v2.0.0?*
- *Which release had the biggest API jump?*
- *Were namespaces or tiers shifting, not just flat count?*

The cache layer already stores `inventory.full.json` per SHA and a lighter `timeline.summary.json` profile. Timeline 2.0 should **compose snapshots** rather than re-parse git ad hoc. This aligns with expgov’s philosophy: inventory is the source of truth; commands are views.

---

## Architecture considerations

### Current pipeline

```txt
parseTimelineRange(token) → since/until ISO
listBarrelCommits({ sinceIso, untilIso, limit })
  → per commit: getSnapshot(sha, { profile: 'timeline' })
  → trendRollupFromSnapshot(snapshot) → { rootFlat, stable }
  → pairwise delta vs row above
printTimelineReport
```

### Target pipeline

```txt
parseTimelineRange(token) → TimeRange | RefRange
resolveCommitSequence(range) → GitCommitRow[]
  → optional: inject tag markers from listVersionTags
  → per commit: getSnapshot (cache hit/miss)
  → diffSnapshots(prev, curr) for rich deltas (reuse format/diff.ts)
  → aggregate TimelineSummary
printTimelineReport + optional summary block
```

### Reuse map

| Existing | Reuse for |
|----------|-----------|
| `parseDiffRange` / `resolveSourceRef` / `gitRevParse` | Ref-range endpoints |
| `listBarrelCommits` | Time-bounded sequences (keep) |
| `listVersionTags` | Release markers |
| `diffSnapshots` | Per-step added/removed, tier deltas |
| `getSnapshot` + cache | No new storage format required for v1 |
| `trendRollupFromSnapshot` | Extend rollups (advanced/internal/namespace) |

### New types (planning)

```ts
type TimelineRange =
  | { kind: 'time'; sinceIso; untilIso; label }
  | { kind: 'ref'; left: SourceRef; right: SourceRef; label };

interface TimelineStepMeta {
  added: number;
  removed: number;
  namespaceDelta: number;
  subpathDelta: number;
  tierDelta: Partial<TierCounts>;
  largestModuleChange?: { module: string; delta: number };
}
```

### Core purity note

`TimelineWarmer` verbose warm lines now render via the report layer (`printTimelineWarmSection`) — no `console.*`. Non-verbose in-flight progress still uses `coreLogRaw` `\r` on stderr during warm (cleared before the report). Phase B may fold spinner into `emitLog` if needed.

---

## Implementation strategy

### B1 — Git tag / ref range support

**Motivation:** `timeline v1.0.0..HEAD` is the primary missing range form.

**User value:** Same ref vocabulary as `diff`; no new mental model.

**Approach:**

1. Extend `parseTimelineRange` (or add `parseTimelineRangeV2` in `time/ranges.ts`) to detect ref ranges via shared `splitRangeToken` from `git/ref.ts`.
2. For `ref` ranges:
   - Resolve left/right SHAs with `gitRevParse`.
   - Walk barrel history: `git log left..right -- <barrelPath>` (oldest→newest or newest-first with consistent display).
   - Support `v1.0.0..HEAD`, `v0.5.0..main`, tag..tag.
3. Single ref `timeline v1.0.0` → barrel commits from that tag to HEAD (symmetric to `diff v1.0.0`).
4. Keep time tokens (`@4w`, ISO week) unchanged.

**Dependencies:** B1 before release markers (markers need commit ordering).

**Complexity:** Medium.

**Risks:** `main` as ref must resolve via git; ambiguous short SHAs already throw `unknown_ref`.

**Future extensions:** `timeline @release` shorthand for last tag..HEAD.

---

### B2 — Release-aware timelines

**Motivation:** Flat count deltas between barrel edits miss release context.

**User value:** See *where versions landed* in the edit stream.

**Approach:**

1. After commit sequence resolved, fetch tags pointing at commits in range (`git tag --points-at <sha>` or batch map).
2. Default view: dim marker row when commit SHA matches a version tag:

   ```txt
   2026-06-10  abc1234    82   +3   feat: expand runtime exports
   ── v1.1.0 ─────────────────────────────────────────
   ```

3. `--verbose`: show all tags; `--full` tags only (no commit cap) per Phase A listing rules.
4. JSON: `rows[].tags?: string[]`.

**Dependencies:** B1 ordering; `listVersionTags` / `getTagPattern()` from config.

**Complexity:** Low–medium.

**Risks:** Annotated tags vs lightweight tags; use `gitRevParse` on tag names already proven in `trend`.

**Future extensions:** Filter `--releases-only` (show tag rows + aggregate deltas between tags).

---

### B3 — Richer per-commit metadata

**Motivation:** Flat Δ alone hides namespace/subpath/tier movement.

**User value:** Spot structural API changes from the timeline table.

**Approach:**

1. For each consecutive pair `(prev, curr)`, call `diffSnapshots(prev, curr)` (already cached snapshots — cheap CPU).
2. **Default row:** keep date, sha, flat, Δ, subject.
3. **Footer of each row** (verbose) or **summary column** (compact): `+2 −1 ns +1` shorthand.
4. **Metadata available in JSON** always: `added`, `removed`, `namespaceDelta`, `subpathDelta`, `tierDelta`.
5. Compute **largest module change** by diffing `edges[].toModule` counts between snapshots.

**Dependencies:** Full snapshots for timeline steps (timeline profile may need promotion to full or store extended rollup in `timeline.summary.json`).

**Complexity:** Medium — may require cache profile bump (`SNAPSHOT_VERSION`).

**Risks:** Warming N commits × full parse slower; mitigate with existing cache + `timeline` profile extension (store diff-friendly rollups in summary file).

**Future extensions:** Per-step `expgov diff <prev>..<curr>` deep-link hint in verbose.

---

### B4 — Timeline summaries

**Motivation:** Users want the story, not only the table.

**User value:** Executive summary after the commit list.

**Approach:** After building rows, compute `TimelineSummary`:

| Metric | Definition |
|--------|------------|
| API growth | `last.rootFlat - first.rootFlat` |
| Largest expansion | max positive Δ step + commit |
| Largest reduction | max negative Δ step |
| Average exports/change | mean \|Δ\| over steps with Δ≠0 |
| Most active period | sliding window (e.g. 7d) with most barrel commits |
| Largest release | tag pair with max flat delta between tag SHAs |

Print as dim block before footer (same hierarchy as inventory SDK-wide tiers):

```txt
       API growth          +14 flat (v1.0.0 → HEAD)
       Largest expansion   +8 at d60df9e (2026-06-12)
       Most active period  2026-W24 (4 barrel edits)
```

**Dependencies:** B1–B3 data.

**Complexity:** Low (pure aggregation).

**Risks:** “Most active period” definition must be documented to avoid confusion.

**Future extensions:** JSON `data.summary` mirrors block.

---

### B5 — Historical observability from cache

**Motivation:** Cached snapshots are an accidental time-series database.

**User value:** Trends and anomalies without re-running git.

**Approach (planning capabilities):**

1. **Cache scan command** (future `expgov cache stats` or `timeline --from-cache`): enumerate `.exports/cache/<sha>/`, list SHAs with inventory age.
2. **Derived metrics** from snapshot series:
   - Export churn rate (sum \|added\|+\|removed\| over window)
   - Namespace count trend
   - Tier distribution drift (stable % over time)
   - Module concentration (Gini on edge counts)
   - Category mix shifts (`byCategory` from `RootSummary`)
3. **Correlate** with `meta.json` heal events for cache hygiene narrative.

**Dependencies:** Sufficient cache coverage; B3 rollups in summary files reduce re-read cost.

**Complexity:** Medium–high as separate command; Low as timeline add-on summaries.

**Risks:** Stale cache SHAs from force-pushed history; label with `generatedAt`.

**Future extensions:** Export snapshot series to CSV/JSON Lines for external dashboards.

---

## Dependencies

| Item | Notes |
|------|-------|
| Phase A `--top` / `--full` | Timeline row display |
| Cache `timeline` profile | May need schema bump for extended rollups |
| `diffSnapshots` | Per-step metadata |
| Git ref resolver | Shared with `diff` |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Performance on long ref ranges | Progress via `TimelineWarmer`; respect `--top`; cache hits |
| Snapshot version drift | `SNAPSHOT_VERSION` gate in cache read |
| Display overload | Rich metadata in `-v` / JSON; summary block capped |
| Ref range vs time range parser collision | Disambiguate: ref range contains `..` + git-resolvable tokens |

---

## Future extensions

- `timeline --releases-only` tag-to-tag condensed view.
- Integration with `trend` (shared tag window helper).
- `doctor` cache coverage report for timeline ranges.
- Phase G metrics: velocity, churn exported from same aggregation layer.

---

## Recommended execution order

1. **B1** Ref-range parsing + commit walk (highest user value).
2. **B2** Release markers (visual anchor).
3. **B3** Per-step diff metadata (extend cache profile if needed).
4. **B4** Summary block.
5. **B5** Cache-derived insights (optional command or `--cache-insights` flag).

Estimated: **3–4 PRs** after Phase A listing contract.
