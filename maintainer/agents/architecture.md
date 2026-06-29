# Architecture

## Monorepo layout

```txt
expgov/
├── package.json              # published npm pkg; bin → dist/cli.js; exports ./core
├── expgov.config.ts          # dogfood tier config for @expgov/core
├── tsup.config.ts
├── tsconfig.json
├── packages/
│   ├── core/                 # @expgov/core
│   └── cli/                  # private workspace CLI host
├── maintainer/
└── docs/                     # (planned) user-facing
```

## Packages

| Package | Role |
|---------|------|
| `@expgov/core` | Export governance engine — inventory, diff, validate, tiers, cache |
| `expgov` (root publish) | CLI binary + `expgov/core` subpath for config authors |

## Core layout

```txt
packages/core/src/
├── commands/       # runExports* — beginCommand/finishCommand + reports
├── config/         # load.ts, tiers.ts, tierCatalog, tierPolicy
├── context/        # ProjectContext from expgov.config.ts
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
- Global CLI: `pnpm link --global` after build

## Config contract

- File: `expgov.config.ts` at repo root (or `--config`)
- Loader: jiti (`packages/core/src/config/load.ts`)
- Types: `defineConfig`, `ExpgovConfig` from `expgov/core`

Engineering principles and out-of-scope list: [`systems/principles.md`](../systems/principles.md).
