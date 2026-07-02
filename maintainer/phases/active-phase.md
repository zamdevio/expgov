# Active sprint

**Shipped receipts:** [`../shipped/README.md`](../shipped/README.md)

**Roadmap:** [`commands.md`](./commands.md) · **Principles:** [`../systems/principles.md`](../systems/principles.md)

**Engineering maps:** [`../systems/README.md`](../systems/README.md)

---

## Focus now — Phase C (Graph 2.0)

**Doc:** [`graph-2.md`](./graph-2.md)

Phase B (Timeline 2.0) is complete — B1–B5 shipped. Series metrics live in the default Summary block.

---

## Phase B — Timeline 2.0 (complete)

**Doc:** [`timeline-2.md`](./timeline-2.md) · **Command:** `packages/core/src/commands/timeline.ts` · **Ranges:** `packages/core/src/time/ranges.ts`

**v1 already shipped:** time windows (`@4w`, `@3m`, ISO dates), flat Δ table, insights (P17), warm log (P20).

| # | Slice | Status | Goal |
|---|-------|--------|------|
| 1 | **B1** — Ref ranges | **Shipped** | `timeline v1.0.0..HEAD` / tag..tag — same grammar as `diff` |
| 2 | **B2** — Release markers | **Shipped** | Dim `── v1.1.0 ──` rows when commit matches version tag |
| 3 | **B3** — Per-step metadata | **Shipped** | `diffSnapshots` step meta; `-v` shorthand; JSON `rows[].step` |
| 4 | **B4** — Summary block | **Shipped** | API growth, largest expansion/reduction, most active period, release jump |
| 5 | **B5** — Cache insights | **Shipped** | Folded into default `data.summary` / Summary block (no flag) |

**B1 exit (shipped):**

- [x] `parseTimelineRange` accepts ref ranges (`..`) via `splitRangeToken` / `gitRevParse`
- [x] Single ref `timeline v1.0.0` → commits from tag to HEAD (symmetric to `diff`)
- [x] Time tokens (`@4w`, ISO week, date range) unchanged
- [x] `listBarrelCommitsByRef` for `git log left..right -- <barrelPath>`
- [x] Human + `--json` output; help + [`commands.md`](./commands.md) updated
- [x] Gate: `pnpm build`, `typecheck`, `test`, `expgov validate`

**B2 exit (shipped):**

- [x] `indexVersionTagsByCommit()` maps `git.tagPattern` tags to commit SHAs
- [x] Dim `── v1.0.0 ──` marker row below tagged barrel commits (default: highest tag; `-v`: all tags)
- [x] JSON `data.rows[].tags` on timeline rows
- [x] Tests: `timelineReleaseMarkers.test.ts`

**B3 exit (shipped):**

- [x] Light timeline snapshots include flat symbol names (cache auto-rebuild when stale)
- [x] `computeTimelineStepMeta(newer, older)` — added/removed, namespace/subpath/tier deltas
- [x] JSON `data.rows[].step`; human `-v` shorthand (`+2 −1 ns +1`)
- [x] Tests: `timelineStepMeta.test.ts`

**B4 exit (shipped):**

- [x] `computeTimelineSummary(rows, range)` — API growth, step peaks, 7d active window, release jump
- [x] Human `Summary` block (padLabel rows) after commit table; JSON `data.summary`
- [x] Tests: `timelineSummary.test.ts`

**B5 exit (shipped — folded into Summary, no flag):**

- [x] Symbol export churn, namespace net, tier movement from `rows[].step`
- [x] Stable ratio, category shift, largest module shift from cached rollups
- [x] Cache coverage counts (`hit` / `refresh` / `miss`) on warmed snapshots

**Phase B complete when:** B1–B5 done.

Check [`../shipped/README.md`](../shipped/README.md) before re-implementing listing, help, cache, or insights.

---

## Program backlog (after Phase B)

Work top-to-bottom once Phase B rows above are done.

| # | Slice | Goal | Doc |
|---|-------|------|-----|
| 1 | Phase **C** — Graph 2.0 | Namespace-first graph, analytics, filters | [`graph-2.md`](./graph-2.md) |
| 2 | Phase **D** — API chain | Execution introspection / tier rule trace | [`../api-chain.md`](../api-chain.md) |
| 3 | Phase **F** — CLI output audit | UX audit receipt; close gaps | [`cli-output-audit.md`](./cli-output-audit.md) |
| 4 | Phase **G** — Long-term observability | Metrics over cached snapshots | [`../systems/observability.md`](../systems/observability.md) |
| 5 | **Severity** | Policy `severity` rule, graded `issues[]`, preview + `-ns` on triggers | [`severity.md`](./severity.md) |
| 6 | **Suggest** | Suggestion engine, full fixes, `-k` / `-d` filters | [`suggest.md`](./suggest.md) |
| 7 | **Fix** | Apply fixes (`fix tags`, `fix config`); hard subcmds postponed | [`fix.md`](./fix.md) |
| 8 | **Config** | `config show` / `export` / `convert`, parse layer, JSON load | [`config.md`](./config.md) |
| 9 | **Issues** | `issues/` registry, doc links, `issues[]` parity | [`issues.md`](./issues.md) |
| 10 | **Multibarrel** | Multi-entry API surface, deep scans, workspace | [`multibarrel.md`](./multibarrel.md) |

**One slice per PR** — focus Phase C before starting D.

---

## Deferred (unscheduled)

| Slice | Why deferred |
|-------|----------------|
| Auto-fix PR bot | Needs stable `fix tags` / `fix config` — blocked on [`fix.md`](./fix.md) |
| `fix subpath` / barrel moves | Dedicated engine + parser; postponed in [`fix.md`](./fix.md) until upstream stable |
| JSON config (`expgov.config.json`) | [`config.md`](./config.md) — export before load; TS stays primary |
| Remote / shared cache | Local `.expgov/cache` only — see [`../systems/cache.md`](../systems/cache.md) |
| Source profiles (H-src) | Barrel formats only — [`sourceProfiles.md`](./sourceProfiles.md) |
| Multibarrel / workspace | [`multibarrel.md`](./multibarrel.md) — MB4 after MB1–MB3 |
| SDK monorepo example (I2) | I1 + I3 shipped — see [`../shipped/examples-sdk.md`](../shipped/examples-sdk.md) |

---

## Guiding rules

- **Config is TypeScript first:** `expgov.config.ts` via jiti — JSON load planned ([`config.md`](./config.md)).
- **Core purity:** `packages/core` never imports CLI, prompts, or chalk.
- **CLI is thin:** Commander host, banners, help colorization, `init` prompts only.
- **Tier sources:** `@sdkTier` JSDoc + nested config buckets — see [`systems/tiers.md`](../systems/tiers.md).

---

## Where detail lives

| Need | Doc |
|------|-----|
| What shipped, when | [`../shipped/README.md`](../shipped/README.md) |
| Command contracts | [`commands.md`](./commands.md) |
| Tiers, cache, CLI, config | [`../systems/`](../systems/README.md) |
| Agent layout + import rules | [`agents/architecture.md`](../agents/architecture.md) |
