# Tier governance

**Audience:** Maintainers changing export classification or `expgov.config.ts` tier rules.

---

## Config schema

Built-in buckets (`stable`, `internal`, `advanced`) plus any custom bucket names at the top level:

```ts
tiers: {
  tag: { name: 'exportTier' }, // optional — default sdkTier
  stable: {
    policy: 'public',
    exact: ['RESULT_API_VERSION', 'CliJsonEnvelope'],
    prefix: ['run', 'get', 'build'],
  },
  internal: {
    policy: 'maintainer',
    prefix: ['^internal[A-Z_]', 'Internal$'],
  },
  advanced: {
    policy: 'experimental',
    prefix: ['^experimental[A-Z_]', 'Unsafe$'],
  },
  beta: {
    policy: 'preview',
    prefix: ['^beta'],
  },
}
```

Each bucket supports `policy`, `precedence`, `exact`, and `prefix`.

Resolver: `packages/core/src/config/tierCatalog.ts` → `resolveTierCatalog()`.

---

## Policies

| Policy | Default for | Root flat |
|--------|-------------|-----------|
| `public` | `stable` | allowed |
| `maintainer` | `internal` | **validate fails** |
| `experimental` | `advanced` | **validate fails** |
| `preview` | custom | allowed |
| `deprecated` | custom | allowed |

Implementation: `packages/core/src/config/tierPolicy.ts`.

---

## Classifier priority

Implemented in `packages/core/src/inventory/tiers.ts`:

| Priority | Source |
|----------|--------|
| 1 | Configured JSDoc tier tag — literal must match a bucket name (`@exportTier beta`) |
| 2 | Buckets sorted by `precedence` (lower first; defaults: internal 10, advanced 20, stable 100) |
| 3 | `unclassified` → **validate fails** |

---

## JSDoc tier tag (`tiers.tag`)

Default tag name: **`sdkTier`** (override with `tiers.tag.name`).

Tag literals map **directly** to bucket names — no `tiers.tag.values` remap.

```ts
/**
 * @exportTier stable
 */
export function myPublicApi() {}
```

Supported on exported `function`, `const`, `class`, `interface`, `type`, `enum`.

---

## Prefix matching rules

Resolver: `packages/core/src/config/tiers.ts` → `compilePrefixMatcher`

| Entry form | Behavior |
|------------|----------|
| `run` | `name.startsWith('run')` |
| `^internal[A-Z_]` | `new RegExp('^internal[A-Z_]').test(name)` |
| `/foo.*/i` | RegExp with optional flags |

---

## Defaults

When a built-in bucket is **omitted entirely** from config:

| Tier | Default prefixes |
|------|------------------|
| `stable.prefix` | `run`, `build`, `emit`, `get`, `set`, `reset`, `is`, `format`, `resolve`, `walk`, `directory`, `normalize`, `rethrow`, `noop` |
| `internal.prefix` | `^internal[A-Z_]`, `Internal$` |
| `advanced.prefix` | `^experimental[A-Z_]`, `^beta[A-Z_]`, `^advanced[A-Z_]`, `Unsafe$` |

Custom buckets have **no** default prefixes — define `exact` and/or `prefix` explicitly.

If you define `tiers.stable` (even empty `exact`/`prefix`), built-in defaults are **not** merged — init scaffold includes explicit prefixes.

---

## Inventory metadata

- `tierProvenance` on each symbol: `{ kind, label, bucket? }`
- Tag kind label reflects configured tag name (e.g. `@sdkTier stable`, `@exportTier beta`)
- Config kinds: `tiers.stable.exact`, `tiers.advanced.prefix`, `default stable prefix`, etc.
- Custom tier counts roll into `TierCounts.custom` in snapshots

Verbose inventory shows provenance in brackets.
