# SDK example (`@example/sdk-demo`)

Teaching fixture for **expgov** — a minimal TypeScript SDK layout with tier classification, barrel patterns, and tsconfig ↔ `package.json` parity. This is **not** the expgov tool’s dogfood config (see repo root `expgov.config.ts`).

## What you learn

| Topic | Where |
|-------|--------|
| Flat **stable** exports on the root barrel | `src/stable.ts` → `src/index.ts` |
| **Namespace** exports for internal/advanced | `export * as internal` / `advanced` |
| Config tiers (`exact`, `prefix`) | `expgov.config.ts` → `tiers.*` |
| JSDoc `@sdkTier` (tag wins over config) | `SDK_VERSION`, `experimentalProbe` |
| tsconfig `paths` ↔ npm `exports` | `tsconfig.json` + `package.json` |
| Why `validate` blocks some root flats | internal/advanced **policies** on flat exports |

**Rule of thumb:** only **stable** (public policy) symbols should be flat on `src/index.ts`. Put maintainer and experimental APIs behind namespaces.

## Layout

```txt
examples/sdk/
├── expgov.config.ts
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts       # public barrel (comments explain governance)
    ├── types.ts       # public type (flat stable)
    ├── stable.ts      # greet, formatGreeting, SDK_VERSION
    ├── internal.ts    # _internalHelper, internalDiag
    └── advanced.ts    # @sdkTier + betaChannel
```

## Quick start (this monorepo)

```bash
# from expgov repo root
pnpm install
pnpm build

cd examples/sdk
pnpm exec expgov inventory
pnpm exec expgov validate    # should pass
pnpm exec expgov suggest     # no unclassified flats when tiers are complete
```

From repo root without `cd`:

```bash
expgov -C examples/sdk validate
expgov -C examples/sdk inventory
```

## Recommended workflow

```txt
New export surface     init → inventory → validate
Tune tier allowlists   suggest → edit expgov.config.ts → validate
Release review         trend → diff v1..v2 → validate
```

After changing the barrel or tiers, run **inventory** then **validate**. Use **suggest** when you add new flat exports and need allowlist hints.

## Config highlights

```ts
tiers: {
  tag: { name: 'sdkTier', precedence: 'tag' },
  stable:   { exact: ['greet', 'SDK_VERSION', 'GreetOptions'], prefix: ['format'] },
  internal: { prefix: ['_', '^internal[A-Z_]'] },
  advanced: { prefix: ['^beta[A-Z_]', 'experimental'] },
}
```

| Symbol | Tier | How |
|--------|------|-----|
| `greet`, `GreetOptions` | stable | `tiers.stable.exact` |
| `formatGreeting` | stable | `tiers.stable.prefix` (`format`) |
| `SDK_VERSION` | stable | `@sdkTier stable` |
| `_internalHelper` | internal | `_` prefix (under `internal` namespace) |
| `internalDiag` | internal | `^internal[A-Z_]` prefix |
| `experimentalProbe` | advanced | `@sdkTier advanced` |
| `betaChannel` | advanced | `^beta[A-Z_]` prefix |

## `expgov/core` in this repo

Published consumers install `expgov` and import:

```ts
import { defineConfig } from 'expgov/core';
```

Inside the monorepo, `package.json` uses `"expgov": "link:../.."` so jiti loads the **root** package’s `./core` export. Do **not** use `workspace:*` here — `packages/cli` is also named `expgov` and would shadow the root.

## Production SDKs

Real packages usually point `exports` at built `dist/` output. expgov inventories **source barrels** (`src/index.ts` here) — keep `core.rootBarrel` aligned with the file you re-export from, whether source or dist.

## Copying elsewhere

1. Copy `src/`, `expgov.config.ts`, `tsconfig.json`, and `package.json` (drop `link:../..`).
2. `pnpm add -D expgov` and use `import { defineConfig } from 'expgov/core'`.
3. `pnpm exec expgov init -y` if you prefer a fresh scaffold, then merge tier rules from this example.

## Learn more

- [Install & global CLI](../../docs/install.md)
- [Configuration](../../docs/config.md)
- [Commands](../../docs/commands.md)
- [Shipped receipt (Phase I)](../../maintainer/shipped/examples-sdk.md)
