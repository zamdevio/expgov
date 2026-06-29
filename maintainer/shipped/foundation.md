# Foundation

Monorepo scaffold and core package layout.

---

## P0 — portable scaffold (shipped) · `a78a6fe`

- [x] Monorepo: `packages/core` (`@expgov/core`) + `packages/cli` (thin Commander host)
- [x] Root publish: `"bin": { "expgov": "./dist/cli.js" }`; `exports["./core"]` for config authors
- [x] Build: `pnpm build` → core `tsc` + root `tsup` → `dist/cli.js`, `dist/core.js`, `dist/core.d.ts`
- [x] Dev: `pnpm cli:dev` via `tsx packages/cli/bin/cli.ts`
- [x] `ProjectContext` — package name, core paths, tsconfig, cache root, tier rules, subpath map
- [x] `expgov.config.ts` only — loaded via **jiti**; `defineConfig()` helper; no JSON config
- [x] Config discovery: cwd / git root; `--config` override; merge CLI overrides (`-C`, `--package-name`, `--cache-dir`)
- [x] `ExportError` + structured error codes; `printHelp` / `printHelpHint` long-form usage
- [x] Human report formatters in `packages/core/src/logger/` (meta rows, tier colors, diff deltas)
- [x] `.gitignore`: `dist`, `node_modules`, `.expgov/cache`

---

## P7 — core layout refactor (shipped) · `d372532`

- [x] `packages/core/src/types/` — commands, cli, init, inventory, json, config barrels
- [x] `packages/core/src/shared/constants/` — cache, list, init, inventory, tiers
- [x] Logic files stop re-exporting types; import from `types/*` barrels
- [x] Single CLI entry: `packages/cli/bin/cli.ts` (`bootstrapRuntime` + `buildProgram().parse`)
- [x] Conventional commit message rules in `maintainer/agents/rules.md`
