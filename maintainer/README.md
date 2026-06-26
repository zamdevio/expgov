# Maintainer directory

Contributor-only planning and systems maps. **`docs/`** is user-facing (when added); **`maintainer/`** is not published.

**Agent guides:** [`agents/README.md`](agents/README.md) · **Onboarding:** [`agents/onboarding.md`](agents/onboarding.md)

---

## Layout

| Need | Where |
|------|--------|
| **What to build next** | [`phases/active-phase.md`](phases/active-phase.md) |
| **What not to redo** | [`phases/shipped-slices.md`](phases/shipped-slices.md) |
| **How subsystems wire** | [`systems/README.md`](systems/README.md) |
| **Agent / commit rules** | [`agents/rules.md`](agents/rules.md) |

**Engine truth:** domain logic in **`packages/core`** (`runExports*`, inventory, tiers, cache). CLI is a thin host in **`packages/cli`**.

**Scratch:** **`maintainer/temp/`** (gitignored — never commit).

---

## Entrypoints

| Doc | Role |
|-----|------|
| [`phases/active-phase.md`](phases/active-phase.md) | **Current sprint** |
| [`phases/shipped-slices.md`](phases/shipped-slices.md) | Shipped receipts (ISO week timeline) |
| [`phases/commands.md`](phases/commands.md) | Command roadmap + deferred verbs |
| [`systems/tiers.md`](systems/tiers.md) | Tier schema, `@sdkTier`, classifier priority |
| [`systems/cli.md`](systems/cli.md) | Logger, style, flags, help |
| [`systems/exports.md`](systems/exports.md) | Barrel governance, cache, validate |
