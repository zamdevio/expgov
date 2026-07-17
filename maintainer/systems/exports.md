# Export governance system

**Audience:** Maintainers changing `packages/core/src/index.ts` or npm/tsconfig export surfaces.

---

## Purpose

`@expgov/core` is an SDK surface. Export governance keeps API growth intentional:

1. What symbols are intentionally public
2. How root barrel growth is measured over time
3. How tsconfig paths stay aligned with npm `exports`

---

## Root barrel

- Public facade: `packages/core/src/index.ts`
- Package: `packages/core/package.json` (`@expgov/core`)
- Dogfood config: repo root `expgov.config.ts`

---

## Commands

| Command | Purpose |
|---------|---------|
| `expgov inventory` | Snapshot current export surface |
| `expgov diff` | Compare refs / working tree; optional `--fail-on-removed` / `--fail-on-tier-violations` CI gates |
| `expgov validate` | Guardrail checks (CI-friendly exit code) |
| `expgov trend` | Count drift across release tags |
| `expgov timeline` | Barrel-change commit history |
| `expgov graph` | Re-export map by source module |

Default `diff` is informational (exit `0`). Opt-in fail flags emit `issues[]` codes `expgov.diff.exports_removed` and `expgov.diff.tier_violation` when enabled. Shared evaluator: `format/diffFail.ts` (`evaluateDiffFailMode`).

---

## Validation checks

`runExportsValidate`:

- tsconfig package paths ⊆ npm `exports` (and reverse)
- no wildcard `@scope/pkg/*` tsconfig path
- no unclassified root flat exports
- no internal/advanced tier symbols flat on root (policy notes)
- published subpath unclassified counts

---

## Cache

Resolving a ref warms `.expgov/cache/<sha>/inventory.full.json`.

See [`cache.md`](./cache.md). Cache dir should be gitignored — see gitignore tip in `git/gitignore-tip.ts`.

---

## After changing exports

1. Add `@sdkTier` or update `tiers.stable.exact` / `.prefix` in `expgov.config.ts`
2. Run `expgov validate`
3. Update `maintainer/shipped/README.md` if shipping a governance slice
