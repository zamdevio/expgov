# Phases — maintainer hub

**Not user docs** — `maintainer/phases/` is contributor-only.

---

## Start here

| Doc | Role |
|-----|------|
| [`active-phase.md`](./active-phase.md) | **Current sprint + ordered backlog** |
| [`../shipped/README.md`](../shipped/README.md) | **Closed work** — ISO week timeline + receipts |
| [`commands.md`](./commands.md) | Command roadmap — wired verbs + deferred future commands |
| [`observability-roadmap.md`](./observability-roadmap.md) | Program index (A/E shipped; B–G open) |

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
| [`sourceProfiles.md`](./sourceProfiles.md) | H — Source profiles (deferred) |
| [`test-expansion.md`](./test-expansion.md) | Test coverage backlog |

**Removed after ship:** Phase E (`rich-command-metadata.md`) → [`shipped/runtime-cli.md`](../shipped/runtime-cli.md) P17. Phase I plan → [`shipped/examples-sdk.md`](../shipped/examples-sdk.md).
