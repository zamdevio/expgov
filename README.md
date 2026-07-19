<div align="center">
  <img src="https://expgov.pages.dev/expgov.svg" width="72" height="72" alt="expgov logo" />

  <h1>expgov</h1>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
  [![Node.js >= 20](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![pnpm](https://img.shields.io/badge/pnpm-package%20manager-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

  <p><strong>Inventory · diff · validate · trend · timeline · graph</strong></p>
  <p>
    Export-governance CLI for TypeScript SDK barrels — classify public surface with tiers, catch drift, and ship safer semver.
  </p>
  <p>
    <a href="https://expgov.pages.dev">Docs</a> ·
    <a href="https://github.com/zamdevio/expgov">GitHub</a> ·
    <a href="#quick-start">Quick start</a>
  </p>
</div>

---

Govern TypeScript SDK barrels with a single `expgov.config.ts`. Inventory exports, diff between refs, validate tier rules, trend release tags, trace barrel history, and map the export graph — **read-only by default** except `init`.

| Surface | URL | Role |
|---------|-----|------|
| **Documentation** | [expgov.pages.dev](https://expgov.pages.dev) | Install, config, commands, workflows, SDK |
| **GitHub** | [github.com/zamdevio/expgov](https://github.com/zamdevio/expgov) | Source, issues, contributions |

## Install

Requires **Node.js >= 20**.

```bash
# CLI devDependency (binary name is still `expgov`)
pnpm add -D @expgov/cli
# or: npm install -D @expgov/cli
```

```bash
# global CLI (optional)
pnpm add -g @expgov/cli
# or: npx expgov --help
```

```bash
# SDK only — programmatic run* APIs (not needed for CLI or config)
pnpm add -D @expgov/core
# or: npm install -D @expgov/core
```

**npm packages:** [`@expgov/cli`](https://www.npmjs.com/package/@expgov/cli) (CLI + `@expgov/cli/core` config types) and [`@expgov/core`](https://www.npmjs.com/package/@expgov/core) (SDK). npm blocks the unscoped name `expgov` as too similar to [`expo`](https://www.npmjs.com/package/expo) — see [Install](https://expgov.pages.dev/install).

The **`@expgov/cli`** tarball ships a self-contained CLI (`dist/cli.js` — core compiled in at build time). It exposes **`@expgov/cli/core`** for optional `defineConfig` in `expgov.config.ts`.

## SDK first (`@expgov/core`)

Use the core engine when you want programmatic control — no shelling out, no Commander, no `console.*` in command paths.

```ts
import { runValidate } from '@expgov/core';
import {
  initProjectContext,
  setRunOptions,
  resetRunOptions,
} from '@expgov/core/internal';

initProjectContext({ cwd: process.cwd() });
setRunOptions({ json: true, quiet: true });
const exitCode = runValidate();
resetRunOptions();
```

Why SDK consumers pick this:

- **Same engines as the CLI** — `runInventory`, `runDiff`, `runValidate`, `runTrend`, `runTimeline`, `runGraph`, and more.
- **Host-neutral** — your script wires the log sink; core emits structured output or JSON envelopes.
- **Config types included** — `@expgov/cli` ships `@expgov/cli/core`; SDK package is for `run*` command APIs without the binary.
- **Stable `--json` contract** — envelope shape matches the CLI for CI parity.

Primary references:

- [SDK overview](./docs/sdk/README.md)
- [Example SDK](./examples/sdk/README.md)
- [JSON contract](./docs/cli/json.md)

## Why teams choose expgov

- **Governance without surprises** — commands are read-only except `init`; tier rules live in TypeScript config you review in PRs.
- **Barrel archaeology** — `timeline` traces commits that touched your root barrel; `trend` counts exports across release tags.
- **Drift visibility** — `diff` compares export surfaces between refs; `graph` maps namespaces, re-exports, and module fan-in.
- **Tier enforcement** — `@sdkTier` JSDoc plus `tiers.*` config buckets; `validate` fails on unclassified or policy violations.
- **Machine output** — global `--json` with stable envelopes for CI and scripting.
- **Thin CLI host** — Commander, chalk, and inquirer stay in `packages/cli`; domain logic lives in `@expgov/core`.

## Quick start

```bash
expgov init
expgov validate
expgov inventory
expgov diff HEAD
expgov timeline @4w
expgov graph
```

JSON in CI:

```bash
expgov validate --json --silent
expgov inventory --json --quiet
```

## Commands

| Command | Purpose |
|---------|---------|
| `init` | Scaffold `expgov.config.ts` |
| `inventory` | Barrel snapshot — flat count, tiers, namespaces |
| `diff` | Compare export surfaces between refs |
| `validate` | Governance checks (exit 0/1) |
| `doctor` | Setup hygiene — config paths, cache gitignore |
| `suggest` | Dry-run tier allowlist hints |
| `trend` | Export counts across release tags |
| `timeline` | Git log of barrel edits with summary metrics |
| `graph` | Export surface graph and analytics |
| `help` | Command reference |

Global flags: `--json`, `--quiet`, `--silent`, cache, cwd, config. See [CLI flags](./docs/cli/flags.md) and [JSON contract](./docs/cli/json.md).

## Capability matrix

| Area | Highlights |
|------|------------|
| **Classification** | `@sdkTier` JSDoc, nested `tiers.*` buckets, custom policies |
| **Parity** | tsconfig `paths` ↔ npm `exports` checks |
| **Cache** | Per-SHA snapshots; worktree `files.json` freshness gate |
| **Insights** | Largest module, diff deltas, trend jumps on governance commands |
| **Ranges** | Git ref ranges (`A..B`), time ranges (`@4w`), tag windows |
| **Automation** | `--json` envelopes; exit codes for CI gates |

## Documentation journey

| Step | Where to go |
|------|-------------|
| Start | [Workflows](./docs/guides/workflows.md) · [Governance](./docs/governance.md) |
| Commands | [Commands hub](./docs/commands/README.md) |
| CLI | [CLI overview](./docs/cli/README.md) |
| SDK | [SDK](./docs/sdk/README.md) |
| Config | [Configuration](./docs/config.md) |

Hosted docs: [expgov.pages.dev](https://expgov.pages.dev)

## Repository layout

| Path | Responsibility |
|------|----------------|
| `packages/core/` | Domain engine (`run*` commands, inventory, tiers, cache) |
| `packages/cli/` | Commander host, banners, help colorization, `init` prompts |
| `apps/docs/` | VitePress site (content synced from `docs/`) |
| `docs/` | Source-of-truth user documentation |
| `examples/sdk/` | Teaching fixture for tier classification |
| `maintainer/` | Contributor phases, agents, systems maps |

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
node dist/cli.js validate
pnpm docs:dev       # sync + VitePress (port 8284)
pnpm docs:build
pnpm docs:deploy    # build + Cloudflare Pages (requires wrangler auth)
```

Dogfood config: `./expgov.config.ts` at repo root.

## License

MIT — see [LICENSE](./LICENSE).
