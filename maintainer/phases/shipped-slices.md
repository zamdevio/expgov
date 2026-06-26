# Shipped slices

Closed work only. Check here before re-implementing. Durable engineering detail lives in [`systems/`](../systems/README.md).

---

## Timeline (ISO weeks)

| Week | Slice | Receipt |
|------|-------|---------|
| 2026-W26 | **P0** — scaffold | Portable CLI extracted from archlab `scripts/exports`; tsup bundle; `expgov.config.ts` (`a78a6fe`) |
| 2026-W26 | **P1** — styled runtime | Log policy, JSON envelopes, global `-j/-q/-s`, banners, init command, cache gitignore tip (`4d53612`) |
| 2026-W26 | **P2** — nested tier schema | `tiers.{stable,internal,advanced}.{exact,prefix}` + legacy flat key compat + maintainer hub |

---

## P0 — scaffold (shipped)

- [x] `packages/core` engine + `packages/cli` thin host
- [x] Root `tsup` → `dist/cli.js` + `dist/core.js`
- [x] `expgov.config.ts` discovery via jiti
- [x] Commands: `inventory`, `diff`, `validate`, `trend`, `timeline`, `graph`

## P1 — styled runtime (shipped)

- [x] `RunOptions` + `policy.ts` gates (`json`, `quiet`, `silent`)
- [x] Console log sink, command timer, JSON envelope (`RESULT_API_VERSION`)
- [x] Global flags on Commander program
- [x] Colorized help; bright-yellow `(default: …)` notes
- [x] `init` command with `-r/--rich`, `-f/--force`, `-y/--yes`
- [x] Cache gitignore tip when `.exports/` exists but is not ignored
- [x] Dogfood `expgov.config.ts` for `@expgov/core`

## P2 — nested tier schema (shipped)

- [x] `TierBucket` + nested `TierRulesConfig`
- [x] `config/tiers.ts` resolver (prefix + regex in `prefix` arrays)
- [x] Legacy flat keys (`stableExact`, etc.) normalized with one-time migration tip
- [x] `classifySymbolTier` uses three buckets; `@sdkTier` still highest priority
- [x] `init` template emits nested schema
- [x] `maintainer/` hub (phases, agents, systems)
