# Cache subsystem

## Location

Default: `.expgov/cache` (configurable via `cache.dir` in `expgov.config.ts`).

Working tree uses special key `__worktree__`.

## Layout

```txt
.expgov/cache/
├── meta.json
└── <sha>/
    ├── inventory.full.json
    └── timeline.summary.json
```

Worktree key `__worktree__` adds a tracked-files index:

```txt
.expgov/cache/__worktree__/
├── files.json
├── inventory.full.json
└── timeline.summary.json
```

## Behavior

- **miss** — snapshot built from git tree or working tree
- **hit** — reuse `inventory.full.json`
- **refresh** — forced rebuild (`-f/--force`)
- **bypass** — `--no-cache` (no read/write this run)
- **disabled** — `cache.enabled: false` in config (no read/write any run)

## Worktree freshness (shipped P16)

Commit SHA dirs are immutable; **worktree** is not. Validity uses `files.json` + `inputFilesEpoch` on snapshots — not root-barrel fingerprint alone.

**Tracked on each resolve:**

1. Root + published subpath barrels (+ timeline barrel when distinct)
2. Scan closure: `sourceModule` / `toModule` from snapshot symbols, namespaces, edges
3. Barrel re-export chains — every module reachable from export specifiers (`collectBarrelScanClosure`)
4. Governance: `expgov.config.ts`, core `package.json`

On each run: re-hash tracked paths on disk. Any new, missing, or changed file → **full rebuild** (no incremental snapshot merge). `-f` skips read; `--no-cache` skips read and write.

**Code:** `cache/store/worktreeTrack.ts`, `worktreeFiles.ts`, wired in `getWorktreeSnapshot`.

**`files.json` shape:** version, `files` map (path → content hash + size + mtimeMs), `inputFilesEpoch` digest bound to snapshot.

**Light profile note:** first timeline-only run indexes barrels + governance; full `inventory` expands closure (shared `files.json`).

## Gitignore

Cache must not be committed. `git/gitignore-tip.ts` suggests adding the configured cache directory to `.gitignore` when:

- repo has `.git`
- cache or `.expgov` exists
- `.gitignore` does not already ignore the path

## Meta

`meta.json` tracks cache version (`CACHE_META_VERSION` in `paths.ts`).
