# Configuration

expgov uses a single TypeScript config file — **no JSON config**.

## File

- **Name:** `expgov.config.ts`
- **Discovery:** current working directory or git root
- **Override:** `--config <path>`

## Minimal example

```ts
import { defineConfig, type ExpgovConfig } from 'expgov/core';

export default defineConfig({
  packageName: '@my/sdk',
  core: {
    dir: 'packages/core',
    rootBarrel: 'packages/core/src/index.ts',
    subpaths: {
      '.': 'src/index.ts',
    },
  },
  tsconfig: 'tsconfig.json',
  cacheDir: '.exports/cache',
  tiers: {
    stable: {
      exact: ['RESULT_API_VERSION'],
      prefix: ['run', 'get', 'build'],
    },
    internal: {
      prefix: ['^internal[A-Z_]', 'Internal$'],
    },
    advanced: {
      prefix: ['^experimental[A-Z_]', '^beta[A-Z_]', 'Unsafe$'],
    },
  },
} satisfies ExpgovConfig);
```

Run `expgov init` to generate a working scaffold for your layout.

## Fields

| Field | Role |
|-------|------|
| `packageName` | npm package name — used for tsconfig path ↔ `package.json` exports parity |
| `core.dir` | Core package directory |
| `core.rootBarrel` | Root barrel file (repo-relative path) |
| `core.subpaths` | npm export subpath → source entry (for SDK-wide rollups) |
| `tsconfig` | Root tsconfig for path mapping checks |
| `cacheDir` | Snapshot cache root (default `.exports/cache`) |
| `git.tagPattern` | Version tag glob for `trend` (default `v*`) |
| `git.timelineBarrelPath` | Barrel path for `timeline` git log scope |
| `tiers` | Export classification buckets — see below |

## Tier buckets

Each stability level has optional `exact` (literal export names) and `prefix` (string prefix or regex):

```ts
tiers: {
  stable:   { exact: ['MyType'], prefix: ['run', '^customPrefix'] },
  internal: { prefix: ['^internal[A-Z_]', 'Internal$'] },
  advanced: { prefix: ['^experimental[A-Z_]', 'Unsafe$'] },
}
```

**Classifier priority** (first match wins):

1. `@sdkTier stable | internal | advanced` JSDoc on the export
2. `tiers.internal`
3. `tiers.advanced`
4. `tiers.stable`
5. `unclassified` → `validate` fails

Prefix forms:

| Entry | Matches |
|-------|---------|
| `run` | `name.startsWith('run')` |
| `^internal[A-Z_]` | RegExp |
| `/foo.*/i` | RegExp with optional flags |

Tag a declaration in source:

```ts
/** @sdkTier stable */
export function myPublicApi() {}
```

## CLI overrides

| Flag | Effect |
|------|--------|
| `-C, --cwd` | Project root |
| `--config` | Config file path |
| `--package-name` | Override `packageName` |
| `--cache-dir` | Override `cacheDir` |
