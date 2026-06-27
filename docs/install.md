# Install

## Requirements

- **Node.js** ≥ 20
- **pnpm** (recommended) or npm/yarn for installing the package
- A git repo with a TypeScript SDK barrel (`index.ts` re-exports)

## Add to a project

```bash
pnpm add -D expgov
```

Or link globally while developing expgov itself:

```bash
pnpm build
pnpm link --global
expgov validate
```

## Scaffold config

From your SDK repo root:

```bash
pnpm exec expgov init
```

Creates `expgov.config.ts` with safe defaults. Detects monorepo `packages/core` vs single-package `src/index.ts` layouts.

| Flag | Role |
|------|------|
| `-y, --yes` | Write without prompts (CI / non-TTY) |
| `-f, --force` | Overwrite existing config |
| `-r, --rich` | Include commented `tiers.stable.exact` examples |

## Run commands

```bash
pnpm exec expgov validate
pnpm exec expgov inventory
pnpm exec expgov diff HEAD
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

Snapshots are written to `.expgov/cache/` (configurable via `cacheDir`). Add it to `.gitignore` — expgov prints a one-time tip when it detects a git repo without that entry.
