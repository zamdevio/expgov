# Phases — maintainer hub

**Not user docs** — `maintainer/phases/` is contributor-only.

---

## Start here

| Doc | Role |
|-----|------|
| [`active-phase.md`](./active-phase.md) | **Current sprint + Near/Mid release gate** |
| [`../shipped/README.md`](../shipped/README.md) | **Closed work** — ISO week timeline + receipts |
| [`../systems/`](../systems/README.md) | Durable engineering maps (incl. [`release.md`](../systems/release.md), [`cli.md`](../systems/cli.md)) |
| Root [`CHANGELOG.md`](../../CHANGELOG.md) | User-facing release history |

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
| [`../api-chain.md`](../api-chain.md) | D — API chain | Mid |
| [`severity.md`](./severity.md) | After Near / v1.1.0 | Mid |
| [`suggest.md`](./suggest.md) | Suggest engine / filters | Mid |
| [`fix.md`](./fix.md) | Fix subcommands | Mid |
| [`config.md`](./config.md) | Config show/export/convert | Mid |
| [`multibarrel.md`](./multibarrel.md) | Multi-entry surface | Mid |
| [`issues.md`](./issues.md) | Issue code registry | Mid |
| [`sourceProfiles.md`](./sourceProfiles.md) | H — source profiles | Mid |

**Deleted after full ship / fold:** Diff D1–D3 → [`shipped/git-commands.md`](../shipped/git-commands.md). Graph C1–C3 + C4 note → [`shipped/graph.md`](../shipped/graph.md). Commands map / CLI audit leftovers / test waves → [`systems/cli.md`](../systems/cli.md). Release R1–R4 → [`shipped/release.md`](../shipped/release.md). REL1–3 → [`systems/release.md`](../systems/release.md). Phase E → [`shipped/runtime-cli.md`](../shipped/runtime-cli.md). Phase I → [`shipped/examples-sdk.md`](../shipped/examples-sdk.md). Phase B → [`shipped/timeline.md`](../shipped/timeline.md). HELP1 / agentic → [`shipped/runtime-cli.md`](../shipped/runtime-cli.md) / [`git-commands.md`](../shipped/git-commands.md).
