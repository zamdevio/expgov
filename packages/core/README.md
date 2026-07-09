# @expgov/core

Pure TypeScript engine for [expgov](https://github.com/zamdevio/expgov) — the same inventory, diff, validate, trend, timeline, and graph logic as the CLI, without shelling out.

**No `console.*` in command paths** — core emits via the log sink; your host wires stdout/stderr.

## Install

Requires **Node.js >= 20**.

```bash
npm install @expgov/core
# or: pnpm add -D @expgov/core
```

### CLI package vs SDK package

| Install | Best for |
|---------|----------|
| `npm install @expgov/cli` | Terminal CLI — binary `expgov` plus `@expgov/cli/core` for config (not a runtime dep on `@expgov/core`) |
| `npm install @expgov/core` | Apps, CI jobs, and libraries that embed export governance without the CLI binary |

The CLI publishes as **`@expgov/cli`** because npm blocks unscoped `expgov` as too similar to `expo`. See [install docs](https://expgov.pages.dev/install).

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
// or from the CLI package: import from '@expgov/cli/core';
```

## Docs

- [SDK overview](https://expgov.pages.dev/sdk)
- [Configuration](https://expgov.pages.dev/config)
- [JSON envelope](https://expgov.pages.dev/json)

## License

MIT
