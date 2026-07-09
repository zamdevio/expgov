---
description: "expgov CLI flags — --json, --quiet, --silent, cwd/config overrides, cache, list truncation, and color controls."
---

# Flags

All governance commands accept these flags. Per-command flags (`-v`, `-f`, `-nch`) are documented on each [command page](../commands/README.md).

| Flag | Role |
|------|------|
| `-j, --json` | Machine-readable JSON envelope on stdout |
| `-q, --quiet` | Suppress info logs and tips; keep primary report |
| `-s, --silent` | Suppress human output except errors and `--json` |
| `-C, --cwd` | Project root |
| `-c, --config` | Path to `expgov.config.ts` |
| `-pn, --package-name` | Override package name |
| `-cd, --cache-dir` | Override cache directory |
| `-ncl, --no-color` | Plain output (`NO_COLOR` env, non-TTY also disable color) |
| `-nlg, --no-log-prefix` | Omit `[expgov]` log prefix |
| `-nlc, --no-log-channel` | Omit info/warn/tip channel tags |
| `-y, --yes` | Non-interactive `init` |

## List flags

Applies to `inventory`, `diff`, `graph`, `trend`, `timeline`, `validate`, `suggest`, `doctor`:

| Flag | Role |
|------|------|
| `-T, --top <n>` | Cap list rows (default 10, min 1) |
| `-F, --full` | No truncation |

## Cache (working tree)

Snapshots for uncommitted state live under `.expgov/cache/__worktree__/`. expgov tracks barrels, re-export chains, config, and scanned modules in `files.json`.

| Mode | Behavior |
|------|----------|
| Default | Correct freshness; `cache: hit` in JSON when reused |
| `-f/--force` | Rebuild this run (still writes unless `--no-cache`) |
| `-nch/--no-cache` | Bypass read and write (debug/CI) |

Commit/SHA refs use immutable per-SHA cache dirs.

## Insights

Several commands append an **Insights** block before the footer — largest module, diff deltas, trend jumps, validate hot spots, etc. Available as `data.insights` in `--json`. Suppressed under `--silent`.

Commands with insights: `inventory`, `validate` (failure or `-v`), `diff`, `trend`, `graph`, `timeline`.

## Related

- [JSON output](./json.md)
- [CLI overview](./README.md)
- [Governance model](../governance.md)
