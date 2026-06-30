# Phases — maintainer hub

**Not user docs** — `maintainer/phases/` is contributor-only.

---

## Start here

| Doc | Role |
|-----|------|
| [`active-phase.md`](./active-phase.md) | **Current sprint + ordered backlog** |
| [`../shipped/README.md`](../shipped/README.md) | **Closed work** — ISO week timeline + receipts |
| [`commands.md`](./commands.md) | Command roadmap — wired verbs + deferred future commands |

Scratch / spikes: **`maintainer/temp/`** (gitignored).

---

## Lifecycle

1. Scope from **`active-phase.md`** only — one slice per PR.
2. On ship: add a row to [`shipped/README.md`](../shipped/README.md) (ISO week + receipt); fold durable notes into [`systems/`](../systems/) and [`shipped/`](../shipped/README.md); **delete or trim** the phase plan doc.
3. Session noise → **`maintainer/temp/`** only.

---

## Open phase plans

| Doc | Phase |
|-----|-------|
| [`timeline-2.md`](./timeline-2.md) | B — Timeline 2.0 |
| [`graph-2.md`](./graph-2.md) | C — Graph 2.0 |
| [`../api-chain.md`](../api-chain.md) | D — API chain |
| [`cli-output-audit.md`](./cli-output-audit.md) | F — CLI output audit |
| [`severity.md`](./severity.md) | Severity — policy rule, graded issues, preview + `-ns` on triggers |
| [`suggest.md`](./suggest.md) | Suggest — engine, full fixes, `-k` / `-d` filters |
| [`fix.md`](./fix.md) | Fix — apply subcommands (`tags`, `config`; subpath postponed) |
| [`config.md`](./config.md) | Config — show, export, convert, parse layer, JSON load |
| [`multibarrel.md`](./multibarrel.md) | Multi-entry API surface (root + subpaths, workspace) |
| [`issues.md`](./issues.md) | Issues — `issues[]` registry + doc links (i18nprune-style) |
| [`sourceProfiles.md`](./sourceProfiles.md) | H — Source profiles (barrel module formats) |
| [`test-expansion.md`](./test-expansion.md) | Test coverage backlog |

**Removed after ship:** Phase E (`rich-command-metadata.md`) → [`shipped/runtime-cli.md`](../shipped/runtime-cli.md) P17. Phase I plan → [`shipped/examples-sdk.md`](../shipped/examples-sdk.md). Timeline B1–B3 detail → [`shipped/git-commands.md`](../shipped/git-commands.md) + trimmed [`timeline-2.md`](./timeline-2.md). Program index (`observability-roadmap.md`) — folded into [`active-phase.md`](./active-phase.md).
