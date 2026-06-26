# Active sprint

**Shipped receipts:** [`shipped-slices.md`](./shipped-slices.md)

**Roadmap:** [`commands.md`](./commands.md) · **Blueprint:** [`architecture.md`](./architecture.md)

**Engineering maps:** [`systems/README.md`](../systems/README.md)

---

## Focus now

| Priority | Slice | Goal |
|----------|-------|------|
| **Now** | Tier schema polish | Nested `tiers.{stable,internal,advanced}.{exact,prefix}` shipped; migrate archlab + consumer configs off flat keys |
| **Next** | User docs | `docs/` stubs for install, config, commands, JSON envelope |
| **Next** | CI gate | `expgov validate` in GitHub Actions on PRs |
| **Deferred** | `doctor` command | Config discovery + cache hygiene checks — see [`commands.md`](./commands.md) |

Check [`shipped-slices.md`](./shipped-slices.md) before re-implementing runtime, init, or CLI styling.

---

## Guiding rules

- **Config is TypeScript only:** `expgov.config.ts` via jiti — no JSON config.
- **Core purity:** `packages/core` never imports CLI, prompts, or chalk.
- **CLI is thin:** Commander host, banners, help colorization, `init` prompts only.
- **Tier sources:** `@sdkTier` JSDoc + nested config buckets — see [`systems/tiers.md`](../systems/tiers.md).
- **One slice per PR** — scope from [`architecture.md`](./architecture.md).

---

## Where detail lives

| Need | Doc |
|------|-----|
| What shipped, when | [`shipped-slices.md`](./shipped-slices.md) |
| Command contracts | [`commands.md`](./commands.md) |
| Tiers, cache, CLI, config | [`systems/`](../systems/README.md) |
| Agent layout + import rules | [`agents/architecture.md`](../agents/architecture.md) |
