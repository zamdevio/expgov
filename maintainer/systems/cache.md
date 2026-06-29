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

Worktree uses key `__worktree__` and adds a tracked-files index:

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

## Worktree freshness

Commit SHA cache is immutable; **worktree** is not. Validity checks hash a tracked file set under `__worktree__/files.json` (barrels, barrel re-export chains, scan closure, `expgov.config.ts`, core `package.json`) and bind snapshots via `inputFilesEpoch`. Any new, missing, or changed file triggers a full rebuild — no incremental snapshot merge. See [`phases/worktree.md`](../phases/worktree.md).

## Gitignore

Cache must not be committed. `git/gitignore-tip.ts` suggests adding the configured cache directory to `.gitignore` when:

- repo has `.git`
- cache or `.expgov` exists
- `.gitignore` does not already ignore the path

## Meta

`meta.json` tracks cache version (`CACHE_META_VERSION` in `paths.ts`).
