---
description: "expgov SDK (@expgov/core) — install the core package, programmatic export governance, and the same engines as the CLI without shelling out."
---

# SDK overview

The expgov CLI is a thin host over **`@expgov/core`** — pure domain logic with no Commander dependency and no `console.*` in command paths. Use the SDK to embed inventory, diff, validate, trend, timeline, and graph in scripts, CI, workers, or your own tools.

## Install

### SDK only (recommended for programmatic use)

```bash
pnpm add -D @expgov/core
# or: npm install -D @expgov/core
```

```typescript
import { initProjectContext, runExportsValidate } from '@expgov/core';
```

### CLI package (`@expgov/cli`)

```bash
pnpm add -D @expgov/cli
```

```typescript
// optional — plain object export works; types recommended for editor checking
import { defineConfig } from '@expgov/cli/core';
```

| Goal | Install |
|------|---------|
| CLI + config types (`@expgov/cli/core`) | `@expgov/cli` as devDep |
| Programmatic `runExports*` APIs | `@expgov/core` as devDep |

See [Install](../install.md) for why the CLI publishes as **`@expgov/cli`** (npm blocks unscoped `expgov` as too similar to `expo`).

## Host contract

1. **`initProjectContext({ cwd, config })`** — loads `expgov.config.ts` via jiti.
2. **`setRunOptions`** — `--json`, `--quiet`, cache flags, list truncation.
3. **`runExports*`** — returns exit code where applicable.
4. **`subscribeLogSink`** — optional human report lines.

## Programmatic commands

| Function | CLI equivalent |
|----------|----------------|
| `runExportsInventory` | `expgov inventory` |
| `runExportsDiff` | `expgov diff` |
| `runExportsValidate` | `expgov validate` |
| `runExportsTrend` | `expgov trend` |
| `runExportsTimeline` | `expgov timeline` |
| `runExportsGraph` | `expgov graph` |
| `runExportsSuggest` | `expgov suggest` |
| `runExportsDoctor` | `expgov doctor` |

## Example (validate in CI)

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
process.exit(exitCode);
```

## Related

- [Configuration](../config.md)
- [JSON output](../cli/json.md)
- [Workflows](../guides/workflows.md)
