# Cache subsystem

## Location

Default: `.exports/cache/` (configurable via `cacheDir` in `expgov.config.ts`).

Working tree uses special key `__worktree__`.

## Layout

```txt
.exports/cache/
├── meta.json
└── <sha>/
    ├── inventory.full.json
    └── timeline.summary.json
```

## Behavior

- **miss** — snapshot built from git tree or working tree
- **hit** — reuse `inventory.full.json`
- **refresh** — forced rebuild (`-f/--force`)
- **bypass** — `--no-cache` (no read/write)

## Gitignore

Cache must not be committed. `git/gitignore-tip.ts` suggests adding `cacheDir/` to `.gitignore` when:

- repo has `.git`
- cache or `.exports` exists
- `.gitignore` does not already ignore the path

## Meta

`meta.json` tracks cache version (`CACHE_META_VERSION` in `paths.ts`).
