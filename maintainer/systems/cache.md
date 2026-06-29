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

## Behavior

- **miss** — snapshot built from git tree or working tree
- **hit** — reuse `inventory.full.json`
- **refresh** — forced rebuild (`-f/--force`)
- **bypass** — `--no-cache` (no read/write this run)
- **disabled** — `cache.enabled: false` in config (no read/write any run)

## Worktree gap (planned)

Commit SHA cache is immutable; **worktree** is not. Today validity checks only fingerprint the **root barrel** — subpath barrel edits, module/JSDoc changes, and config edits can still **hit stale cache**.

**Planned:** `files.json` under `__worktree__/` (i18nprune-style file hashes + `inputFilesEpoch`). Full rebuild when any tracked file changes — no incremental snapshot merge. See [`phases/worktree.md`](../phases/worktree.md).

## Gitignore

Cache must not be committed. `git/gitignore-tip.ts` suggests adding the configured cache directory to `.gitignore` when:

- repo has `.git`
- cache or `.expgov` exists
- `.gitignore` does not already ignore the path

## Meta

`meta.json` tracks cache version (`CACHE_META_VERSION` in `paths.ts`).
