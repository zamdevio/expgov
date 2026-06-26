# Commands phase

**Status:** Active — core verbs shipped; `doctor` deferred.

**Purpose:** CLI command → core mapping and roadmap.

Companion: [`architecture.md`](./architecture.md) · [`active-phase.md`](./active-phase.md)

---

## Command principles

Commands are user workflows. Core `runExports*` functions are the engine entrypoints.

```txt
CLI handler              Core entry
-----------              ----------
init                     runInit + ensureConfig (CLI)
inventory [ref]          runExportsInventory
diff [range]             runExportsDiff
validate                 runExportsValidate
trend                    runExportsTrend
timeline [range]         runExportsTimeline
graph [ref]              runExportsGraph
help [topic]             printHelp
```

Handlers live in `packages/cli/src/main.ts` (except `init` → `commands/init/`).

---

## Command lifecycle

| Stage | Meaning |
|-------|---------|
| Planned | Documented only |
| Wired | CLI + core exist |
| Stable | UX and contracts locked |

All governance commands are **read-only** except `init` (writes config).

---

## Wired commands (stable)

| Command | Role |
|---------|------|
| `init` | Scaffold `expgov.config.ts` |
| `inventory` | Root barrel export summary |
| `diff` | Compare export surfaces between refs |
| `validate` | tsconfig ↔ npm parity + tier governance (exit 1 on fail) |
| `trend` | Export counts across `v*` tags |
| `timeline` | Commits that edited root barrel |
| `graph` | Re-export governance map |

Global flags: `-C/--cwd`, `--config`, `-j/--json`, `-q/--quiet`, `-s/--silent`, `--no-color`, `-y/--yes`.

Per-command: `-v/--verbose`, `-f/--force`, `--no-cache` where applicable.

---

## Future commands (deferred)

| Command | Goal |
|---------|------|
| `doctor` | Config discovery, cache dir, gitignore, tsconfig/npm drift hints |
| `sync-tiers` | Suggest `tiers.stable.exact` additions from unclassified inventory (dry-run) |

---

## Operator usage (dogfood)

From repo root after `pnpm build`:

```bash
expgov validate
expgov inventory
expgov diff HEAD
```

Config: root `expgov.config.ts` targeting `@expgov/core`.
