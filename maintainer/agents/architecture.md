# Architecture

## Monorepo layout

```txt
expgov/
├── package.json              # published npm pkg `@expgov/cli`; bin → dist/cli.js; exports ./core
├── expgov.config.ts          # dogfood tier config for @expgov/core
├── examples/
│   └── sdk/                  # consumer-shaped SDK example (Phase I)
├── apps/
│   └── docs/                 # VitePress site (synced from docs/)
├── tsup.config.ts
├── tsconfig.json
├── packages/
│   ├── core/                 # @expgov/core (published SDK)
│   └── cli/                  # private workspace CLI host
├── maintainer/
└── docs/                     # user-facing source (synced → apps/docs/content/)
```

## Packages

| Package | npm | Role |
|---------|-----|------|
| `@expgov/core` | `@expgov/core` | Export governance engine — inventory, diff, validate, tiers, cache |
| `@expgov/cli` (root publish) | `@expgov/cli` | CLI binary + `@expgov/cli/core` subpath for config authors |

### Dual publish (match nodehunter pattern, scoped CLI)

Two separate npm packages under **`@expgov`**:

1. **`@expgov/cli`** — self-contained CLI (`dist/cli.js` bundles core at build time). Ships `@expgov/cli/core` subpath. Binary name: `expgov`.
2. **`@expgov/core`** — standalone SDK built from `packages/core`.

npm blocks unscoped **`expgov`** (too similar to `expo`). Owning `@expgov` does not reserve the global name.

Monorepo dev uses `workspace:*` for `@expgov/core` in root `devDependencies`. Published CLI tarball does not list `@expgov/core` as a runtime dependency.

## Core layout

```txt
packages/core/src/
├── commands/       # runExports* — beginCommand/finishCommand + reports
├── config/         # load.ts, tiers.ts, tierCatalog, tierPolicy
├── context/        # ProjectContext from expgov.config.ts; path accessors (paths.ts)
├── cache/          # snapshot warm/read, worktree files.json
├── inventory/      # barrel snapshot + classifySymbolTier
├── init/           # detect + template for init command
├── git/            # refs, gitignore tip
├── insights/       # command metadata aggregations (Phase E)
├── runtime/        # RunOptions, emitter, policy, timer, JSON envelope, style
├── logger/         # human report formatters (emit via log sink)
└── help/           # long-form usage text

packages/cli/src/
├── bin/cli.ts      # thin entry — bootstrapRuntime + buildProgram
├── types/          # CLI-only interfaces (global flags, help, init, update state)
├── commands/init/  # ensureConfig + prompts
└── utils/          # help colorization, banners, list flags
```

## Import rule

```txt
packages/cli  →  packages/core   ✓
packages/core →  packages/cli    ✗
packages/core →  chalk, inquirer ✗  (chalk only in runtime/style for tokens; no console)
```

Init prompts use `@inquirer/prompts` in **CLI only** (`packages/cli/src/commands/init/`).

## Build

- Root `"bin": { "expgov": "./dist/cli.js" }`
- `pnpm build` → core tsc + root tsup
- `pnpm cli:dev` → `tsx packages/cli/bin/cli.ts`
- `prepack` sets `EXPGOV_PUBLISH=1` (omit source maps in CLI tarball)
- Global CLI: `pnpm link --global` after build

## Config contract

- File: `expgov.config.ts` at repo root (or `--config`)
- Loader: jiti (`packages/core/src/config/load.ts`)
- Types: `defineConfig`, `ExpgovConfig` from `@expgov/cli/core` or `@expgov/core`

Engineering principles and out-of-scope list: [`systems/principles.md`](../systems/principles.md).
