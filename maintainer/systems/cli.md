# CLI host subsystem

## Purpose

Thin Commander host — argv, banners, help colorization, init prompts. No domain logic.

## Stack

| Piece | Library |
|-------|---------|
| Args | `commander` v12 |
| Colors | `chalk` v5 + `configureStyle` |
| Prompts | `@inquirer/prompts` (init only) |
| Build | `tsup` at repo root |
| Dev | `tsx packages/cli/bin/cli.ts` |

## Global flags

| Flag | Role |
|------|------|
| `-j, --json` | Machine envelope on stdout |
| `-q, --quiet` | Suppress info/tips; keep primary report |
| `-s, --silent` | Suppress human output except errors + `--json` |
| `-C, --cwd` | Project root |
| `-c, --config` | Path to `expgov.config.ts` |
| `-pn, --package-name` | Override package name |
| `-cd, --cache-dir` | Override `cache.dir` |
| `-ncl, --no-color` | Plain output (also `NO_COLOR`, non-TTY) |
| `-nlg, --no-log-prefix` | Omit `[expgov]` log prefix |
| `-nlc, --no-log-channel` | Omit info/warn/tip channel tags |
| `-y, --yes` | Non-interactive init |

Per-command list flags (`inventory`, `diff`, `graph`, `trend`, `timeline`, `validate`, `suggest`, `doctor`): `-T, --top <n>` (default 10, min 1), `-F, --full`.

Color is on for TTY stdout; disable with `--no-color` or `NO_COLOR`. JSON mode never applies ANSI.

Bare `expgov` (no subcommand) prints root help and exits **0** (i18nprune-style default action).

## Listing contract (shipped P6, P15)

- Shared helper: `packages/core/src/shared/listing.ts` — `resolveListLimit`, `limitList`, `formatListTruncationHint`.
- Default cap: 10 rows; `-F` removes cap; truncation hint: `…and N more (use -F/--full or -T/--top <n>)`.
- Applied in report layer (`logger/reports/*`), including diff tier violations, custom tier deltas, inventory custom tier rollup rows, suggest names, and doctor check lines.

## Output flow

```txt
core command → report/meta events
             → meta block (ref or from/to with short sha where applicable)
             → (timeline) warm section below meta
             → insights block (Phase E, when present)
             → finishCommand → tips + footer (summary + command · status · ms)
             → createConsoleLogSink
             → stdout/stderr
```

**Meta endpoint format:** `label (abc1234)` via `formatMetaEndpoint` in `logger/report.ts` — shared by diff, timeline ref ranges, inventory/graph `ref`, trend tag window, validate/suggest worktree, doctor `HEAD`.

Policy gates: `packages/core/src/runtime/policy.ts`

## Footer

After the report body, `finishCommand` emits optional `summary: key=val · …` then a blank line and `expgov  <command> · ok|fail · Nms`. Skipped under `--json` / `--silent`.

## Help (shipped P14)

- `configureCliHelp.ts` — colorized Commander help (box header + Usage/Options)
- `printCliHelp.ts` — bare `expgov`, `expgov help`, `expgov -h` / `--help`, usage errors; root help includes **Workflows** via `formatHelp`
- `commandHelp.ts` — per-command `Examples`, `Range formats` (diff/timeline), and `Related` merged in `formatHelp` (before colorize)
- Range grammar lines reuse core `formatTimelineRangeHelp` / `formatGitCommitRangeHelp` (same source as invalid_range suggestions)
- `expgov help <cmd>` ≡ `expgov <cmd> -h`
- Core `printHelp` — programmatic/SDK export only; CLI does not call it for interactive help
- `(default: …)` segments use `style.highlight` (bright yellow)
- Box header skipped when `--json` or `--silent`; root program name skipped in per-command banners

**Workflows appendix** (root help only):

```txt
New export surface     init → inventory → validate
Release review         trend → diff v1..v2 → validate
API archaeology        timeline @3m → diff <sha>..HEAD
Dependency map         graph → inventory -v
```

## Insights (Phase E — shipped)

Module: `packages/core/src/insights/`. Renderer: `logger/reports/insights.ts` (`◇` prefix, before footer).

| Command | Shipped insights |
|---------|------------------|
| `inventory` | Largest module (edges), median flats/module, unclassified warnings |
| `validate` | Hot spot / worst subpath on failure; internal/advanced counts on `-v` |
| `diff` | Module edge delta, tier movement, new advanced, truncated add/remove samples |
| `trend` | Largest tag-pair jump/drop, stable % shift |
| `graph` | Densest module, fan-out, category mix; Summary: edge density, hottest module (C2) |
| `timeline` | Flat churn, busiest week (insights); Summary: API growth, symbol churn, cache coverage (B4–B5) |

JSON: additive `data.insights`. Shown under `--quiet`; suppressed under `--silent`. Max 5 lines per command.

## Timeline warm log (shipped P20)

- Collector: `packages/core/src/timeline/warmer.ts` — records per-commit cache warm timings.
- Renderer: `logger/reports/timeline/warm.ts` — prints **below** meta rows, before commit table.
- Default: `Snapshot warm` with **latest** commit line + `warmed` summary; no stderr spinner.
- `-v`: all per-commit `· N/M  <sha>  <cache>  <ms>` lines under `Snapshot warm`, then `warmed` summary.
- JSON: `data.warmStats` with `{ warmed, totalMs, entries[] }`.

## Banners

`maybePrintCommandBanner` — one box per command (off for json/silent/root default-action help).

## Init

`packages/cli/src/commands/init/run.ts` — file write + guidance tips via `coreLogTip`.

## Short aliases (shipped P6)

Canonical long forms in help/JSON; short flags secondary. Cache: `-f` force, `-nch` no-cache. List: `-T` top, `-F` full.
