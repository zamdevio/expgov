---
description: "expgov command reference — init, inventory, diff, validate, doctor, suggest, trend, timeline, and graph with links to detailed pages."
---

# Commands

All governance commands are **read-only** except `init` (writes `expgov.config.ts`).

| Command | Description |
|---------|-------------|
| `expgov` | Show help (default) |
| `expgov help [cmd]` | Help for a command or global options |
| [`init`](./init.md) | Scaffold `expgov.config.ts` |
| [`inventory`](./inventory.md) | Barrel snapshot — flat count, tiers, namespaces |
| [`diff`](./diff.md) | Compare export surfaces between refs |
| [`validate`](./validate.md) | Governance checks (exit 0/1) |
| [`doctor`](./doctor.md) | Setup hygiene — config paths, cache gitignore |
| [`suggest`](./suggest.md) | Dry-run tier allowlist hints |
| [`trend`](./trend.md) | Export counts across release tags |
| [`timeline`](./timeline.md) | Git log of barrel edits |
| [`graph`](./graph.md) | Export surface graph and analytics |

## Shared options

All commands accept [flags](../cli/flags.md) (`--json`, `--quiet`, cache, cwd, config).

Listing commands also accept `-T/--top` and `-F/--full`. See [Flags](../cli/flags.md).

## Choose a command

| Goal | Start with |
|------|------------|
| First-time setup | `init` → `inventory` → `validate` |
| See current export surface | `inventory` or `graph` |
| Compare before release | `diff` or `trend` |
| Enforce tier rules | `validate` |
| Fix unclassified exports | `suggest` → edit config → `validate` |
| Barrel commit history | `timeline` |
| Environment checks | `doctor` |

Narrative walkthroughs: [Workflows](../guides/workflows.md).

## Related

- [CLI overview](../cli/README.md)
- [JSON output](../cli/json.md)
- [Governance model](../governance.md)
