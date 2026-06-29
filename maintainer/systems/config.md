# Config subsystem

## File

- **Name:** `expgov.config.ts` (TypeScript only)
- **Discovery:** repo root or git root; override with `--config <path>`
- **Loader:** jiti (`packages/core/src/config/load.ts`)

## Minimal shape

```ts
import { defineConfig, type ExpgovConfig } from 'expgov/core';

export default defineConfig({
  packageName: '@my/sdk',
  core: {
    dir: 'packages/core',
    rootBarrel: 'packages/core/src/index.ts',
    subpaths: { '.': 'src/index.ts' },
  },
  tsconfig: 'tsconfig.json',
  cache: {
    enabled: true,
    dir: '.expgov/cache',
  },
  tiers: { /* see tiers.md */ },
} satisfies ExpgovConfig);
```

## Fields

| Field | Role |
|-------|------|
| `packageName` | npm package name for tsconfig path keys |
| `core.dir` | Core package directory |
| `core.rootBarrel` | Root `index.ts` repo path |
| `core.subpaths` | npm subpath → source entry (for SDK-wide rollups) |
| `tsconfig` | Root tsconfig for path ↔ exports parity |
| `cache` | `{ enabled?, dir? }` or `true` / `false` — default enabled, dir `.expgov/cache` |
| `git.tagPattern` | Default `v*` for trend |
| `git.timelineBarrelPath` | Barrel path for timeline log |
| `tiers` | Tier buckets — [`tiers.md`](./tiers.md) |

## Init scaffold

`expgov init` detects monorepo `packages/core` vs single-package `src/index.ts` and writes defaults.

Flags: `-y/--yes`, `-f/--force`, `-r/--rich` (commented `tiers.stable.exact` examples).

## Overrides (CLI)

| Flag | Maps to |
|------|---------|
| `-C/--cwd` | project root |
| `--config` | config file path |
| `--package-name` | override `packageName` |
| `--cache-dir` | override `cache.dir` |
