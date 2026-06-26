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
| Dev | `tsx packages/cli/bin/expgov.ts` |

## Global flags

| Flag | Role |
|------|------|
| `-j, --json` | Machine envelope on stdout |
| `-q, --quiet` | Suppress info/tips; keep primary report |
| `-s, --silent` | Suppress human output except errors + `--json` |
| `-C, --cwd` | Project root |
| `--config` | Path to `expgov.config.ts` |
| `--no-color` | Plain output |
| `-y, --yes` | Non-interactive init |

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

- `configureCliHelp.ts` — colorized Commander help
- `(default: …)` segments use `style.highlight` (bright yellow)
- Box header skipped when `--json` or `--silent`

## Banners

`maybePrintCommandBanner` — one box per command (off for json/silent).

## Init

`packages/cli/src/commands/init/run.ts` — file write + guidance tips via `coreLogTip`.
