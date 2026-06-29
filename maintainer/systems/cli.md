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

Per-command list flags (inventory, diff, graph, trend, timeline): `-T, --top <n>` (default 10, min 1), `-F, --full`.

Color is on for TTY stdout; disable with `--no-color` or `NO_COLOR`. JSON mode never applies ANSI.

## Output flow

```txt
core command → report/meta events
             → finishCommand → tips + footer (summary + command · status · ms)
             → createConsoleLogSink
             → stdout/stderr
```

Policy gates: `packages/core/src/runtime/policy.ts`

## Footer

After the report body, `finishCommand` emits optional `summary: key=val · …` then a blank line and `expgov  <command> · ok|fail · Nms`. Skipped under `--json` / `--silent`.

## Help

- `configureCliHelp.ts` — colorized Commander help (box header + Usage/Options)
- `printCliHelp.ts` — `expgov help` / usage errors; root help appends **Workflows** appendix
- `commandHelp.ts` — per-command `Examples` / `Related` via `addHelpText`
- `expgov help <cmd>` ≡ `expgov <cmd> -h`
- Core `printHelp` — programmatic only; CLI does not use it for interactive help
- `(default: …)` segments use `style.highlight` (bright yellow)
- Box header skipped when `--json` or `--silent`

## Banners

`maybePrintCommandBanner` — one box per command (off for json/silent).

## Init

`packages/cli/src/commands/init/run.ts` — file write + guidance tips via `coreLogTip`.
