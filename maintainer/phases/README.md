# Phases — maintainer hub

**Not user docs** — `maintainer/phases/` is contributor-only.

---

## Start here

| Doc | Role |
|-----|------|
| [`active-phase.md`](./active-phase.md) | **Current sprint + ordered backlog** |
| [`../shipped/README.md`](../shipped/README.md) | **Closed work** — ISO week timeline + receipts |
| [`../systems/`](../systems/README.md) | Durable engineering maps (incl. [`release.md`](../systems/release.md)) |
| [`commands.md`](./commands.md) | Command roadmap — wired verbs + deferred future commands |
| Root [`CHANGELOG.md`](../../CHANGELOG.md) | User-facing release history (no releases portal) |

Scratch / spikes: **`maintainer/temp/`** (gitignored).

---

## Lifecycle

1. Scope from **`active-phase.md`** only — one slice per PR.
2. On ship: row in [`shipped/README.md`](../shipped/README.md); fold durable notes into [`systems/`](../systems/) and [`shipped/`](../shipped/); **delete** fully shipped phase plans; **trim** half-shipped plans (shipped table on top, remaining below).
3. Session noise → **`maintainer/temp/`** only.

---

## Open phase plans

| Doc | Status |
|-----|--------|
| [`agentic.md`](./agentic.md) | **Focus** — AG5 filters (+ AG6); AG1–4/7–8 shipped |
| [`diff.md`](./diff.md) | D1–D2 shipped; optional D3 `compatBaseline` |
| [`inventory-diagnostics.md`](./inventory-diagnostics.md) | ID1/ID2 planned |
| [`help.md`](./help.md) | HELP1 — small parallel slice |
| [`graph-2.md`](./graph-2.md) | C3 paused (align with AG5); C1–C2 shipped |
| [`../api-chain.md`](../api-chain.md) | D — API chain |
| [`cli-output-audit.md`](./cli-output-audit.md) | F — UX audit (mostly planning) |
| [`severity.md`](./severity.md) | After Diff/Agentic |
| [`suggest.md`](./suggest.md) | Suggest engine / filters |
| [`fix.md`](./fix.md) | Fix subcommands |
| [`config.md`](./config.md) | Config show/export/convert |
| [`multibarrel.md`](./multibarrel.md) | Multi-entry surface |
| [`issues.md`](./issues.md) | Issue code registry |
| [`sourceProfiles.md`](./sourceProfiles.md) | H — source profiles |
| [`test-expansion.md`](./test-expansion.md) | Test coverage waves |

**Deleted after full ship:** Release R1–R4 → [`shipped/release.md`](../shipped/release.md). **REL1–3** automation → [`systems/release.md`](../systems/release.md) (phase `releases.md` removed). Phase E → [`shipped/runtime-cli.md`](../shipped/runtime-cli.md). Phase I → [`shipped/examples-sdk.md`](../shipped/examples-sdk.md). Phase B → [`shipped/timeline.md`](../shipped/timeline.md). Graph C1–C2 → [`shipped/graph.md`](../shipped/graph.md).
