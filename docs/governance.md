---
description: "expgov governance model — read-only commands, tier classification, cache behavior, and what validate enforces on your SDK barrel."
---

# Governance model

expgov helps you **see** and **enforce** export-surface rules on TypeScript SDK barrels. It is designed for safe day-to-day use in real repos.

## Read-only by default

| Command | Writes files? |
|---------|----------------|
| `inventory`, `diff`, `validate`, `doctor`, `suggest`, `trend`, `timeline`, `graph` | No |
| `init` | Yes — creates `expgov.config.ts` only |

Governance commands never edit your barrel, `package.json`, or tier tags. You apply fixes in normal PRs; expgov reports drift.

## What “governed” means

1. **Tier classification** — every root flat export maps to a bucket (`stable`, `internal`, `advanced`, or custom) via `@sdkTier` JSDoc and/or `tiers.*` config.
2. **Policy rules** — buckets reference policies (e.g. `internal` denies flat root exports).
3. **Parity checks** — `validate` compares tsconfig `paths` to npm `exports`.
4. **Drift visibility** — `diff`, `timeline`, and `trend` show how the surface changed over time.

## Tier sources (first match wins)

1. JSDoc tier tag (default `@sdkTier <bucket>`)
2. Config buckets by `precedence` (`exact`, then `prefix`)
3. `unclassified` → `validate` fails

See [Configuration](./config.md) for bucket schema and tag precedence.

## Cache and freshness

Working-tree snapshots live under `.expgov/cache/__worktree__/`. expgov tracks barrels, re-export chains, config, and scanned modules — rebuilds when inputs change.

- **Default** — correct freshness; `cache: hit` in JSON when reused.
- **`-f/--force`** — rebuild this run.
- **`-nch/--no-cache`** — bypass read/write (debug/CI only).

Commit/SHA refs use immutable per-SHA cache dirs.

## Human vs JSON output

- **Human mode** — banners, meta, report body, insights, footer (see [CLI overview](./cli/README.md)).
- **`--json`** — single envelope on stdout; stable for CI. See [JSON output](./cli/json.md).

## Related

- [Workflows](./guides/workflows.md) — practical recipes
- [validate](./commands/validate.md) — enforcement checks
- [Configuration](./config.md) — `expgov.config.ts`
