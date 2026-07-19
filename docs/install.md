---
description: "Install expgov — @expgov/cli devDependency, @expgov/cli/core config types, @expgov/core SDK, init scaffold, and npm package naming."
---

# Install

## Requirements

- **Node.js** ≥ 20
- **pnpm** (recommended) or npm/yarn for installing the package
- A git repo with a TypeScript SDK barrel (`index.ts` re-exports)

## npm package names

| npm package | Role |
|-------------|------|
| **`@expgov/cli`** | CLI binary (`expgov` command) + `@expgov/cli/core` config types |
| **`@expgov/core`** | SDK only — `run*` command APIs without the CLI binary |

The **command** is always `expgov` (from the `bin` field). Only the **npm package name** is scoped.

### Why not unscoped `expgov`?

npm rejected publishing the unscoped name **`expgov`** as too similar to the existing package [**`expo`**](https://www.npmjs.com/package/expo) (React Native tooling). That is a registry policy — not a permissions issue. Owning the **`@expgov`** org does not reserve the global unscoped name.

We publish under the org scope instead:

- **`@expgov/core@1.0.1`** — SDK engine
- **`@expgov/cli@1.0.1`** — CLI (this is what you install for terminal use)

The CLI binary name stays **`expgov`** — only the install package name is `@expgov/cli`.

## Add to a project

Install the **CLI as a devDependency**:

```bash
pnpm add -D @expgov/cli
# or: npm install -D @expgov/cli
```

### Why `-D`?

`expgov` runs at dev/CI time to inventory, validate, and diff your barrel. It does not ship to npm consumers of your package.

The same tarball also exposes **`@expgov/cli/core`** — types and `defineConfig` for `expgov.config.ts`. You do **not** need a separate `@expgov/core` install just to author config.

**Optional but recommended** in `expgov.config.ts`:

```ts
import { defineConfig, type ExpgovConfig } from '@expgov/cli/core';

export default defineConfig({
  // ...
} satisfies ExpgovConfig);
```

`defineConfig` and `ExpgovConfig` are optional — a plain object export works at runtime. See [Configuration](./config.md).

### Global CLI (optional)

```bash
pnpm add -g @expgov/cli
# or: npx expgov --help
```

### SDK package (`@expgov/core`)

For scripts, CI, and libraries that call `run*` command APIs directly — not needed for config or terminal use:

```bash
pnpm add -D @expgov/core
```

| Install | Best for |
|---------|----------|
| `@expgov/cli` (devDep) | CLI + `@expgov/cli/core` config types |
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

Creates `expgov.config.ts` with **conservative tier defaults**. `expgov init` scaffolds imports from `@expgov/cli/core` by default.

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
pnpm build
pnpm typecheck
node dist/cli.js validate
pnpm cli:dev -- validate
```

## Cache

Snapshots are written to `.expgov/cache/` (configurable via `cache.dir`). Add it to `.gitignore` — expgov prints a one-time tip when it detects a git repo without that entry.
