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

## Open phase plans (order matches [`active-phase.md`](./active-phase.md))

| Doc | Phase |
|-----|-------|
| [`diff.md`](./diff.md) | **Focus** — Diff fail gate (**D1 shipped**; D2 next) |
| [`agentic.md`](./agentic.md) | Agentic JSON completeness + flexible flags (AG3/AG4 owned by diff) |
| [`help.md`](./help.md) | HELP1 — small parallel help color hierarchy slice |
| [`graph-2.md`](./graph-2.md) | C — Graph 2.0 (C3 paused; align filters with AG5) |
| [`../api-chain.md`](../api-chain.md) | D — API chain |
| [`cli-output-audit.md`](./cli-output-audit.md) | F — CLI output audit |
| [`severity.md`](./severity.md) | Severity — after Diff/Agentic (+ G on backlog) |
| [`suggest.md`](./suggest.md) | Suggest — engine, full fixes, `-k` / `-d` filters |
| [`fix.md`](./fix.md) | Fix — apply subcommands (`tags`, `config`; subpath postponed) |
| [`config.md`](./config.md) | Config — show, export, convert, parse layer, JSON load |
| [`multibarrel.md`](./multibarrel.md) | Multi-entry API surface (root + subpaths, workspace) |
| [`issues.md`](./issues.md) | Issues — `issues[]` registry + doc links (i18nprune-style) |
| [`sourceProfiles.md`](./sourceProfiles.md) | H — Source profiles (barrel module formats) |
| [`test-expansion.md`](./test-expansion.md) | Test coverage backlog |

**Removed after ship:** Release R1–R4 → [`shipped/release.md`](../shipped/release.md). Phase E → [`shipped/runtime-cli.md`](../shipped/runtime-cli.md) P17. Phase I → [`shipped/examples-sdk.md`](../shipped/examples-sdk.md). Phase B Timeline → [`shipped/timeline.md`](../shipped/timeline.md). Graph C1–C2 → [`shipped/graph.md`](../shipped/graph.md) (partial; delete `graph-2.md` when C complete).
