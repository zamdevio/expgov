# API Execution Chain — Execution Introspection

**Status:** Planning only.

**Filename:** `maintainer/api-chain.md` (this document)

**Companion:** [`systems/cli.md`](systems/cli.md) · [`agents/rules.md`](agents/rules.md) (core purity)

---

## Purpose

Explain **how expgov reached every conclusion** — not user-facing logging, but **maintainer execution introspection**.

Today `-v/--verbose` adds symbol tables, cache SHAs, and git stats. That is *output detail*, not a *pipeline trace*. The API chain documents a path to evolve verbose mode into a structured **execution pipeline** visible when debugging expgov itself, cache misses, or classification surprises.

---

## Goals

1. Name and document every stage from argv → envelope.
2. Plan trace events: timings, cache outcomes, parser/resolver phases, decisions.
3. Separate **provenance tracing** (why tier X?) from **performance tracing** (how long?).
4. Comply with core purity: no `console.*` in command paths — use `emitLog` / trace sink.
5. Provide JSON and human renderings of the same trace.

---

## Rationale

Maintainers and agent authors need to answer:

- Why was symbol `foo` classified `unclassified`?
- Why was cache `miss` when SHA should exist?
- Which phase dominated `timeline` warm time?

Current signals are fragmented:

| Signal | Location |
|--------|----------|
| `formatGitRunStats()` | verbose inventory/timeline |
| `printDiffCacheDetail` | verbose diff |
| `TimelineWarmer` stderr | warm progress (bypasses emitter) |
| `tierSource: tag \| fallback` | snapshot only |
| `EXPORTS_DEBUG` | unexpected stack traces |

A unified **execution chain** reduces debug time and supports Phase A provenance polish and Phase E rich metadata without ad hoc prints.

---

## Architecture considerations

### Pipeline stages (canonical)

```txt
1. Bootstrap        bootstrapRuntime, setRunOptions, configureStyle
2. Context          initProjectContext — config load (jiti), paths, tier rules
3. Ref resolve      resolveSourceRef / parseDiffRange / parseTimelineRange
4. Cache probe      readCachedForProfile → hit | miss | refresh | bypass
5. Source fetch     git show / worktree read — barrel + modules
6. Parse barrel     parseBarrelExports
7. Resolve exports  readModule, resolveSymbolKind, namespace binding
8. Tier classify    @sdkTier → config buckets → unclassified
9. Aggregate        buildRootSummary, subpath rollups, edges[]
10. Format          print*Report / JSON envelope
11. Finish          tips, footer, exit code
```

Commands subset this chain:

| Command | Stages |
|---------|--------|
| `validate` | 2, 5 (package.json/tsconfig), 8–9 (worktree snapshot), 10 |
| `diff` | 3, 4–9 ×2, diffSnapshots, 10 |
| `timeline` | 3, git log, 4–9 ×N, 10 |
| `graph` | 4–9, analytics (Phase C), 10 |

### Trace event model

```ts
interface TraceSpan {
  id: string;
  parentId?: string;
  phase: TracePhase;
  label: string;
  startedAt: number;
  durationMs?: number;
  status: 'ok' | 'skip' | 'error';
  detail?: Record<string, string | number | boolean>;
}

type TracePhase =
  | 'bootstrap' | 'context' | 'git' | 'cache' | 'parse'
  | 'resolve' | 'classify' | 'aggregate' | 'diff' | 'format';
```

Emit via `emitTrace(span)` — gated by `RunOptions.trace` (new) or `verbose` level 2 (`-vv` future).

### Sinks

| Mode | Rendering |
|------|-----------|
| Human | Indented tree after report (or stderr when `--trace-stderr`) |
| JSON | `meta.trace: TraceSpan[]` in envelope |
| Silent | trace to `EXPORTS_TRACE=1` file path (future) |

### Relationship to logging

| Concern | System |
|---------|--------|
| User tips, footer, branded `[expgov]` | `coreLog`, `emitLog` |
| Command report body | `emitLog({ type: 'report' })` |
| Execution introspection | `emitTrace` — never shown unless verbose/trace flag |

---

## Implementation strategy

### D1 — Trace infrastructure

**Motivation:** Without a bus, each command will re-instrument ad hoc.

**User value:** Consistent `-v` story across commands.

**Approach:**

1. Add `packages/core/src/runtime/trace.ts`:
   - `startSpan(phase, label)` / `endSpan(id, detail?)`
   - `withSpan(phase, label, fn)` helper
   - Ring buffer cap (e.g. 500 spans) for memory safety
2. Extend `RunOptions`: `trace: boolean` (default: follow `verbose` initially).
3. `createConsoleTraceSink` in CLI or core sink layer — render tree with dim ANSI.
4. Migrate `TimelineWarmer` to trace spans + `emitLog` raw stderr.

**Dependencies:** None.

**Complexity:** Medium.

**Risks:** Verbose output volume — default off except `-v`; tree collapsed to phases only, expand with `-vv`.

**Future extensions:** OpenTelemetry-compatible export (deferred).

---

### D2 — Cache and git timings

**Motivation:** Timeline slowness is often cache miss × git show.

**User value:** See `cache: miss 142ms` per SHA.

**Approach:** Wrap `getSnapshot`, `gitShowFile`, `runGit` hot paths with spans:

```txt
cache.read     hit · .exports/cache/abc…/inventory.full.json · 2ms
cache.build    miss · parse+resolve+classify · 89ms
git.show       packages/core/src/index.ts · 12ms
```

**Dependencies:** D1.

**Complexity:** Low–medium.

**Risks:** `runGit` wrapper must not break error handling.

**Future extensions:** Aggregate `meta.durationMs` breakdown in JSON.

---

### D3 — Parser and resolver timings

**Motivation:** Isolate TypeScript parse vs module I/O.

**Approach:** Spans around `parseBarrelExports`, `readModuleAtPath`, `resolveSymbolKind`, `classifySymbolTier`.

**Dependencies:** D1.

**Complexity:** Low.

**Risks:** Micro-timing noise — roll up under `inventory.build` unless `-vv`.

---

### D4 — Decision and provenance tracing

**Motivation:** “Why unclassified?” requires rule-level trace.

**User value:** Maintainer sees classification path per symbol in verbose trace.

**Approach:**

1. Extend tier classifier to emit **decision events** (not per-symbol in default verbose — sample or filter):

   ```txt
   classify  defineConfig → tiers.stable.exact match
   classify  runExportsInventory → tiers.internal.prefix /run/
   ```

2. Link to Phase A provenance strings.
3. Optional `--trace-symbol <name>` filter for single-export debug.

**Dependencies:** Phase A tier provenance refactor.

**Complexity:** Medium.

**Risks:** Sensitive path leakage — respect quiet/silent; JSON only in maintainer mode.

**Future extensions:** `expgov explain <symbol>` command wrapping trace for one symbol.

---

### D5 — Command pipeline diagrams in help

**Motivation:** Discoverability for maintainers.

**Approach:** `expgov help debug` or `help --maintainer` section listing pipeline per command (static text, not runtime).

**Dependencies:** D1–D4 stable names.

**Complexity:** Low.

---

## Dependencies

| Phase | Relationship |
|-------|--------------|
| Phase A provenance | D4 decision trace content |
| Phase B timeline | **Shipped** — warm log via report layer (`TimelineWarmer`, P20); see [`shipped/timeline.md`](../shipped/timeline.md) |
| Core purity rules | All trace via emitter/trace sink |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Output noise | Phase-only tree by default; details at `-vv` |
| Performance overhead | `performance.now()` only when trace enabled |
| JSON envelope size | Cap spans; optional `meta.traceSummary` |
| Leaking repo paths | Same policy as existing verbose inventory |

---

## Future extensions

- `EXPORTS_TRACE=file.jsonl` for CI artifacts.
- `doctor` includes last failed trace.
- Trace-driven regression tests (golden span sequences).
- Integration with Phase G observability metrics (p95 build time per repo).

---

## Recommended execution order

1. **D1** Trace bus + `TimelineWarmer` migration (fixes purity debt).
2. **D2** Cache/git spans.
3. **D3** Parse/resolver spans.
4. **D4** Decision tracing (after Phase A provenance).
5. **D5** Maintainer help section.

Estimated: **2 PRs** for D1–D3; **1 PR** for D4 after Phase A.

---

## Example target output

```txt
       Execution chain (verbose)
       ├─ context          expgov.config.ts · 4ms
       ├─ ref              HEAD → abc1234 · 2ms
       ├─ cache            miss · 1ms
       ├─ git              show index.ts · 11ms
       ├─ parse            barrel · 6 exports · 3ms
       ├─ resolve          12 modules · 34ms
       ├─ classify         80 symbols · 2ms
       └─ aggregate        summary + edges · 1ms
```

This is **maintainer introspection** — distinct from the user-facing inventory report above it.
