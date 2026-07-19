# Engineering principles

Stable constraints for expgov design — not sprint plans.

---

## Core principles

| Principle | Rule |
|-----------|------|
| **Reachable SDK surface** | Govern only entry barrels/subpaths and modules transitively reachable from them — not the whole workspace (see below) |
| Config as code | `expgov.config.ts` primary — [`phases/config.md`](../phases/config.md) for show/export + JSON load |
| Core purity | Engine in `packages/core` — no TTY/chalk/prompts in command paths |
| Thin CLI | `packages/cli` — Commander, banners, init prompts only |
| Layout hygiene | Types under `types/`, constants under `constants/`; logic imports only — [`agents/architecture.md`](../agents/architecture.md#module-organization-types--constants) |
| Tier explicitness | `@sdkTier` or config bucket — `unclassified` fails validate |
| Cache is local | `.expgov/cache/` per SHA — gitignored, never committed |
| Incremental PRs | One slice per PR; user-facing argv/JSON contracts are semver-stable since v1 |

---

## Mission

Portable export-governance CLI for TypeScript SDK barrels: inventory, diff, validate, trend, timeline, graph — evolving toward SDK observability without a parallel data store.

---

## Reachable SDK surface (core inventory scope)

expgov’s engine answers: **what is intentionally public from configured package entry points?** It does **not** analyze every file in the repo.

**In scope**

1. Root package barrels (and configured multi-entry barrels)
2. Package subpaths listed for publish / governance
3. Every downstream module **transitively reachable** from those entries via re-export edges

**Out of scope (by design)**

- Modules never reached from a governed entry (implementation detail)
- Workspace-wide unused-export / dead-file scans — use Knip, Madge, or similar
- Overlapping with general TS project linters

This keeps diagnostics focused, matches graph-based cache invalidation (same closure), and avoids turning expgov into a second static-analysis suite.

**Honesty diagnostics** (warn-first on `inventory`; do not fail by default):

| Code | Meaning |
|------|---------|
| `expgov.inventory.direct_barrel_export` | Direct `export const` / `function` / … inside a tracked barrel (not inventoriable — re-export from a module instead) |
| `expgov.inventory.unreachable_module_exports` | Names exported from a tracked module that never appear on the inventoriable root surface from that module |

Implementation: `inventory/diagnostics.ts`. Public copy: [`../../docs/governance.md`](../../docs/governance.md).

---

## Tier resolution (shipped)

```txt
@sdkTier JSDoc  →  tiers.internal  →  tiers.advanced  →  tiers.stable  →  unclassified
```

Detail: [`tiers.md`](./tiers.md).

---

## Out of scope (deferred)

- JSON config as primary authoring format (load after [`phases/config.md`](../phases/config.md) CF4)
- Remote cache / shared artifact store
- Auto-fix PR bot for tier allowlists (after [`phases/fix.md`](../phases/fix.md))
- Runtime API usage tracking (needs consumer instrumentation)
- Real-time watch mode (separate tool)

Current sprint and deferred rationale: [`phases/active-phase.md`](../phases/active-phase.md).

Package layout and import rules: [`agents/architecture.md`](../agents/architecture.md).
