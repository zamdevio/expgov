# Tier governance

**Audience:** Maintainers changing export classification or `expgov.config.ts` tier rules.

---

## Config schema (nested)

```ts
tiers: {
  stable: {
    exact: ['RESULT_API_VERSION', 'CliJsonEnvelope'],
    prefix: ['run', 'get', 'build', '^customPrefix'],
  },
  internal: {
    exact: [],
    prefix: ['^internal[A-Z_]', 'Internal$'],
  },
  advanced: {
    prefix: ['^experimental[A-Z_]', 'Unsafe$'],
  },
}
```

Each tier has optional `exact` (literal export names) and `prefix` (string prefix or regex).

---

## Classifier priority

Implemented in `packages/core/src/inventory/tiers.ts`:

| Priority | Source |
|----------|--------|
| 1 | `@sdkTier stable \| advanced \| internal` on exported declaration JSDoc |
| 2 | `tiers.internal.exact` / `.prefix` |
| 3 | `tiers.advanced.exact` / `.prefix` |
| 4 | `tiers.stable.exact` / `.prefix` |
| 5 | `unclassified` → **validate fails** |

Internal and advanced win over stable when multiple buckets could match.

---

## `@sdkTier` JSDoc

```ts
/**
 * @sdkTier stable
 */
export function myPublicApi() {}
```

Supported on exported `function`, `const`, `class`, `interface`, `type`, `enum`.

Tag precedence is highest — overrides config buckets.

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

When a tier bucket is **omitted entirely** from config:

| Tier | Default prefixes |
|------|------------------|
| `stable.prefix` | `run`, `build`, `emit`, `get`, `set`, `reset`, `is`, `format`, `resolve`, `walk`, `directory`, `normalize`, `rethrow`, `noop` |
| `internal.prefix` | `^internal[A-Z_]`, `Internal$` |
| `advanced.prefix` | `^experimental[A-Z_]`, `^beta[A-Z_]`, `^advanced[A-Z_]`, `Unsafe$` |

If you define `tiers.stable` (even empty `exact`/`prefix`), defaults are **not** merged — init scaffold includes explicit prefixes.

---

## Inventory metadata

- `tierSource: 'tag'` when `@sdkTier` matched
- `tierSource: 'fallback'` when config bucket matched

Verbose inventory shows tier source in brackets.
