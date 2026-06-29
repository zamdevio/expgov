# Engineering principles

Stable constraints for expgov design — not sprint plans.

---

## Core principles

| Principle | Rule |
|-----------|------|
| Config as code | `expgov.config.ts` only — typed via `defineConfig` |
| Core purity | Engine in `packages/core` — no TTY/chalk/prompts in command paths |
| Thin CLI | `packages/cli` — Commander, banners, init prompts only |
| Tier explicitness | `@sdkTier` or config bucket — `unclassified` fails validate |
| Cache is local | `.expgov/cache/` per SHA — gitignored, never committed |
| Incremental PRs | One slice per PR; user-facing argv/JSON contracts are stable pre-v1 |

---

## Mission

Portable export-governance CLI for TypeScript SDK barrels: inventory, diff, validate, trend, timeline, graph — evolving toward SDK observability without a parallel data store.

---

## Tier resolution (shipped)

```txt
@sdkTier JSDoc  →  tiers.internal  →  tiers.advanced  →  tiers.stable  →  unclassified
```

Detail: [`tiers.md`](./tiers.md).

---

## Out of scope (deferred)

- JSON config files (`expgov.config.json`)
- Remote cache / shared artifact store
- Auto-fix PR bot for tier allowlists
- Runtime API usage tracking (needs consumer instrumentation)
- Real-time watch mode (separate tool)

Current sprint and deferred rationale: [`phases/active-phase.md`](../phases/active-phase.md).

Package layout and import rules: [`agents/architecture.md`](../agents/architecture.md).
