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
  cacheDir: '.expgov/cache',
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
| `cacheDir` | Snapshot cache root (default `.expgov/cache`) |
| `git.tagPattern` | Version tag glob for `trend` (default `v*`) |
| `git.timelineBarrelPath` | Barrel path for `timeline` git log scope |
| `tiers` | Export classification buckets — see below |
| `tiers.tag` | Optional JSDoc tag name and tag-vs-config precedence |

## Tier buckets

Each bucket has optional `policy`, `precedence`, `exact` (literal export names), and `prefix` (string prefix or regex):

```ts
tiers: {
  tag: {
    name: 'sdkTier',
    precedence: 'tag', // default — JSDoc wins when both tag and config match
  },
  stable:   { policy: 'public', exact: ['MyType'], prefix: ['run'] },
  internal: { policy: 'maintainer', prefix: ['^internal[A-Z_]', 'Internal$'] },
  advanced: { policy: 'experimental', prefix: ['^experimental[A-Z_]', 'Unsafe$'] },
  beta:     { policy: 'preview', prefix: ['^beta'] }, // custom bucket
}
```

**Policies** (built-ins default when `policy` is omitted):

| Policy | Default bucket | Root flat behavior |
|--------|----------------|-------------------|
| `public` | `stable` | allowed |
| `maintainer` | `internal` | validate fails |
| `experimental` | `advanced` | validate fails |
| `preview` | custom | allowed (notes only) |
| `deprecated` | custom | allowed (notes only) |

**Classifier priority** (first match wins):

1. Configured JSDoc tier tag (default `@sdkTier <bucket>`) — literal must match a bucket name
2. Buckets by `precedence` (lower first; built-in defaults: internal 10, advanced 20, stable 100)
3. `unclassified` → `validate` fails

When **both** JSDoc and config match the same export, `tiers.tag.precedence` decides:
- `tag` (default) — `@sdkTier` wins
- `config` — `tiers.<bucket>.exact` / `.prefix` wins

### Custom tag name (`tiers.tag`)

```ts
tiers: {
  tag: { name: 'sdkTier' },
  stable: { exact: ['MyType'] },
  beta: { policy: 'preview', prefix: ['^beta'] },
}
```

```ts
/** @sdkTier beta */
export function previewApi() {}
```

Prefix forms:

| Entry | Matches |
|-------|---------|
| `run` | `name.startsWith('run')` |
| `^internal[A-Z_]` | RegExp |
| `/foo.*/i` | RegExp with optional flags |

Tag a declaration on the **defining** export (works through barrel re-exports):

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
