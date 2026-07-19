# Inventory & cache

Barrel snapshot engine and local cache layer.

---

## P0a — inventory engine (shipped) · `a78a6fe`

- [x] Root barrel parse (`parse-barrel.ts`) — flat exports + `export * as` namespaces
- [x] Symbol resolution — `symbolKind`, `tsKind`, target npm subpath, source module edges
- [x] `buildInventorySnapshot` — root + published subpath rollups, SDK-wide tier sums
- [x] Export categories (`categories.ts`) — run/type/config/other heuristics
- [x] `@sdkTier` JSDoc on declarations (`inventory/tiers.ts`) — highest classifier priority
- [x] Fingerprinting for cache invalidation (`fingerprint.ts`)
- [x] Snapshot schema version (`SNAPSHOT_VERSION`, `TOOL_VERSION` in `shared/constants/cache.ts`)
- [x] Diff engine (`format/diff.ts`) — added/removed flats, tier violation notes, summary deltas

Engineering map: [`systems/exports.md`](../systems/exports.md), [`systems/tiers.md`](../systems/tiers.md).

---

## P0b — cache layer (shipped) · `a78a6fe`

- [x] Cache root: `.expgov/cache/` (configurable `cache.dir`)
- [x] Per-SHA dirs: `inventory.full.json`, `timeline.summary.json`
- [x] Worktree key `__worktree__` for uncommitted barrel state
- [x] Status: `hit` | `miss` | `refresh` | `bypass` | `disabled` (`cache.enabled: false`)
- [x] CLI flags: `-f/--force` (rebuild + write), `--no-cache` (skip read/write)
- [x] `cache/meta.json` heal + validation
- [x] Profiles: `full` (inventory/graph/diff) vs `timeline` (lighter warm for log)

Engineering map: [`systems/cache.md`](../systems/cache.md).

---

## P4 — cache rename (shipped) · 2026-W26

- [x] Default `cacheDir`: `.expgov/cache` (`DEFAULT_CACHE_DIR` in `shared/constants/cache.ts`)
- [x] Init scaffold, gitignore tip, help text, dogfood config, `.gitignore`
- [x] `doctor` warns when legacy `.exports/cache/` still present

---

## P16 — worktree files index / 2e (shipped) · `e74abeb`

- [x] `files.json` under `.expgov/cache/__worktree__/` — per-file content hashes
- [x] `inputFilesEpoch` on worktree snapshots — bound to tracked file set
- [x] Track barrels, scan closure (symbols/namespaces/edges), barrel re-export chains, `expgov.config.ts`, core `package.json`
- [x] `collectBarrelScanClosure` — deep re-export hops (`findNamedReexportSpecifier` walk)
- [x] Full rebuild on any hash diff — no incremental snapshot merge
- [x] Tests: hit/miss on barrel, direct module, and deep re-export edits; tmp fixtures under `<tmpdir>/expgov/`

---

## P24 — legacy snapshot schema invalidation (shipped) · `4c8ea8e`

- [x] `isValidSnapshot` / `isValidTiersCounts` require `summary.root.custom` (and subpath `byTier.custom`)
- [x] On read: reject outdated cache files → delete entry → rebuild from git → write fresh snapshot
- [x] Tests: `cache/store/__tests__/validation.test.ts`
- [x] User docs: `docs/cli/flags.md` (stale cache schema; usually no `-f` needed)

Engineering map: [`systems/cache.md`](../systems/cache.md).
Release context: [`release.md`](./release.md) (v1.0.1).

---

## AG1 — inventory JSON symbols / namespaces (shipped) · 2026-W29

- [x] `inventory --json` with `-v` or `-F` emits `data.symbols[]` and `data.namespaces[]`
- [x] Lean rows: name, tier, category, symbolKind, targetSubpath, module (optional on symbols)
- [x] Shared list policy: same `-T`/`-F` as human verbose; `top` + `symbolsHidden` / `namespacesHidden`
- [x] Truncation guidance: single `data.listGuidance` block (`truncated` + `note`) pointing at `-F` / `-T`
- [x] Helpers: `format/inventoryJson.ts`, `shared/listing.ts` (`buildJsonListGuidance`); tests included
- [x] Docs: `docs/cli/json.md`, `docs/commands/inventory.md`

---

## Agentic JSON principles (shipped AG1–AG8)

1. `-T` / `-F` apply to JSON arrays the same as human lists (`listGuidance` when truncated).
2. `-v` expands JSON `data`, not only human reports.
3. Fail modes stay opt-in; stable `issues[].code`.
4. Grow `data` additively; bump `meta.apiVersion` only on shape breaks.
5. Insights always `{ lines, …typedFields }` (empty `lines: []`, never `null`); Δ positive = growth toward newer/right/later.

Map: [`systems/cli.md`](../systems/cli.md).

---

## ID1 / ID2 — inventory diagnostics (shipped) · 2026-W29

- [x] `inventory/diagnostics.ts` — command-time warn issues (no snapshot field / cache bump)
- [x] ID1 `expgov.inventory.direct_barrel_export` — direct decls in tracked barrels
- [x] ID2 `expgov.inventory.unreachable_module_exports` — local exports on tracked modules not on inventoriable surface
- [x] Human **Diagnostics** block; JSON `issues[]` with `ok: true` (non-failing)
- [x] Tests: `shared/__tests__/inventoryDiagnostics.test.ts`
- [x] Docs: `systems/principles.md`, `systems/exports.md`, `docs/governance.md`, `docs/commands/inventory.md`
