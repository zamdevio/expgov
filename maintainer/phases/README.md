# Phases — maintainer hub

**Not user docs** — `maintainer/phases/` is contributor-only.

---

## Start here

| Doc | Role |
|-----|------|
| [`active-phase.md`](./active-phase.md) | **Current sprint + Near/Mid release gate** |
| [`../shipped/README.md`](../shipped/README.md) | **Closed work** — ISO week timeline + receipts |
| [`../systems/`](../systems/README.md) | Durable engineering maps (incl. [`release.md`](../systems/release.md)) |
| [`commands.md`](./commands.md) | Command roadmap — wired verbs + deferred future commands |
| Root [`CHANGELOG.md`](../../CHANGELOG.md) | User-facing release history (no releases portal) |

Scratch / spikes: **`maintainer/temp/`** (gitignored).

---

## Release bands

| Band | Rule |
|------|------|
| **Near** | Finish before any version bump. Then ship **v1.1.0** (breaking Unreleased + Near work). |
| **Mid** | Start only after v1.1.0; target **v1.1.1+** (severity → suggest → fix → …). |

Near / Mid lists and the hold on `versions:up` live in [`active-phase.md`](./active-phase.md#release-gate-do-not-bump-early).

---

## Lifecycle

1. Scope from **`active-phase.md`** only — one slice per PR.
2. On ship: row in [`shipped/README.md`](../shipped/README.md); fold durable notes into [`systems/`](../systems/) and [`shipped/`](../shipped/); **delete** fully shipped phase plans; **trim** half-shipped plans (shipped table on top, remaining below).
3. Session noise → **`maintainer/temp/`** only.

---

## Open phase plans

| Doc | Status | Band |
|-----|--------|------|
| [`agentic.md`](./agentic.md) | AG1–8 shipped; leftovers with C3 | Near |
| [`diff.md`](./diff.md) | D1–D2 shipped; optional D3 | Near |
| [`inventory-diagnostics.md`](./inventory-diagnostics.md) | ID1/ID2 planned | Near |
| [`help.md`](./help.md) | HELP1 | Near |
| [`graph-2.md`](./graph-2.md) | **Focus** — C3 next; C1–C2 shipped | Near |
| [`../api-chain.md`](../api-chain.md) | D — API chain | Mid |
| [`cli-output-audit.md`](./cli-output-audit.md) | F — UX audit leftovers | Mid |
| [`severity.md`](./severity.md) | After Near / v1.1.0 | Mid |
| [`suggest.md`](./suggest.md) | Suggest engine / filters | Mid |
| [`fix.md`](./fix.md) | Fix subcommands | Mid |
| [`config.md`](./config.md) | Config show/export/convert | Mid |
| [`multibarrel.md`](./multibarrel.md) | Multi-entry surface | Mid |
| [`issues.md`](./issues.md) | Issue code registry | Mid |
| [`sourceProfiles.md`](./sourceProfiles.md) | H — source profiles | Mid |
| [`test-expansion.md`](./test-expansion.md) | Test coverage waves | Mid / anytime |

**Deleted after full ship:** Release R1–R4 → [`shipped/release.md`](../shipped/release.md). **REL1–3** automation → [`systems/release.md`](../systems/release.md) (phase `releases.md` removed). Phase E → [`shipped/runtime-cli.md`](../shipped/runtime-cli.md). Phase I → [`shipped/examples-sdk.md`](../shipped/examples-sdk.md). Phase B → [`shipped/timeline.md`](../shipped/timeline.md). Graph C1–C2 → [`shipped/graph.md`](../shipped/graph.md).
