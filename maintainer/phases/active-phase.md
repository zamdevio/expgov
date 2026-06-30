# Active sprint

**Shipped receipts:** [`../shipped/README.md`](../shipped/README.md)

**Roadmap:** [`commands.md`](./commands.md) · **Principles:** [`../systems/principles.md`](../systems/principles.md)

**Engineering maps:** [`../systems/README.md`](../systems/README.md)

**Observability program:** [`observability-roadmap.md`](./observability-roadmap.md) (B/C open; A/E shipped)

---

## Focus now — Phase B (Timeline 2.0)

**Doc:** [`timeline-2.md`](./timeline-2.md) · **Command:** `packages/core/src/commands/timeline.ts` · **Ranges:** `packages/core/src/time/ranges.ts`

**v1 already shipped:** time windows (`@4w`, `@3m`, ISO dates), flat Δ table, insights (P17), warm log (P20).

| # | Slice | Status | Goal |
|---|-------|--------|------|
| 1 | **B1** — Ref ranges | **Shipped** | `timeline v1.0.0..HEAD` / tag..tag — same grammar as `diff` |
| **→ 2** | **B2** — Release markers | **Next PR** | Dim `── v1.1.0 ──` rows when commit matches version tag |
| 3 | **B3** — Per-step metadata | Pending | `diffSnapshots` shorthand (+added −removed ns) on `-v` / JSON |
| 4 | **B4** — Summary block | Pending | API growth, largest expansion/reduction, most active period |
| 5 | **B5** — Cache insights | Optional | Cache-derived series metrics or `--cache-insights` flag |

**B1 exit (shipped):**

- [x] `parseTimelineRange` accepts ref ranges (`..`) via `splitRangeToken` / `gitRevParse`
- [x] Single ref `timeline v1.0.0` → commits from tag to HEAD (symmetric to `diff`)
- [x] Time tokens (`@4w`, ISO week, date range) unchanged
- [x] `listBarrelCommitsByRef` for `git log left..right -- <barrelPath>`
- [x] Human + `--json` output; help + [`commands.md`](./commands.md) updated
- [x] Gate: `pnpm build`, `typecheck`, `test`, `expgov validate`

**Phase B complete when:** B1–B4 done (B5 optional / defer with reason in `timeline-2.md`).

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

**One slice per PR** — finish the current Phase B row before starting C.

---

## Deferred (unscheduled)

| Slice | Why deferred |
|-------|----------------|
| Auto-fix PR bot | Needs stable `suggest` output + policy; out of scope for dry-run CLI |
| JSON config (`expgov.config.json`) | Config-as-code only — see [`../systems/principles.md`](../systems/principles.md) |
| Remote / shared cache | Local `.expgov/cache` only — see [`../systems/cache.md`](../systems/cache.md) |
| Source profiles (H) | `.ts` sufficient for v1 — see [`sourceProfiles.md`](./sourceProfiles.md) |
| SDK monorepo example (I2) | I1 + I3 shipped — see [`../shipped/examples-sdk.md`](../shipped/examples-sdk.md) |

---

## Guiding rules

- **Config is TypeScript only:** `expgov.config.ts` via jiti — no JSON config.
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
