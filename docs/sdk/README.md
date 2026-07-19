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
import { runValidate } from '@expgov/core';
import { initProjectContext } from '@expgov/core/internal';
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
| Programmatic `run*` command APIs | `@expgov/core` as devDep |

See [Install](../install.md) for why the CLI publishes as **`@expgov/cli`** (npm blocks unscoped `expgov` as too similar to `expo`).

## Host contract

1. **`initProjectContext({ cwd, config })`** — from `@expgov/core/internal`; loads `expgov.config.ts` via jiti.
2. **`setRunOptions`** — `@expgov/core/internal`; `--json`, `--quiet`, cache flags, list truncation.
3. **`run*` command APIs** — from `@expgov/core` (stable); returns exit code where applicable.
4. **`subscribeLogSink`** — `@expgov/core/internal`; optional human report lines.

| Subpath | Role |
|---------|------|
| `@expgov/core` | Stable — `defineConfig`, `run*` command APIs, config/JSON types, `ExportError` |
| `@expgov/core/advanced` | Tooling — config resolve, init helpers, help formatters |
| `@expgov/core/internal` | CLI host — project context, run options, log sinks, style |

## Programmatic commands

| Function | CLI equivalent |
|----------|----------------|
| `runInventory` | `expgov inventory` |
| `runDiff` | `expgov diff` |
| `runValidate` | `expgov validate` |
| `runTrend` | `expgov trend` |
| `runTimeline` | `expgov timeline` |
| `runGraph` | `expgov graph` |
| `runSuggest` | `expgov suggest` |
| `runDoctor` | `expgov doctor` |

## Example (validate in CI)

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
process.exit(exitCode);
```

## Related

- [Configuration](../config.md)
- [JSON output](../cli/json.md)
- [Workflows](../guides/workflows.md)
