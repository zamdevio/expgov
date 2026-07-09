---
description: "expgov CLI overview — default help behavior, command families, output order, and links to global flags and JSON output."
---

# CLI overview

expgov is a single binary with explicit subcommands. Configuration is **TypeScript only** — `expgov.config.ts` at the project root (or `--config`).

## Default — help

```bash
expgov
expgov help
expgov help timeline
expgov timeline -h
```

Bare `expgov` (no subcommand) prints root help and exits `0`.

## Command families

| Family | Commands | Purpose |
|--------|----------|---------|
| Setup | `init` | Scaffold `expgov.config.ts` |
| Snapshot | `inventory`, `graph` | Current export surface |
| Compare | `diff`, `trend`, `timeline` | Surface change over refs or time |
| Enforce | `validate`, `suggest` | Tier rules and allowlist hints |
| Hygiene | `doctor` | Config paths, cache gitignore, drift hints |

Full reference: [Commands](../commands/README.md).

## Typical session

```bash
expgov init
expgov inventory
expgov validate
expgov diff HEAD
expgov timeline @4w
```

Step-by-step recipes: [Workflows](../guides/workflows.md).

## Flags

| Topic | Page |
|-------|------|
| [Flags](./flags.md) | `--json`, `--quiet`, cache, cwd, config |
| [JSON output](./json.md) | Machine-readable envelope |
| [SDK](../sdk/) | `@expgov/core` programmatic API |

## Output order (human mode)

```txt
banner → meta (ref / from·to / range) → report body → insights → tips → footer
```

Commands with a **meta** block: `inventory`, `diff`, `timeline`, `trend`, `graph`, `validate`, `suggest`, `doctor`.

Footer and banners are suppressed under `--json` and `--silent`.

## Related

- [Governance model](../governance.md)
- [Configuration](../config.md)
