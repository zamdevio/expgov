# Agents & contributors

| Page | What it covers |
|------|----------------|
| [**Architecture**](./architecture.md) | Package topology, core vs CLI, import discipline |
| [**Rules**](./rules.md) | TypeScript, logging, tiers, testing, PR discipline |
| [**Onboarding**](./onboarding.md) | First-day reading order, trace-a-command |

## Repo layout

| Layer | Path | Notes |
|-------|------|--------|
| **Engine** | `packages/core` | Inventory, tiers, cache, validate — no TTY/chalk |
| **CLI host** | `packages/cli` | Commander, banners, init prompts |
| **Plans** | `maintainer/phases/` | **When** to build what |
| **Maps** | `maintainer/systems/` | **How** subsystems wire |
| **User docs** | `docs/` | End-user markdown (synced → `apps/docs/` / [expgov.pages.dev](https://expgov.pages.dev)) |
