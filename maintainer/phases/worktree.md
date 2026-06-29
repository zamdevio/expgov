# Worktree cache — files index (shipped)

**Status:** Shipped — `files.json` + `inputFilesEpoch` under `__worktree__/`.

**Companion:** [`systems/cache.md`](../systems/cache.md) · [`active-phase.md`](./active-phase.md)

**Reference:** i18nprune `files.json` + `inputFilesEpoch` binding (no incremental analysis rebuild).

---

## Problem (fixed in P16)

Worktree snapshots live under cache key `__worktree__` (`.expgov/cache/__worktree__/`).

**Before P16**, cache validity used **`sourceFingerprint` on the root barrel only**. That meant stale hits on subpath barrels, deep re-exports, modules (JSDoc `@sdkTier`), and `expgov.config.ts` edits unless the user passed `-f/--force` or `-nch/--no-cache`.

Commit-keyed cache (`<sha>/`) is fine: git tree content is immutable per SHA. **Worktree is the only ref that needs a files index.**

**Shipped:** `cache/store/worktreeTrack.ts` + `worktreeFiles.ts` — hash gate via `files.json` and `inputFilesEpoch` on snapshots.

---

## Goal

Automatic freshness for worktree inventory without forcing users to remember force/no-cache flags.

- **Check** tracked file hashes on every worktree resolve (cheap).
- **Rebuild** the full snapshot when any tracked file is new, missing, or hash-mismatched (same cost as today’s miss path).
- **No incremental parse** — one full `buildSnapshot` / `buildLightSnapshot` per stale detection. Barrel-only work is fast enough (<1s even at 100+ barrels); incremental per-barrel merge adds complexity and little win.

`-f/--force` and `--no-cache` stay for debugging, CI determinism, and explicit bypass — not day-to-day hygiene.

---

## Layout

Keep the existing cache key dir; add a files index beside snapshots:

```txt
.expgov/cache/
├── meta.json
└── __worktree__/
    ├── files.json              # tracked repo-relative paths → hash record
    ├── inventory.full.json     # full profile (unchanged filename)
    └── timeline.summary.json   # light profile (unchanged)
```

`files.json` is **worktree-only**. Commit dirs (`<sha>/`) do not need it — SHA immutability is enough.

### `files.json` shape (sketch)

Mirror i18nprune’s per-file records (content hash + size + mtime for debugging):

```ts
interface WorktreeFilesState {
  version: number;
  updatedAt: string;
  files: Record<string, { hash: string; size: number; mtimeMs: number }>;
  /** Digest of `files` map when inventory was produced — bound to snapshot. */
  inputFilesEpoch?: string;
}
```

Bind `inventory.full.json` / `timeline.summary.json` to `inputFilesEpoch` so an old snapshot cannot serve after `files.json` was refreshed (i18nprune `CacheProjectRunState.inputFilesEpoch` pattern).

---

## What to track

### Barrels (required minimum)

User intuition is right: **barrels are the entry points.**

Always track:

- Root barrel — `getRootIndexRepoPath()`
- Every published npm subpath barrel — `publishedSubpathBarrels()` / `getSubpathSourceEntries()`

This alone fixes subpath-barrel edits and multi-barrel repos.

### Scan closure (recommended — still not “incremental”)

Barrel-only tracking **does not** catch module-only edits (tier JSDoc, implementation behind a stable re-export). Recommended tracked set after each full build:

1. All barrel paths (above)
2. Every `sourceModule` / `toModule` repo path from snapshot `symbols`, `namespaces`, `edges`
3. **Barrel re-export chains** — every module reachable from barrel export specifiers (direct hop + `findNamedReexportSpecifier` walk)
4. Governance inputs: `expgov.config.ts`, root `package.json` (exports map drives subpath list)

On the next worktree run: **re-hash the union on disk** (fast). Any diff → full rebuild → rewrite `files.json` from the new scan closure.

This is **not** incremental analysis — it is incremental *staleness detection* only. Parse work stays one shot.

### Explicitly out of scope (v1)

- Per-barrel partial `inventory` merge
- Cross-run module cache reuse without full snapshot rebuild
- Remote / shared worktree cache

---

## Resolve algorithm (worktree)

```
getWorktreeSnapshot(options):
  profile ← full | timeline
  barrels ← discoverBarrelPaths()
  filesState ← load files.json (or empty)

  if shouldReadCache(options):
    currentEpoch ← hashFileRecords(scanHashes(barrels ∪ filesState.knownModules))
    cached ← read inventory for profile
    if cached && cached.inputFilesEpoch === currentEpoch:
      return hit

  snapshot ← buildSnapshot | buildLightSnapshot  // full rebuild
  filesState ← write barrels + scan closure hashes
  epoch ← digest(filesState.files)
  snapshot.inputFilesEpoch ← epoch
  persist files.json + snapshot
  return miss | refresh
```

`force` skips read but still writes unless `noCache`. `noCache` skips read and write (unchanged).

---

## i18nprune parallels (what we copy / skip)

| i18nprune | expgov worktree |
|-----------|-----------------|
| `files.json` per project dir | `files.json` under `__worktree__/` |
| `inputFilesEpoch` on analysis payload | same field on `InventorySnapshot` or sidecar meta |
| Delta classify → partial rebuild | **Skip** — full snapshot rebuild on any hash diff |
| Locale segment maps | N/A — barrels + TS modules only |
| `files_index_recovered` path | Malformed `files.json` → rebuild from disk, warn once |

---

## Implementation slices (shipped)

| # | Slice | Touch | Status |
|---|-------|-------|--------|
| 1 | Types + constants | `types/cache/worktreeFiles.ts`, `WORKTREE_FILES_FILENAME`, schema version | ✓ |
| 2 | IO | `cache/store/worktreeFiles.ts` — load/save/validate `files.json` | ✓ |
| 3 | Fingerprint pass | `cache/store/worktreeTrack.ts` — barrels, chains, hash on disk | ✓ |
| 4 | Wire `getWorktreeSnapshot` | Epoch + closure replaces root-only `sourceFingerprint` gate | ✓ |
| 5 | Closure persistence | `collectBarrelScanClosure` + snapshot module paths → `files.json` | ✓ |
| 6 | Tests | `worktreeSnapshot.test.ts`, `worktreeTrack.test.ts`; tmp under `<tmpdir>/expgov/` | ✓ |
| 7 | Docs | [`systems/cache.md`](../systems/cache.md), [`docs/commands.md`](../../docs/commands.md) | ✓ |

**Depends on:** shipped cache layer (P0b).

---

## CLI / UX

- Default: silent correct behavior — `cache: hit` only when hashes match.
- Verbose: log `files_changed` reason (which path triggered rebuild) — optional, matches i18nprune dispatch reasons.
- Help text: clarify `--no-cache` is bypass, not “fix stale worktree”.

---

## Resolved decisions

1. **`sourceFingerprint`** — kept on snapshots for debugging; **primary gate is `inputFilesEpoch`**.
2. **Light profile** — shares `files.json` under `__worktree__/`; first timeline-only run indexes barrels + governance; full `inventory` expands closure (including re-export chains).
3. **Config path** — `ProjectContext.configRepoPath` (repo-relative); discovered via `resolveExpgovConfig`.

---

## Opinion (incremental cache)

Agree with **no incremental snapshot merge**:

- Dominant cost is module reads + tier classification, not iterating barrels.
- A full rebuild keeps tier provenance, edges, and subpath rollups consistent.
- Incremental would need merge semantics for removed exports, namespace changes, and custom tier buckets — high risk for a governance tool.

The win is **cheap hash checks every run**, not skipping parse work piecemeal.
