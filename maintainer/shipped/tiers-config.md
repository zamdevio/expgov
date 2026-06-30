# Tiers & config

Tier schema, classification, provenance, policies, and init defaults.

---

## P2 — nested tier schema (shipped) · `daa4615`

- [x] `TierBucket` — `{ exact?: string[]; prefix?: string[] }` per stability level
- [x] `TierRulesConfig` — `stable`, `internal`, `advanced` buckets (+ custom buckets later in P10)
- [x] `config/tiers.ts` — `compilePrefixMatcher` (literal prefix vs `/regex/` / metachar)
- [x] Classifier order: `@sdkTier` → internal → advanced → stable → `unclassified`
- [x] Default prefix sets when tier bucket **omitted**; explicit empty bucket opts out (P13)
- [x] `init` template emits nested `tiers` block
- [x] Validate messages reference `tiers.<tier>.exact` / `.prefix`

Engineering map: [`systems/tiers.md`](../systems/tiers.md), [`systems/config.md`](../systems/config.md).

---

## P9 — tier provenance + logger split (A4) (shipped) · `4f943b3`

- [x] `tierProvenance` on snapshot symbols — `{ kind, label, bucket? }` (replaced `tierSource`)
- [x] `classifySymbolTierWithProvenance()` — tag, config-exact, config-prefix, default-prefix labels
- [x] Validate notes: `tier sources: @tag=N · config=N · default-prefix=N`
- [x] Verbose inventory shows provenance in brackets
- [x] Logger split: `logger/report.ts` + `logger/reports/{inventory,diff,validate,…}.ts`
- [x] Graph module edge provenance in verbose output
- [x] `types/inventory/` barrel for tier types

---

## P10 — tier policies + style boundary (shipped) · `1408c6e`

- [x] **Custom tier buckets** at top level (`beta`, `deprecated`, `preview`, …) with `policy` + optional `precedence`
- [x] `config/tierCatalog.ts` — `resolveTierCatalog()`; built-in defaults: internal 10, advanced 20, stable 100
- [x] `config/tierPolicy.ts` — `public` / `maintainer` / `experimental` / `preview` / `deprecated`
- [x] Tag literals = bucket names directly (removed `tiers.tag.values` remap)
- [x] `TierCounts.custom` for non-built-in tier rollups
- [x] **Chalk only in** `runtime/style.ts` — logger/help use `style.*` tokens via `emitLog`
- [x] Policy-driven validate/diff root-flat violations (`maintainer` / `experimental` block flat on root)

---

## P11 — tier rollup + config types (shipped) · 2026-W26

- [x] `sumSdkTierCounts()` merges `root.custom` (SDK-wide rollups were missing custom tiers)
- [x] Root barrel + SDK-wide inventory sections show custom tier rows (`printTierRollupLines`)
- [x] `tierCountsFooterFields` / `formatTierCountsNote` — inventory + validate footers/notes include custom buckets
- [x] Diff report: custom tier count deltas
- [x] `inventory/reexport-chain.ts` — follow `export` / `export type` re-exports for JSDoc tier tags (max 12 hops)
- [x] `tiers.tag.precedence` — `tag` (default) vs `config` when both match
- [x] `types/config/` barrel — `ExpgovConfig`, `TierBucket`, `ProjectContext`, … (`config/types.ts` removed)
- [x] `MAX_REEXPORT_DEPTH` in `shared/constants/inventory.ts`
- [x] Validate note: `tier by bucket` (tag + config counts per bucket name)

---

## P13 — conservative init (shipped) · `c5fcbab`

- [x] Default `expgov init` — empty `stable` / `internal` / `advanced` buckets
- [x] Explicit empty bucket opts out of built-in prefix merge (`resolveBucket`)
- [x] `--rich` — commented `cache` + tier `exact`/`prefix` examples for opt-in
- [x] Default init omits `cache` block (runtime defaults)

---

## P21 — listing policy for tier rows (shipped) · `c5a5342`

- [x] `printTierRollupLines` — built-in tier rows always shown; **custom** bucket rows use `limitList` + `…and N more`
- [x] Inventory root + SDK-wide sections pass `listLimit` to tier rollup
- [x] Diff — tier violations + custom tier count deltas respect `-T` / `-F`
- [x] Suggest / doctor — `-T/--top` / `-F/--full` on CLI; truncated names/hints/check lines
- [x] `DEFAULT_LIST_TOP = 10` in `shared/listing.ts` (default only — not a hard cap)

---

## P23 — tier policy engine (shipped) · `31d8ded`

- [x] `tiers.policies` — registry for built-in overrides + custom policy presets
- [x] Composable rule `rootFlat: 'allow' | 'deny'` — validate/diff root-flat violations
- [x] Built-ins (`public`, `maintainer`, `experimental`, `preview`, `deprecated`) ship with internal defaults; config merges overrides
- [x] Buckets reference policies by name (`policy: 'partnerApi'`)
- [x] `resolveTierPolicies()` + `ResolvedTierEntry.policyRules` on catalog entries
- [x] Validate — unknown policy refs fail; `listUnknownPolicyRefs()`
- [x] Public exports: `TierPolicyDefinition`, `TierPolicyRules`, `resolveTierPolicies`, `policyViolatesRootFlat`
- [x] `expgov init --rich` — commented `tiers.policies` authoring hints
- [x] Tests: `config/__tests__/tierPolicy.test.ts`
