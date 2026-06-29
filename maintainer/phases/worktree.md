# Worktree cache — files index (planned)

**Status:** Planning — correctness gap in shipped worktree cache.

**Companion:** [`systems/cache.md`](../systems/cache.md) · [`active-phase.md`](./active-phase.md)

**Reference:** i18nprune `files.json` + `inputFilesEpoch` binding (no incremental analysis rebuild).

---

## Problem

Worktree snapshots live under cache key `__worktree__` (`.expgov/cache/__worktree__/`).

Today, cache validity uses **`sourceFingerprint` on the root barrel only** (`fingerprintSource(root index text)` in `cache/store/worktree.ts`). That means:

| Edit | Cache behavior today |
|------|----------------------|
| Root `index.ts` barrel | Miss → rebuild ✓ |
| Subpath barrel (`/advanced`, etc.) | **Stale hit** ✗ |
| Source module (JSDoc `@sdkTier`, re-export target) | **Stale hit** ✗ |
| `expgov.config.ts` tier rules | **Stale hit** ✗ |

Users compensate with `-f/--force` or `-nch/--no-cache` — flags should be **opt-out**, not required for correctness.

Commit-keyed cache (`<sha>/`) is fine: git tree content is immutable per SHA. **Worktree is the only ref that needs a files index.**

---

## Goal

Automatic freshness for worktree inventory without forcing users to remember force/no-cache flags.

- **Check** tracked file hashes on every worktree resolve (cheap).
- **Rebuild** the full snapshot when any tracked file is new, missing, or hash-mismatched (same cost as today’s miss path).
- **No incremental parse** — one full `buildSnapshot` / `buildLightSnapshot` per stale detection. Barrel-only work is fast enough (<1s even at 100+ barrels); incremental per-barrel merge adds complexity and little win.

`-f/--force` and `--no-cache` stay for debugging, CI determinism, and explicit bypass — not day-to-day hygiene.

---

## Layout (proposed)

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
3. Governance inputs: `expgov.config.ts`, root `package.json` (exports map drives subpath list)

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

## Implementation slices

One PR per row.

| # | Slice | Touch |
|---|-------|-------|
| 1 | Types + constants | `types/cache/worktreeFiles.ts`, `WORKTREE_FILES_FILENAME`, schema version |
| 2 | IO | `cache/store/worktreeFiles.ts` — load/save/validate `files.json`, atomic write |
| 3 | Fingerprint pass | `cache/store/worktreeTrack.ts` — discover barrels, hash files on disk |
| 4 | Wire `getWorktreeSnapshot` | Replace root-only `sourceFingerprint` check with epoch + closure |
| 5 | Closure persistence | After `buildSnapshot`, collect module paths into `files.json` |
| 6 | Tests | Hash diff → miss; barrel edit → miss; module edit → miss; intact → hit |
| 7 | Docs | Update [`systems/cache.md`](../systems/cache.md), `docs/commands.md` cache notes |

**Depends on:** shipped cache layer (P0b). **Soft dep:** none.

---

## CLI / UX

- Default: silent correct behavior — `cache: hit` only when hashes match.
- Verbose: log `files_changed` reason (which path triggered rebuild) — optional, matches i18nprune dispatch reasons.
- Help text: clarify `--no-cache` is bypass, not “fix stale worktree”.

---

## Open questions

1. **`sourceFingerprint` field** — keep for root barrel quick check / backwards compat, or replace entirely with `inputFilesEpoch`?
2. **Light profile** — timeline path reads root barrel only today; track root barrel + config only for `timeline` profile, or share full `files.json`?
3. **Config outside repo** — if `expgov.config.ts` is ever outside git root, include absolute path in index (i18nprune uses config-relative paths only).

---

## Opinion (incremental cache)

Agree with **no incremental snapshot merge**:

- Dominant cost is module reads + tier classification, not iterating barrels.
- A full rebuild keeps tier provenance, edges, and subpath rollups consistent.
- Incremental would need merge semantics for removed exports, namespace changes, and custom tier buckets — high risk for a governance tool.

The win is **cheap hash checks every run**, not skipping parse work piecemeal.
