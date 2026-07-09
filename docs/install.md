---
description: "Install expgov — devDependency CLI, optional expgov/core types for config, @expgov/core SDK, init scaffold, and local development."
---

# Install

## Requirements

- **Node.js** ≥ 20
- **pnpm** (recommended) or npm/yarn for installing the package
- A git repo with a TypeScript SDK barrel (`index.ts` re-exports)

## Add to a project

Install the **CLI as a devDependency** — it is a development tool, not a runtime dependency of your SDK:

```bash
pnpm add -D expgov
# or: npm install -D expgov
```

### Why `-D`?

`expgov` runs at dev/CI time to inventory, validate, and diff your barrel. It does not ship to npm consumers of your package.

The same tarball also exposes **`expgov/core`** — types and `defineConfig` for `expgov.config.ts`. You do **not** need a separate `@expgov/core` install just to author config; the CLI bundle is enough.

**Optional but recommended** in `expgov.config.ts`:

```ts
import { defineConfig, type ExpgovConfig } from 'expgov/core';

export default defineConfig({
  // ...
} satisfies ExpgovConfig);
```

`defineConfig` and `ExpgovConfig` are optional — a plain object export works at runtime. The imports give you autocomplete and `satisfies` checking in your editor. See [Configuration](./config.md).

### Global CLI (optional)

```bash
pnpm add -g expgov
# or: npx expgov --help
```

### SDK package (`@expgov/core`)

For scripts, CI, and libraries that call `runExports*` APIs directly — not needed for config or terminal use:

```bash
pnpm add -D @expgov/core
```

| Install | Best for |
|---------|----------|
| `expgov` (devDep) | CLI + `expgov/core` config types from one package |
| `@expgov/core` (devDep) | Programmatic governance without the CLI binary |

See [SDK overview](./sdk/README.md) for the host contract.

**Try the example SDK** (in this repo):

```bash
pnpm build
cd examples/sdk
expgov validate
```

See [`examples/sdk/README.md`](../examples/sdk/README.md).

## Scaffold config

From your SDK repo root:

```bash
expgov init
```

Creates `expgov.config.ts` with **conservative tier defaults** (empty `stable` / `internal` / `advanced` buckets — classify via `@sdkTier` or `tiers.*.exact`, then `expgov suggest`). Detects monorepo `packages/core` vs single-package `src/index.ts` layouts.

| Flag | Role |
|------|------|
| `-y, --yes` | Write without prompts (CI / non-TTY) |
| `-f, --force` | Overwrite existing config |
| `-r, --rich` | Commented `cache` block and `tiers.*` exact/prefix examples to opt into |

## Run commands

```bash
expgov validate
expgov inventory
expgov diff HEAD
```

Point at another project root:

```bash
expgov -C /path/to/sdk validate
```

Override config path:

```bash
expgov --config ./tools/expgov.config.ts validate
```

## Local development (this repo)

```bash
pnpm install
pnpm build          # core tsc + root tsup → dist/cli.js
pnpm typecheck
node dist/cli.js validate
pnpm cli:dev -- validate   # tsx dev entry
```

## Cache

Snapshots are written to `.expgov/cache/` (configurable via `cache.dir`). Add it to `.gitignore` — expgov prints a one-time tip when it detects a git repo without that entry.
