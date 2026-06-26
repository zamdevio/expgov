# Phase G — Long-term Observability

**Status:** Planning only.

**Companion:** [`../systems/cache.md`](../systems/cache.md) · Phase B [`timeline-2.md`](./timeline-2.md) · Phase C [`graph-2.md`](./graph-2.md)

---

## Goals

Identify observability capabilities that **emerge naturally** from expgov’s inventory/cache architecture — not feature sprawl.

Position expgov as a **polished SDK observability tool** while preserving export-governance roots.

---

## Rationale

expgov already accumulates:

- Per-SHA `inventory.full.json` snapshots (gitignored local cache).
- Lighter `timeline.summary.json` rollups.
- Commands that compare snapshots (`diff`, `trend`, `timeline`).
- Rich symbol graph (`edges[]`, tiers, categories, namespaces).

That data supports time-series and health metrics without a remote telemetry stack. Phase G names **what to build later** and **what not to build**.

---

## Architectural foundation

```txt
Git refs / worktree
       ↓
  buildInventorySnapshot
       ↓
  .exports/cache/<sha>/inventory.full.json
       ↓
  ┌─────────────┬──────────────┬─────────────┐
  │ diff engine │ trend rows   │ graph analytics │
  └─────────────┴──────────────┴─────────────┘
       ↓
  Observability metrics (Phase G)
```

**Principles:**

- Metrics are **views** over snapshots, not a parallel indexer.
- Prefer **derived-on-read** for local CLI; optional export formats for CI.
- No remote cache / shared store (out of scope per architecture.md).

---

## Capability catalog

Each entry: motivation, user value, approach, dependencies, complexity, risks, extensions.

---

### G1 — API health score

**Motivation:** Single number for “how governance-healthy is this SDK right now?”

**User value:** CI badge, release gate companion to `validate`.

**Approach:** Weighted score from snapshot + validate rules:

| Signal | Weight |
|--------|--------|
| unclassified root flats | −high |
| internal/advanced flat on root | −medium |
| tsconfig/npm parity | binary pass/fail |
| stable ratio | +low |
| namespace concentration | informational |

Output: `expgov health` or `validate --score` (0–100).

**Dependencies:** `validate` checks, snapshot.

**Complexity:** Medium.

**Risks:** Scoring feels arbitrary — publish formula in maintainer docs; never hide failures behind score.

**Extensions:** Trend health over tags.

---

### G2 — API growth velocity

**Motivation:** “Are we accelerating public surface growth?”

**User value:** Release planning, semver discipline.

**Approach:**

- From cached snapshots across tags or timeline window: `Δflat / Δdays`.
- Segment by tier (stable velocity vs advanced).
- Display in `trend` footer or `timeline` summary (Phase B4 overlap).

**Dependencies:** Cache coverage across tags; Phase B ref ranges.

**Complexity:** Low.

**Risks:** Barrel edits ≠ releases — label as *export surface velocity*.

**Extensions:** Velocity alert threshold in config.

---

### G3 — Export churn

**Motivation:** High added+removed counts with small net Δ signals instability.

**User value:** Refactor quality signal.

**Approach:**

- `churn = |added| + |removed|` per diff step.
- Aggregate over timeline or tag pairs.
- JSON field in diff/timeline envelopes.

**Dependencies:** `diffSnapshots` (Phase B3).

**Complexity:** Low.

**Risks:** Renames count as remove+add — future name-alignment heuristic.

**Extensions:** Top churned symbols list.

---

### G4 — Namespace growth

**Motivation:** Namespaces are product boundaries; growth is structural.

**User value:** See new `export * as` areas over time.

**Approach:**

- Compare `namespaces[].name` sets between snapshots.
- Report in `diff`, `timeline`, dedicated `expgov namespaces` (deferred command).

**Dependencies:** Snapshot namespaces stable schema.

**Complexity:** Low.

**Risks:** None significant.

**Extensions:** Namespace size trend chart (JSON export).

---

### G5 — Release comparisons

**Motivation:** `diff v1..v2` is powerful but manual.

**User value:** Standard release review workflow.

**Approach:**

- `expgov release diff v1.0.0 v2.0.0` alias wrapping `diff` + insights (Phase E).
- Combine with Phase B release markers.

**Dependencies:** Phase B, Phase E.

**Complexity:** Low (workflow wrapper).

**Risks:** Tag not on barrel commit — document resolution.

**Extensions:** Changelog snippet generation (planning only).

---

### G6 — Historical trends

**Motivation:** `trend` covers tags; timeline covers commits — unify series.

**User value:** One API evolution chart data source.

**Approach:**

- `expgov series` exports time-ordered `{ sha, date, rootFlat, stable, … }` from cache scan.
- Output JSON Lines for plotting.

**Dependencies:** Phase B5 cache enumeration.

**Complexity:** Medium.

**Risks:** Incomplete cache → gaps in series; mark `interpolated: false`.

**Extensions:** CSV export.

---

### G7 — Public surface analytics

**Motivation:** Consumers care about stable flat exports, not internal edges.

**User value:** “What can I import from the root?”

**Approach:**

- Filter `symbols` where `tier === 'stable' && exportKind === 'flat'`.
- Category histogram, type/value ratio (`byTsKind`).
- `inventory --surface public` view flag.

**Dependencies:** Tier classification accuracy.

**Complexity:** Low.

**Risks:** Confusion with npm `exports` conditions — clarify scope is barrel.

**Extensions:** Subpath-specific public surface.

---

### G8 — SDK evolution metrics (aggregate)

**Motivation:** Executive dashboards for monorepo maintainers.

**User value:** Single JSON report for leadership / docs.

**Metrics bundle:**

| Metric | Source |
|--------|--------|
| Total symbols | snapshot |
| Module count | unique `edges[].toModule` |
| Avg symbols/module | derived |
| Tier distribution % | summary |
| Top 5 modules by edge count | graph analytics |
| Cache age / coverage | meta.json + dir scan |
| Last barrel edit | git log |

**Approach:** `expgov report` command — `--json` only by default.

**Dependencies:** Phases C, E, B5.

**Complexity:** Medium.

**Risks:** Scope creep — ship as JSON-only, no fancy TUI.

**Extensions:** Scheduled CI artifact upload.

---

## Explicit non-goals

| Idea | Why defer |
|------|-----------|
| Remote telemetry / SaaS | Architecture out of scope |
| Runtime API usage tracking | Needs consumer instrumentation |
| Auto-fix tier PR bot | Deferred in architecture.md |
| JSON config | TypeScript-only config principle |
| Real-time watch mode | Separate tool; could wrap `inventory` in watch |

---

## Dependencies across phases

```txt
Phase A (listing, provenance)
    ↓
Phase E (insights) ──→ G7, G8
Phase B (timeline/cache series) ──→ G2, G3, G6
Phase C (graph analytics) ──→ G8
api-chain (timings) ──→ G8 cache diagnostics
```

---

## Risks

| Risk | Mitigation |
|------|------------|
| Feature sprawl | Only metrics derivable from snapshots |
| Stale cache misleading trends | Show `generatedAt`, cache hit rate |
| CI without cache | `trend`/`timeline` warm explicitly; document cold-run cost |
| Competing with validate | Health score supplements, never replaces exit 1 |

---

## Future extensions

- Monorepo: multiple packages in one cache root (config evolution).
- Compare two repos’ public surfaces (diff snapshots from different projects).
- Integration with package publish CI (run on `prepublishOnly`).

---

## Recommended execution order

**After Phases A–E are substantially complete:**

1. **G3** Churn + **G4** Namespace growth (diff/timeline hooks).
2. **G2** Velocity (trend/timeline summaries).
3. **G7** Public surface view (inventory flag).
4. **G1** Health score (validate extension).
5. **G6** Series export + **G8** Report bundle.

Estimated: **ongoing** — one metric family per PR; no big-bang release.

---

## Success criteria

expgov observability evolution succeeds when:

- Every metric traces to `inventory.full.json` fields.
- No new persistent store beyond `.exports/cache/`.
- `validate` remains the CI gate; observability commands are opt-in.
- Human output stays information-dense, not noisy (Phase F rules).
