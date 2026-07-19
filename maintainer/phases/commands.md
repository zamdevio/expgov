# Commands phase

**Status:** Active — core verbs shipped; `doctor` wired.

**Purpose:** CLI command → core mapping and roadmap.

Companion: [`../systems/principles.md`](../systems/principles.md) · [`active-phase.md`](./active-phase.md)

---

## Command principles

Commands are user workflows. Core `run*` functions are the engine entrypoints.

```txt
CLI handler              Core entry
-----------              ----------
init                     runInit + ensureConfig (CLI)
inventory [ref]          runInventory
diff [range]             runDiff
validate                 runValidate
doctor                   runDoctor
suggest                  runSuggest
fix <subcommand>         runFix (planned — see fix.md)
config [show|export|convert]  runConfig* (planned — config.md)
trend                    runTrend
timeline [range]         runTimeline
graph [ref]              runGraph
help [topic]             printCliHelp (Commander + commandHelp extras)
```

Handlers live in `packages/cli/bin/cli.ts` (except `init` → `commands/init/`).

---

## Command lifecycle

| Stage | Meaning |
|-------|---------|
| Planned | Documented only |
| Wired | CLI + core exist |
| Stable | UX and contracts locked |

Governance commands are **read-only** except `init` (writes config). Planned **`fix`** subcommands apply remediation — see [`fix.md`](./fix.md); `suggest` stays read-only.

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
| `doctor` | Config discovery, cache dir, gitignore, tsconfig/npm drift hints |
| `suggest` | Suggest tier/config fixes (read-only) |

### Planned — [`config.md`](./config.md)

| Command | Role |
|---------|------|
| `config` / `config show` | Resolved config + barrel/tier metadata (read-only) |
| `config export` | Write `expgov.config.json` or `--stdout` |
| `config convert` | Transform between supported `expgov.config.*` extensions (`ts ↔ json` v1) |

Optional alias: `expgov export` → `config export`. Barrel formats (`index.mjs`, …) are **not** `config convert` — see [`sourceProfiles.md`](./sourceProfiles.md).

### Planned — [`fix.md`](./fix.md)

| Subcommand | Role | Status |
|------------|------|--------|
| `fix tags` | Inject `@sdkTier` on declarations | v1 |
| `fix config` | Merge tier allowlist / policy snippets into `expgov.config.ts` | v2 |
| `fix subpath` | Move flat exports to published subpaths | Postponed |
| `fix tsconfig` | Sync tsconfig paths with npm exports | Postponed |
| `fix promote` | Reclassify symbols to another tier bucket | Postponed |

Global flags: `-C/--cwd`, `--config`, `-j/--json`, `-q/--quiet`, `-s/--silent`, `--no-color`, `-y/--yes`.

Per-command: `-v/--verbose`, `-f/--force`, `--no-cache` where applicable.

---

## Future commands (deferred)

`fix` — [`fix.md`](./fix.md). `config` — [`config.md`](./config.md). See [`active-phase.md`](./active-phase.md) backlog.

---

## Operator usage (dogfood)

From repo root after `pnpm build`:

```bash
expgov validate
expgov inventory
expgov diff HEAD
```

Config: root `expgov.config.ts` targeting `@expgov/core`.
