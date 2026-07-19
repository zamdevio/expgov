# Phase H — Source profiles (module formats)

**Status:** Planning only — `.ts` barrels are sufficient for v1; add profiles incrementally when a real repo needs them.

**Companion:** [`../systems/exports.md`](../systems/exports.md) · [`../shipped/inventory-cache.md`](../shipped/inventory-cache.md) (P0a)

---

## Goals

1. Support additional on-disk module formats (`.tsx`, `.mts`, `.cts`, `.mjs`, `.cjs`) without rewriting inventory, cache, or commands.
2. Centralize format-specific logic behind a **source profile** registry.
3. Keep downstream types unchanged: `ParsedExport[]` → symbols, edges, tiers, snapshots, diff, validate, insights.

---

## Problem today

Format logic is hard-coded in a few places:

| Concern | Current location |
|---------|------------------|
| Specifier → path | `inventory/source.ts` — `.js` in import stripped, always resolves to `.ts` |
| Barrel parse | `inventory/parse-barrel.ts` — `ScriptKind.TS` only |
| Tier / JSDoc / re-exports | `reexport-chain.ts`, `resolve-symbol.ts`, `tiers.ts` — TypeScript AST |
| Barrel discovery | `init/detect.ts` — assumes `src/index.ts` |

Commands, cache, and insights consume **normalized snapshot data** — they do not care which profile produced it.

---

## Design: provider registry

### Core interface

`packages/core/src/inventory/sourceProfile.ts`

```ts
interface SourceProfile {
  readonly id: SourceProfileId;
  readonly barrelExtensions: readonly string[];
  readonly moduleExtensions: readonly string[];
  matchesPath(repoPath: string): boolean;
  resolveCandidates(barrelRepoPath: string, specifier: string): string[];
  parseBarrel(source: string, repoPath: string): ParsedExport[];
}
```

`SourceProfileId` (initial union, extend per profile):

`typescript` · `typescriptTsx` · `moduleTs` · `moduleCts` · `javascript` · `javascriptMjs` · `javascriptCjs`

### Registry

`packages/core/src/inventory/sourceProfiles.ts`

- `registerSourceProfile(profile)` — internal list, ordered
- `profileForPath(repoPath: string): SourceProfile` — match by extension; fallback `typescript`
- `profileForBarrel(repoPath: string): SourceProfile` — used by `readModule`, `buildInventorySnapshot`, worktree track

### Default implementation (extract, don’t rewrite)

`packages/core/src/inventory/profiles/typescript.ts`

Move current behavior from `source.ts` + `parse-barrel.ts`:

- `.js` specifier → `.ts` on disk
- candidates: `foo.ts`, `foo/index.ts`, `foo.ts/index.ts` (existing `resolveModuleCandidates`)
- `parseBarrel` → `typescript` API, `ScriptKind.TS`

This profile is the **only registered profile** in slice H1. Behavior must be byte-for-byte equivalent to today.

### Future profiles (one PR each)

| File | Extensions | Notes |
|------|------------|-------|
| `profiles/typescriptTsx.ts` | `.tsx` | `ScriptKind.TSX`; share parse/tier with typescript |
| `profiles/moduleTs.ts` | `.mts` | `ScriptKind.TS`; Node16 ESM type-stripped barrels |
| `profiles/moduleCts.ts` | `.cts` | `ScriptKind.TS`; CJS-flavored `.cts` |
| `profiles/javascript.ts` | `.js` | `ScriptKind.JS`; JSDoc `@sdkTier` via TS parser |
| `profiles/javascriptMjs.ts` | `.mjs` | ESM JS barrels |
| `profiles/javascriptCjs.ts` | `.cjs` | CJS JS barrels |

Shared tier/re-export logic can stay in `inventory/` and accept `SourceProfile` + `ts.ScriptKind` where needed — only path resolution and barrel entry parse differ per profile initially.

---

## Wiring changes (by slice)

### H1 — Registry + typescript profile (refactor only)

| Touch | Change |
|-------|--------|
| `sourceProfile.ts` | Interface + types |
| `sourceProfiles.ts` | Registry; default `typescript` |
| `profiles/typescript.ts` | Extract from `source.ts`, `parse-barrel.ts` |
| `source.ts` | `readModule` / `readModuleAtPath` delegate to active profile |
| `build.ts` | `parseBarrelExports` via `profileForBarrel(barrelRepoPath)` |
| `worktreeTrack.ts` | Candidate lists from profile when expanding module paths |
| Tests | Existing inventory/cache tests green; add profile unit tests |

**No user-visible change** in H1.

### H2 — Config + init

| Touch | Change |
|-------|--------|
| `expgov.config.ts` | Optional `core.sourceProfile?: SourceProfileId` or infer from `rootBarrel` extension |
| `init/detect.ts` | Detect `index.ts` / `index.mts` / `index.js` when scanning |
| `docs/config.md` | Document profile field |

### H3+ — Additional profiles

One profile per PR; register in `sourceProfiles.ts`; add colocated `__tests__/profiles/*.test.ts` with inline fixture strings.

---

## What stays unchanged

| Layer | Why |
|-------|-----|
| `SourceReader` | Still `read(repoPath) → string \| null` |
| `InventorySnapshot` schema | Profile-agnostic |
| Commands (`run*`) | Call `buildInventorySnapshot` only |
| Cache / `files.json` | Tracks resolved repo paths; uses profile candidates |
| Insights, diff, validate | Consume snapshots |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Mixed `.ts` + `.mjs` tree in one barrel | v1: one profile per barrel path; cross-profile re-exports deferred |
| JS-only SDKs without JSDoc | Document that tier governance still needs `@sdkTier` or config buckets |
| Worktree closure misses new extensions | H1 must route `collectBarrelScanClosure` through profile candidates |
| Profile sprawl | Registry + one file per profile; no monolithic `extensions.ts` |

---

## Explicit non-goals (this phase)

- Parsing published `dist/*.js` as the barrel (repo source only)
- Per-symbol multi-profile in one barrel
- JSON config for profile list
- Auto-detect profile from `package.json` `"type"` alone (config or extension wins)

---

## Recommended execution order

1. **H1** — `sourceProfile.ts`, `sourceProfiles.ts`, `profiles/typescript.ts`, refactor wiring (no new formats).
2. **H2** — `typescriptTsx` profile + config/init barrel detection.
3. **H3** — `moduleTs` / `moduleCts` (Node ESM/CJS typed variants).
4. **H4** — `javascript` / `javascriptMjs` / `javascriptCjs` (JS SDK repos).

Estimated: **H1 = 1 PR**; each additional profile **≤ 1 PR**.

---

## Success criteria

- New format = new file under `profiles/` + registry entry + tests; no command changes.
- Default dogfood repo (`index.ts`) unchanged after H1.
- `expgov validate` and worktree cache tests pass for each new profile before ship.
