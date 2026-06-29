# Phases — maintainer hub

**Not user docs** — `maintainer/phases/` is contributor-only.

---

## Start here

| Doc | Role |
|-----|------|
| [`active-phase.md`](./active-phase.md) | **Current sprint + ordered backlog** |
| [`shipped-slices.md`](./shipped-slices.md) | **Closed work** — ISO week timeline + receipts |
| [`commands.md`](./commands.md) | Command roadmap — wired verbs + deferred future commands |
| [`architecture.md`](./architecture.md) | Blueprint — layers, principles, out-of-scope |

| [`observability-roadmap.md`](./observability-roadmap.md) | Phases A–G program index |
| [`worktree.md`](./worktree.md) | Worktree `files.json` cache correctness (planned) |

Scratch / spikes: **`maintainer/temp/`** (gitignored).

---

## Lifecycle

1. Scope from **`active-phase.md`** only — one slice per PR.
2. On ship: add a row to [`shipped-slices.md`](./shipped-slices.md) (ISO week + receipt); fold durable notes into [`systems/`](../systems/).
3. Session noise → **`maintainer/temp/`** only.
