# @expgov/core

Pure TypeScript engine for [expgov](https://github.com/zamdevio/expgov) — the same inventory, diff, validate, trend, timeline, and graph logic as the CLI, without shelling out.

**No `console.*` in command paths** — core emits via the log sink; your host wires stdout/stderr.

## Install

Requires **Node.js >= 20**.

```bash
npm install @expgov/core
# or: pnpm add @expgov/core
```

### CLI package vs SDK package

| Install | Best for |
|---------|----------|
| `npm install expgov` | Terminal CLI — self-contained binary plus optional `expgov/core` import from the same tarball (not a runtime dep on `@expgov/core`) |
| `npm install @expgov/core` | Apps, CI jobs, and libraries that embed export governance without the CLI binary (recommended for imports) |

You do **not** need both for most projects. Pick the CLI for command-line use, or `@expgov/core` when you import APIs directly.

## Quick start

```ts
import {
  initProjectContext,
  runExportsValidate,
  setRunOptions,
  resetRunOptions,
} from '@expgov/core';

initProjectContext({ cwd: process.cwd() });
setRunOptions({ json: true, quiet: true });
const exitCode = runExportsValidate();
resetRunOptions();
```

## Config types

```ts
import { defineConfig, type ExpgovConfig } from '@expgov/core';

export default defineConfig({
  packageName: '@my/sdk',
  core: {
    dir: 'packages/core',
    rootBarrel: 'packages/core/src/index.ts',
    subpaths: { '.': 'src/index.ts' },
  },
  tsconfig: 'tsconfig.json',
  tiers: {
    stable: { exact: ['RESULT_API_VERSION'], prefix: ['run'] },
    internal: { prefix: ['^internal[A-Z_]'] },
    advanced: { prefix: ['^experimental[A-Z_]'] },
  },
} satisfies ExpgovConfig);
```

## Commands (programmatic)

| Function | Role |
|----------|------|
| `runExportsInventory` | Barrel snapshot and tier rollup |
| `runExportsDiff` | Compare export surfaces between refs |
| `runExportsValidate` | Governance checks (exit code 0/1) |
| `runExportsTrend` | Export counts across release tags |
| `runExportsTimeline` | Git log of barrel edits |
| `runExportsGraph` | Export surface graph |
| `runExportsSuggest` | Dry-run tier allowlist hints |
| `runExportsDoctor` | Setup hygiene checks |

Call `initProjectContext({ cwd, config })` before any command. Use `setRunOptions` for `--json`, `--quiet`, cache flags, and list truncation.

## Docs

- [SDK overview](https://expgov.pages.dev/sdk)
- [Configuration](https://expgov.pages.dev/config)
- [JSON envelope](https://expgov.pages.dev/json)

## License

MIT
