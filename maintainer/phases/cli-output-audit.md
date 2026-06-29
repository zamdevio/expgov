# Phase F — CLI Output Audit

**Status:** Planning only — complete UX review of human output.

**Companion:** [`../systems/cli.md`](../systems/cli.md) (Phase A shipped)

---

## Goals

Document every improvement opportunity across expgov human output: spacing, alignment, headers, summaries, terminology, tips, verbosity, visual hierarchy, and information density.

This document is the **audit receipt** — implementation tracked via Phase A/E and per-command PRs.

---

## Audit methodology

Reviewed artifacts:

- `packages/core/src/logger/index.ts` — all `print*Report` formatters
- `packages/core/src/runtime/footer.ts`, `log.ts`, `emitter.ts`
- `packages/cli/src/utils/cli/banner.ts`, `configureCliHelp.ts`
- `packages/core/src/help/index.ts`
- Command hosts in `packages/core/src/commands/*`

Output flow reference:

```txt
banner (CLI) → meta rows → report body → verbose sections → insights (Phase E) → tips → summary/footer
```

---

## Global conventions (current vs target)

| Aspect | Current | Issue | Target |
|--------|---------|-------|--------|
| Report indent | 7 spaces (`       `) | Consistent but undocumented | Document as `REPORT_INDENT`; use constant |
| Label width | `padLabel(..., 10)` | Some 14-wide labels in subpaths | Standardize 12 or auto-pad to max label |
| Section headers | `chalk.bold.dim('       Title')` | Good hierarchy | Keep; add blank line before every section |
| Meta rows | `emitLog({ type: 'meta' })` | Rendered via sink — verify alignment | Keys left-aligned, values dim |
| Footer | `expgov  cmd · ok · Nms` | Shipped P2a | Add space normalization (`expgov` vs `expgov  `) |
| Error output | `printExportError` | Uses header/meta | Match report indent |
| JSON mode | Suppresses human | Good | Document `meta` vs `data` split in user docs |

---

## Per-command audit

### `inventory`

| Item | Finding | Recommendation |
|------|---------|----------------|
| Meta block | ref, barrel, cache, generated, edges, subpaths | Add `symbols` count to meta for parity with graph |
| Root tiers | Clear | Add namespace count to footer counts |
| Top categories | Hard cap 4, no hint | Phase A: default 10 + truncation hint |
| SDK-wide tiers | Duplicates root when no subpaths | Dim note when subpaths empty: “no published subpaths” |
| Verbose symbols | `[fallback]` vague | Phase A provenance |
| Column alignment | Name width 30 in format.ts | Verbose: align tier/category columns with header row |
| Terminology | “root flat” vs “flat” | Glossary: *root flat* = direct exports on barrel |

---

### `diff`

| Item | Finding | Recommendation |
|------|---------|----------------|
| Range meta | Good left/right/cache | Show barrel path once |
| Delta lines | Color semantics (+ yellow, − green) | Document: growth warning vs shrink ok |
| Added/removed | Unbounded list | Phase A `--top`; sort alpha (keep) |
| Empty state | “No flat export additions” | Add “namespaces not compared” reminder |
| Tier violations | Always full list | Good for governance |
| Verbose detail | Arrow `name → tier · cat` | Use consistent `·` separator (match inventory) |
| Missing insight | No module delta | Phase E |

---

### `validate`

| Item | Finding | Recommendation |
|------|---------|----------------|
| Pass state | Green checks concise | Good |
| Fail state | Red ✗ per violation | Group by category: tsconfig / tier / subpath |
| Notes truncation | 5 max | Phase A: use `--top` for notes |
| Terminology | “fallback” in notes | Phase A provenance |
| Verbose flat leaks | Lists internal/advanced symbols | Good; add count in section header |
| Exit code | 1 on fail | CI docs (deferred user docs) |

---

### `trend`

| Item | Finding | Recommendation |
|------|---------|----------------|
| Table header | dim aligned columns | Good |
| Cache per row | `(hit)` dim suffix | Move to `-v` only to reduce noise |
| Empty state | No v* tags | Suggest `git.tagPattern` config |
| Δ footer | first→last only | Phase E: max jump between consecutive tags |
| `--tags` naming | Not `--top` | Phase A: document `--tags` = fetch window, `--top` = display |

---

### `timeline`

| Item | Finding | Recommendation |
|------|---------|----------------|
| Δ legend | Long dim line before table | Good — move to `expgov help timeline` example block |
| Column alignment | date/sha/flat/Δ/subject | SHA width 7 vs 9 header — align |
| Subject truncation | 48 chars | Phase A: `--full` subjects |
| Warm progress | stderr `\r` spinner | Route through emitter; don’t mix with meta |
| `--limit` | Not `--top` | Alias per Phase A |
| Missing releases | No tag markers | Phase B |
| Row density | High | Optional `--no-delta` for narrow terminals (future) |

---

### `graph`

| Item | Finding | Recommendation |
|------|---------|----------------|
| Section order | subpath → subpaths rollup → namespaces → modules | Phase C: namespaces first |
| Limits | 12 / 15 / 8 inconsistent | Phase A: all `--top 10` |
| Namespace lines | `·` separators | Match inventory namespace verbose format |
| Module examples | verbose only, 5 symbols | Truncate with “+N symbols” |
| Title | “re-export map” | Rename subtitle: “export surface graph” |
| Meta | Missing namespace count | Add `namespaces: N` |

---

### `init`

| Item | Finding | Recommendation |
|------|---------|----------------|
| Output | tips via coreLogTip | Good |
| Banner | Box header | Consistent with other commands |
| Rich template | Commented tiers | Link to `maintainer/systems/tiers.md` in tip (maintainer only) |

---

### `help`

| Item | Finding | Recommendation |
|------|---------|----------------|
| Structure | Section per command | Phase A workflows |
| Global flags | Missing short aliases | Update after Phase A2 |
| Color | Uses chalk directly | OK in help path |
| Commander `--help` | Shorter than `expgov help` | Cross-ref in configureCliHelp epilog |

---

### Errors & hints

| Item | Finding | Recommendation |
|------|---------|----------------|
| `printHelpHint` | Generic `--help` | Topic from error `details.command` |
| `unknown_ref` | Suggests tags | Good |
| `invalid_range` | Timeline vs diff messages differ | Shared suggestion formatter |
| `EXPORTS_DEBUG` | stderr stack | Document in api-chain.md |

---

## Terminology glossary (proposed)

| Term | Meaning |
|------|---------|
| root flat | Direct named export on root barrel |
| namespace | `export * as Name` on root |
| target subpath | npm publish path (`@scope/pkg/foo`) |
| governance map | graph view grouped by policy |
| hit / miss / refresh / bypass | cache statuses |
| SDK-wide | root + published subpath rollups |
| Δ | delta between compared snapshots |
| provenance | rule that assigned tier/category |

Publish in user `docs/` when written; reference from help.

---

## Visual hierarchy rules (target)

1. **Meta** — context (ref, cache, range): dim values.
2. **Primary metrics** — white or tier-colored numbers.
3. **Section titles** — bold dim.
4. **Lists** — bullet `·` or `+`/`-` for diffs.
5. **Insights** (Phase E) — dim block, `◇` prefix optional.
6. **Tips** — `[tip]` channel, cyan accent.
7. **Footer** — dim counts + command status.

Avoid bold + bright color on same line (competing focal points).

---

## Spacing rules (target)

- One blank line before first report section after meta.
- One blank line between major sections.
- No blank line between table header and first row.
- Footer preceded by single blank line (shipped).

---

## Verbosity layers

| Layer | Flag | Content |
|-------|------|---------|
| Default | — | Meta + primary + insights (Phase E) |
| Quiet | `-q` | Suppress tips/info; keep report + footer |
| Verbose | `-v` | Symbol tables, cache detail, full subjects |
| Trace | `-v` + api-chain | Execution pipeline (Phase D) |
| Silent | `-s` | Errors only |
| JSON | `-j` | Envelope only |

Document layer matrix in `systems/cli.md`.

---

## Information density guidelines

- **Never noisy:** cache status per row only in `-v` (trend).
- **Always answer:** footer counts + Phase E insights (3 lines max).
- **Truncate with agency:** show count remainder + flag to expand.
- **Provenance over mystery:** no `[fallback]` without rule name (Phase A).

---

## Implementation strategy

This audit does not ship code. Track fixes as:

| Audit area | Owning phase |
|------------|--------------|
| Listing limits | Phase A |
| Provenance / terminology | Phase A |
| Namespace graph order | Phase C |
| Timeline/releases | Phase B |
| Insights | Phase E |
| Trace/stderr purity | api-chain.md |
| Glossary | User docs sprint |

---

## Dependencies

Phase F is **documentation of record** — implementation spans A–E and user docs.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Endless polish | Freeze rules after A+E; only fix regressions |
| Terminal width | `formatBoxHeader` already caps; tables may wrap — accept |

---

## Future extensions

- Golden snapshot tests for CLI output (strip ANSI).
- `expgov test golden` maintainer command.
- Width-aware tables (`stdout.columns`).

---

## Recommended execution order

1. Adopt glossary + indent constants (small PR).
2. Execute Phase A (addresses majority of audit items).
3. Phase E insights (density without noise).
4. Phase B/C structural changes.
5. Golden output tests when output stabilizes.
