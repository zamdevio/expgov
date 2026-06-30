# Phase I — SDK example workspace (`examples/sdk/`)

**Status:** I1 shipped — skeleton + README in [`examples/sdk/`](../../examples/sdk/). I2/I3 optional.

**Companion:** [`../systems/exports.md`](../systems/exports.md) · [`../systems/config.md`](../systems/config.md) · [`sourceProfiles.md`](./sourceProfiles.md) (Phase H)

**Reference pattern:** nodehunter-style `examples/sdk/` — small consumer-shaped repo inside the monorepo: one core package, one `expgov.config.ts`, tier buckets, and a short README that runs `expgov init` → `inventory` → `validate` out of the box.

---

## Goals

1. Give SDK users a **clone-and-run** layout separate from expgov’s dogfood config (which classifies `@expgov/core` itself).
2. Document the **minimum** `expgov.config.ts` fields for a single-package SDK (`packageName`, `core.dir`, `core.rootBarrel`, `tiers`).
3. Prove the CLI + core path against a fixture that looks like a real library repo (not the tool’s own barrel).
4. Optional CI smoke: `expgov validate` in `examples/sdk/` on PR (after example is stable).

---

## Non-goals (v1 slice)

- Publishing `examples/sdk` as its own npm package
- Monorepo-with-workspaces example (defer to slice I2)
- Live network / registry install — example uses workspace `expgov` + `@expgov/core` via `pnpm` file/workspace refs or documented `pnpm link`

---

## Target layout

```txt
examples/sdk/
├── README.md                 # Quick start for SDK authors
├── expgov.config.ts          # Minimal tier + core paths
├── package.json              # name: @example/sdk-demo (or similar)
├── tsconfig.json
└── src/
    ├── index.ts              # Public barrel — mixed tier exports
    ├── stable.ts
    ├── internal.ts
    └── advanced.ts
```

**Dogfood vs example:**

| | Root `expgov.config.ts` | `examples/sdk/expgov.config.ts` |
|--|---------------------------|----------------------------------|
| Purpose | Govern `@expgov/core` exports | Teach consumers |
| `packageName` | `@expgov/core` | `@example/sdk-demo` |
| `core.dir` | `packages/core` | `.` or `src` |
| Tiers | Full dogfood allowlists | Small intentional violations for `validate` demos |

---

## Slices (one PR each)

### I1 — Skeleton + README

- [x] Create `examples/sdk/` tree (barrel + 3–4 modules, `@sdkTier` on some symbols)
- [x] `expgov.config.ts` with conservative `tiers.stable.exact` (match P13 init defaults + a few entries)
- [x] `README.md`: install expgov, `cd examples/sdk`, `expgov inventory`, `expgov validate`, link to `docs/config.md`
- [x] Root `package.json` / workspace: include `examples/sdk` via `pnpm-workspace.yaml` (`examples/*`)
- [x] `.gitignore` entry for `examples/sdk/.expgov/` if cache enabled (covered by root `.expgov/cache`)

**Exit:** From repo root, `pnpm build && cd examples/sdk && expgov validate` passes.

### I2 — Monorepo variant (optional)

- [ ] `examples/sdk-monorepo/` — `packages/api` + root config with `repoRoot` / subpaths
- [ ] README cross-link from I1

### I3 — CI smoke (optional)

- [x] `ci.yml` job step: build → `expgov -C examples/sdk validate` (after dogfood validate)
- [ ] Document in [`tooling-docs.md`](../shipped/tooling-docs.md) when shipped

---

## Config sketch (I1)

```ts
import { defineConfig } from 'expgov/core';

export default defineConfig({
  packageName: '@example/sdk-demo',
  core: {
    dir: '.',
    rootBarrel: 'src/index.ts',
    subpaths: { '.': 'src/index.ts' },
  },
  tiers: {
    tag: { name: 'sdkTier', precedence: 'tag' },
    stable: { exact: ['greet', 'SDK_VERSION', 'GreetOptions'], prefix: ['format'] },
    internal: { prefix: ['_', '^internal[A-Z_]'] },
    advanced: { prefix: ['^beta[A-Z_]', 'experimental'] },
  },
});
```

Adjust names to match the fixture barrel. Keep tier lists small so `suggest` and `validate` output are readable in docs.

---

## Docs touchpoints (when shipping)

| Surface | Update |
|---------|--------|
| `docs/install.md` | “Try the example” → `examples/sdk/README.md` |
| `maintainer/agents/architecture.md` | `examples/` in monorepo layout |
| `maintainer/shipped/` | Receipt slice when I1 lands |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| Phase **E** remainder (soft) | Example README can show `inventory` insights |
| P13 conservative init (shipped) | Align example tier scaffold with `expgov init` defaults |
| Public `docs/` stubs (shipped) | Link targets for config/commands |

**Does not block** Phase E, B, or C — schedule after E or in parallel once graph/timeline insights are not required for the README.

---

## Open questions

1. **Workspace membership** — `examples/*` in `pnpm-workspace.yaml`; example depends on root via `"expgov": "link:../.."` (avoids duplicate `expgov` name clash with `packages/cli`).
2. **Package name** — `@example/sdk-demo` vs `@expgov/example-sdk` for npm collision safety.
3. **Committed cache** — never; same as dogfood (`.expgov/cache` gitignored).

---

## Related

- [`active-phase.md`](./active-phase.md) — current sprint queue
- [`commands.md`](./commands.md) — verb contracts the README demonstrates
- [`../systems/principles.md`](../systems/principles.md) — config-as-code only
