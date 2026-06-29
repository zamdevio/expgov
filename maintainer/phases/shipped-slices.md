# Shipped slices

Closed work only. Check here before re-implementing. Durable engineering detail lives in [`systems/`](../systems/README.md).

**Commits on `main`:** `a78a6fe` → `651bf29` (2026-W26) · `d372532` → `c5fcbab` (P7–P15).

---

## Timeline (ISO weeks)

| Week | Slice | Receipt |
|------|-------|---------|
| 2026-W26 | **P0** — portable scaffold | Extract archlab `scripts/exports` → standalone `expgov`; tsup bundle; TypeScript-only config (`a78a6fe`) |
| 2026-W26 | **P0a** — inventory engine | Barrel parse, symbol graph, tier/category rollup, `@sdkTier` JSDoc (`a78a6fe`) |
| 2026-W26 | **P0b** — cache layer | Per-SHA `.expgov/cache/` snapshots; hit/miss/refresh/bypass; worktree key (`a78a6fe`) |
| 2026-W26 | **P0c** — git & refs | Worktree/HEAD/tag/commit refs; diff ranges; timeline log; version tags (`a78a6fe`) |
| 2026-W26 | **P0d** — governance commands | `inventory`, `diff`, `validate`, `trend`, `timeline`, `graph` wired CLI + core (`a78a6fe`) |
| 2026-W26 | **P1** — styled runtime | Log policy, JSON envelopes, global `-j/-q/-s`, banners, `init`, cache gitignore tip (`4d53612`) |
| 2026-W26 | **P1a** — CLI host polish | Colorized Commander help, per-command box banners, `-r` on `init`, dogfood config (`4d53612`) |
| 2026-W26 | **P2** — nested tier schema | `tiers.{stable,internal,advanced}.{exact,prefix}`; maintainer hub; `.cursor/rules` (`daa4615`) |
| 2026-W26 | **P2a** — command footer | Reports first; `summary` / `note` / `footer` log events; drop flat tier keys (`651bf29`) |
| 2026-W26 | **P3** — user docs | `docs/` stubs: install, config, commands, `json.md` |
| 2026-W26 | **P3a** — CI gate | GitHub Actions: `pnpm build`, `typecheck`, `expgov validate` on PRs |
| 2026-W26 | **P4** — cache rename | Default cache dir `.exports/cache` → `.expgov/cache` |
| 2026-W26 | **P4a** — `doctor` | Config discovery, cache gitignore, parity drift hints |
| 2026-W26 | **P5** — `suggest` | Dry-run `tiers.stable.exact` suggestions for unclassified flats |
| 2026-W26 | **P6** — CLI DX (A1–A3) | `-T/--top` / `-F/--full` listing, short aliases, TTY color defaults (`4ea5019`) |
| 2026-W26 | **P7** — core layout refactor | `types/`, `shared/constants/`; thin `packages/cli/bin/cli.ts` entry (`d372532`) |
| 2026-W26 | **P8** — `version` command | Build-time semver injection; `expgov version` / global `-V` (`e00cdf3`) |
| 2026-W26 | **P9** — tier provenance (A4) | `tierProvenance` labels; logger `reports/` split; `-T/-F` list flags (`4f943b3`) |
| 2026-W26 | **P10** — tier policies + style | Custom tier buckets + `policy`; `style` tokens only in `runtime/style.ts` (`1408c6e`) |
| 2026-W26 | **P11** — tier rollup + config types | Custom tiers in rollups; JSDoc re-export chain; `types/config/` barrel |
| 2026-W26 | **P12** — cache config + CI hygiene | `cache.enabled`/`cache.dir`; `ci.yml` + `architecture.yml`; knip/madge/vitest; `types/` consolidation (`55eab70`) |
| 2026-W26 | **P13** — conservative init | Empty built-in tier buckets; `--rich` commented opt-in hints (`c5fcbab`) |
| 2026-W26 | **P14** — Commander-first help (A5) | `printCliHelp`; workflows appendix; per-command Examples/Related (`HEAD`) |
| 2026-W26 | **P15** — list truncation hints (A1b) | Report-layer `…and N more`; graph/timeline `hiddenCount` fixes (`HEAD`) |
| 2026-W26 | **P16** — worktree files index (2e) | `files.json` + `inputFilesEpoch` hash gate under `__worktree__/` (`e74abeb`) |

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

## P0a — inventory engine (shipped) · `a78a6fe`

- [x] Root barrel parse (`parse-barrel.ts`) — flat exports + `export * as` namespaces
- [x] Symbol resolution — `symbolKind`, `tsKind`, target npm subpath, source module edges
- [x] `buildInventorySnapshot` — root + published subpath rollups, SDK-wide tier sums
- [x] Export categories (`categories.ts`) — run/type/config/other heuristics
- [x] `@sdkTier` JSDoc on declarations (`inventory/tiers.ts`) — highest classifier priority
- [x] Fingerprinting for cache invalidation (`fingerprint.ts`)
- [x] Snapshot schema version (`SNAPSHOT_VERSION`, `TOOL_VERSION` in `paths.ts`)
- [x] Diff engine (`format/diff.ts`) — added/removed flats, tier violation notes, summary deltas
- [x] Map: [`systems/exports.md`](../systems/exports.md), [`systems/tiers.md`](../systems/tiers.md)

---

## P0b — cache layer (shipped) · `a78a6fe`

- [x] Cache root: `.expgov/cache/` (configurable `cache.dir`)
- [x] Per-SHA dirs: `inventory.full.json`, `timeline.summary.json`
- [x] Worktree key `__worktree__` for uncommitted barrel state
- [x] Status: `hit` | `miss` | `refresh` | `bypass` | `disabled` (`cache.enabled: false`)
- [x] CLI flags: `-f/--force` (rebuild + write), `--no-cache` (skip read/write)
- [x] `cache/meta.json` heal + validation
- [x] Profiles: `full` (inventory/graph/diff) vs `timeline` (lighter warm for log)
- [x] Map: [`systems/cache.md`](../systems/cache.md)

---

## P0c — git & refs (shipped) · `a78a6fe`

- [x] `resolveSourceRef` — omit = worktree, `HEAD`, tags, short SHAs, explicit commits
- [x] `parseDiffRange` — single ref or `A..B` tag/SHA ranges; default HEAD → worktree
- [x] `listVersionTags` — configurable `git.tagPattern` (default `v*`) for trend
- [x] `listBarrelCommits` + `parseTimelineRange` — `@4w`, `@3m`, ISO dates (`time/ranges.ts`)
- [x] `TimelineWarmer` — stderr progress while warming per-commit cache
- [x] Git run stats for verbose inventory/timeline

---

## P0d — governance commands (shipped) · `a78a6fe`

| Command | Core entry | Shipped behavior |
|---------|------------|------------------|
| `inventory [ref]` | `runExportsInventory` | Root barrel tiers, categories, subpath rollups; `-v` symbol table |
| `diff [range]` | `runExportsDiff` | Added/removed flats, tier violations, summary deltas |
| `validate` | `runExportsValidate` | tsconfig ↔ npm `exports` parity; unclassified root flats → exit 1 |
| `trend` | `runExportsTrend` | Flat/stable/adv/int per tag; Δ footer between first/last in window |
| `timeline [range]` | `runExportsTimeline` | Barrel-only git log; flat count + Δ per commit |
| `graph [ref]` | `runExportsGraph` | Target subpath groups, namespaces, top source modules |
| `help [topic]` | `printHelp` | Sectioned usage (all, per-command, global flags) |

- [x] Per-command `-v/--verbose` where applicable
- [x] Map: [`commands.md`](./commands.md)

---

## P1 — styled runtime (shipped) · `4d53612`

- [x] `RunOptions` — `json`, `jsonPretty`, `quiet`, `silent`, `noColor`, `verbose`, log prefix flags
- [x] `runtime/policy.ts` — gates for banner, info, tips, primary reports, verbose detail
- [x] Log emitter + `createConsoleLogSink` — `log`, `meta`, `report`, `header`, `raw`, `envelope`
- [x] `coreLog` / `coreLogTip` — `[expgov] [info/warn/tip]` branded lines
- [x] `beginCommand` / `finishCommand` + wall-clock timer
- [x] JSON envelope — `{ ok, kind, data, issues, meta }`; `RESULT_API_VERSION = '1'`
- [x] `bootstrapRuntime()` — install default sink once
- [x] Global CLI flags: `-j/--json`, `-q/--quiet`, `-s/--silent`, `--no-color`, `-C/--cwd`, `--config`
- [x] Cache gitignore tip — one per process when `.git` + cache exist but path not in `.gitignore`
- [x] Map: [`systems/cli.md`](../systems/cli.md)

---

## P1a — CLI host polish (shipped) · `4d53612`

- [x] `init` command — scaffold `expgov.config.ts`; monorepo vs single-package detection
- [x] Init flags: `-y/--yes`, `-f/--force`, `-r/--rich` (commented cache + tier opt-in examples)
- [x] `@inquirer/prompts` confirm flows (CLI only); `shouldSkipInteractivePrompts` for CI/TTY
- [x] `maybePrintCommandBanner` — box header per command (off under `--json` / `--silent`)
- [x] `configureCliHelp` — colorized Usage/Options; `(default: …)` bright yellow (`style.highlight`)
- [x] Root `expgov.config.ts` dogfood — `@expgov/core` barrel, classified exports, tsconfig path parity
- [x] `tsconfig.json` paths: `@expgov/core` + `expgov/core` for config resolution

---

## P2 — nested tier schema (shipped) · `daa4615`

- [x] `TierBucket` — `{ exact?: string[]; prefix?: string[] }` per stability level
- [x] `TierRulesConfig` — `stable`, `internal`, `advanced` buckets (+ custom buckets later in P10)
- [x] `config/tiers.ts` — `compilePrefixMatcher` (literal prefix vs `/regex/` / metachar)
- [x] Classifier order: `@sdkTier` → internal → advanced → stable → `unclassified`
- [x] Default prefix sets when tier bucket **omitted**; explicit empty bucket opts out (P13)
- [x] `init` template emits nested `tiers` block
- [x] Validate messages reference `tiers.<tier>.exact` / `.prefix`
- [x] Map: [`systems/tiers.md`](../systems/tiers.md), [`systems/config.md`](../systems/config.md)

---

## P2 — maintainer hub (shipped) · `daa4615`

- [x] `maintainer/README.md` — entrypoint index
- [x] `maintainer/phases/` — `active-phase`, `commands`, `architecture`, `shipped-slices` (this file)
- [x] `maintainer/agents/` — `architecture`, `rules`, `onboarding`
- [x] `maintainer/systems/` — `tiers`, `exports`, `config`, `cli`, `cache`
- [x] `.cursor/rules/expgov.mdc` — agent source-of-truth (build gate, core purity, tier schema)
- [x] `maintainer/temp/` scratch (gitignored)

---

## P2a — command footer (shipped) · `651bf29`

- [x] Human output order: **banner → report/meta → tips → footer**
- [x] `runtime/footer.ts` — `emitCommandFooter` with optional count summary
- [x] Log events: `summary` (counts line), `note`, `footer` (`command · ok|fail · Nms`)
- [x] All `runExports*` commands call `finishCommand` **after** human reports
- [x] Footer counts per command (e.g. validate: violations/stable/unclassified; inventory: flat/stable)
- [x] Timer no longer emits mid-command line; duration only in footer (or JSON `meta.durationMs`)
- [x] Removed `printCommandLine`, `command-start` / `command-end` events
- [x] Removed flat tier keys (`stableExact`, etc.) and `legacy-tip.ts`

---

## P6 — CLI DX Phase A1–A3 (shipped) · `4ea5019`

- [x] `shared/listing.ts` — `resolveListLimit`, `limitList`, default top 10
- [x] `-T, --top` / `-F, --full` on inventory, diff, graph, trend, timeline (dropped ambiguous `-l`)
- [x] Truncation hints: `…and N more (use -F/--full or -T/--top <n>)`
- [x] Global aliases: `-c`, `-pn`, `-cd`, `-ncl`, `-nlg`, `-nlc`; `-nch` for `--no-cache`
- [x] Color: TTY + no `NO_COLOR` default; removed positive `--color` flag
- [x] Empty section messages in graph/inventory verbose lists

---

## P7 — core layout refactor (shipped) · `d372532`

- [x] `packages/core/src/types/` — commands, cli, init, inventory, json, config barrels
- [x] `packages/core/src/shared/constants/` — cache, list, init, inventory, tiers
- [x] Logic files stop re-exporting types; import from `types/*` barrels
- [x] Single CLI entry: `packages/cli/bin/cli.ts` (`bootstrapRuntime` + `buildProgram().parse`)
- [x] Conventional commit message rules in `maintainer/agents/rules.md`

---

## P8 — `version` command (shipped) · `e00cdf3`

- [x] `expgov version` — CLI + `@expgov/core` SDK semver lines
- [x] Global `-V` when no subcommand (Commander version flag)
- [x] Build-time defines `__EXPGOV_CLI_VERSION__` / `__EXPGOV_SDK_VERSION__` via tsup
- [x] `--check` / `--reset` for npm registry update hint + cached state

---

## P9 — tier provenance + logger split (A4) (shipped) · `4f943b3`

- [x] `tierProvenance` on snapshot symbols — `{ kind, label, bucket? }` (replaced `tierSource`)
- [x] `classifySymbolTierWithProvenance()` — tag, config-exact, config-prefix, default-prefix labels
- [x] Validate notes: `tier sources: @tag=N · config=N · default-prefix=N`
- [x] Verbose inventory shows provenance in brackets
- [x] Logger split: `logger/report.ts` + `logger/reports/{inventory,diff,validate,…}.ts`
- [x] Graph module edge provenance in verbose output
- [x] `types/inventory/` barrel for tier types

---

## P10 — tier policies + style boundary (shipped) · `1408c6e`

- [x] **Custom tier buckets** at top level (`beta`, `deprecated`, `preview`, …) with `policy` + optional `precedence`
- [x] `config/tierCatalog.ts` — `resolveTierCatalog()`; built-in defaults: internal 10, advanced 20, stable 100
- [x] `config/tierPolicy.ts` — `public` / `maintainer` / `experimental` / `preview` / `deprecated`
- [x] Tag literals = bucket names directly (removed `tiers.tag.values` remap)
- [x] `TierCounts.custom` for non-built-in tier rollups
- [x] **Chalk only in** `runtime/style.ts` — logger/help use `style.*` tokens via `emitLog`
- [x] Policy-driven validate/diff root-flat violations (`maintainer` / `experimental` block flat on root)

---

## P11 — tier rollup + config types (shipped) · 2026-W26

- [x] `sumSdkTierCounts()` merges `root.custom` (SDK-wide rollups were missing custom tiers)
- [x] Root barrel + SDK-wide inventory sections show custom tier rows (`printTierRollupLines`)
- [x] `tierCountsFooterFields` / `formatTierCountsNote` — inventory + validate footers/notes include custom buckets
- [x] Diff report: custom tier count deltas
- [x] `inventory/reexport-chain.ts` — follow `export` / `export type` re-exports for JSDoc tier tags (max 12 hops)
- [x] `tiers.tag.precedence` — `tag` (default) vs `config` when both match
- [x] `types/config/` barrel — `ExpgovConfig`, `TierBucket`, `ProjectContext`, … (`config/types.ts` removed)
- [x] `MAX_REEXPORT_DEPTH` in `shared/constants/inventory.ts`
- [x] Validate note: `tier by bucket` (tag + config counts per bucket name)

---

## P3 — user docs (shipped) · 2026-W26

- [x] `docs/README.md` — index + quick start
- [x] `docs/install.md` — requirements, init, local dev, cache
- [x] `docs/config.md` — `expgov.config.ts` fields, tiers, policies, `@sdkTier`
- [x] `docs/commands.md` — all wired verbs + global flags
- [x] `docs/json.md` — `--json` contract, `kind` values, CI examples

---

## P3a — CI gate (shipped) · 2026-W26

- [x] `.github/workflows/validate.yml` — `pnpm install`, `build`, `typecheck`, `node dist/cli.js validate`
- [x] Triggers on `push` to `main` and `pull_request`

---

## P4 — cache rename (shipped) · 2026-W26

- [x] Default `cacheDir`: `.expgov/cache` (`DEFAULT_CACHE_DIR` in `paths.ts`)
- [x] Init scaffold, gitignore tip, help text, dogfood config, `.gitignore`
- [x] `doctor` warns when legacy `.exports/cache/` still present

---

## P4a — `doctor` command (shipped) · 2026-W26

- [x] `runExportsDoctor` — config paths, cache gitignore, tsconfig/npm drift hints
- [x] CLI `doctor` + help/banner; `--json` kind `doctor`
- [x] Exit 0 healthy / 1 when actionable warnings remain

---

## P5 — `suggest` command (shipped) · 2026-W26

- [x] `runExportsSuggest` — collect unclassified flat exports; `formatStableExactSnippet`
- [x] CLI `suggest` + help/banner; `--json` kind `suggest`
- [x] Exit 0 when clean, 1 when names to add (dry-run — no config writes)

---

## P12 — cache config + CI hygiene (shipped) · `55eab70`

- [x] `cache: true | false | { enabled?, dir? }` — config-level disable (`disabled` cache status)
- [x] `resolveCacheOptions` — merges CLI flags with `cache.enabled`
- [x] Domain types under `packages/core/src/types/`; constants under `shared/constants/`
- [x] `ci.yml` — typecheck, test, build, madge:circular, `expgov validate`
- [x] `architecture.yml` — advisory knip + madge orphans/leaves
- [x] Root `knip.json`, `vitest.config.ts`, `scripts/madge/run.mjs`
- [x] `printCliHelp` scaffolding; `maintainer/phases/worktree.md` plan
- [x] Workspace CLI package name `expgov` (publish root binary)

---

## P13 — conservative init (shipped) · `c5fcbab`

- [x] Default `expgov init` — empty `stable` / `internal` / `advanced` buckets
- [x] Explicit empty bucket opts out of built-in prefix merge (`resolveBucket`)
- [x] `--rich` — commented `cache` + tier `exact`/`prefix` examples for opt-in
- [x] Default init omits `cache` block (runtime defaults)

---

## P14 — Commander-first help / A5 (shipped)

- [x] `expgov help` ≡ Commander `outputHelp` + **Workflows** appendix
- [x] `expgov help <cmd>` ≡ `expgov <cmd> -h` (same box + colorized options)
- [x] Usage errors → `printCliHelp(program, topic)` + `printHelpHint`
- [x] `registerCommandHelpExtras` — per-command Examples / Related (`addHelpText`)
- [x] `help` command skips per-command banner (box from `formatHelp` only)
- [x] Core `printHelp` retained for programmatic use only — CLI does not call it

---

## P15 — list truncation hints / A1b (shipped)

- [x] `formatListTruncationHint` — `…and N more (use -F/--full or -T/--top <n>)`
- [x] Report-layer only — graph `topModules` no pre-slice in command host
- [x] Timeline — full commit fetch; `hiddenCount` on display cap

---

## P16 — worktree files index / 2e (shipped) · `e74abeb`

- [x] `files.json` under `.expgov/cache/__worktree__/` — per-file content hashes
- [x] `inputFilesEpoch` on worktree snapshots — bound to tracked file set
- [x] Track barrels, scan closure (symbols/namespaces/edges), barrel re-export chains, `expgov.config.ts`, core `package.json`
- [x] `collectBarrelScanClosure` — deep re-export hops (`findNamedReexportSpecifier` walk)
- [x] Full rebuild on any hash diff — no incremental snapshot merge
- [x] Tests: hit/miss on barrel, direct module, and deep re-export edits; tmp fixtures under `<tmpdir>/expgov/`

---

## Dogfood / integration receipts

| Target | Status |
|--------|--------|
| **expgov repo** | Root `expgov.config.ts`; custom tiers (`beta`, `deprecated`); `expgov validate` passes |
| **Global CLI** | `pnpm build && pnpm link --global` → `expgov` on PATH |

---

## Explicitly not shipped (do not assume present)

- [ ] Phase **E** — rich command metadata (inline “next question” hints) — **inventory + validate shipped**; diff/trend/graph/timeline pending
- [ ] Automated tier allowlist PR bot
- [ ] JSON config / `expgov.config.json`
- [ ] Remote or shared cache
- [ ] `trend` columns for custom tier buckets (still stable/adv/int only)

See [`active-phase.md`](./active-phase.md) for current sprint focus.

---

## Quick “already exists” lookup

| If you need… | It shipped in… | Code / doc |
|--------------|----------------|------------|
| Barrel snapshot | P0a | `inventory/build.ts` |
| Cache warm/read | P0b | `cache/store/*` |
| tsconfig ↔ npm check | P0d | `commands/validate.ts` |
| `--json` envelope | P1 | `shared/result/cliJson.ts` |
| `-q` / `-s` gates | P1 | `runtime/policy.ts` |
| `expgov init` | P1a | `cli/commands/init/` |
| Nested `tiers.*` | P2 | `config/tiers.ts` |
| Custom tier + policy | P10 | `config/tierCatalog.ts`, `config/tierPolicy.ts` |
| Tier provenance labels | P9 | `inventory/tiers.ts` |
| JSDoc through re-exports | P11 | `inventory/reexport-chain.ts` |
| Custom tier rollups | P11 | `inventory/tierCounts.ts`, `logger/reports/tierRollup.ts` |
| Config types barrel | P11 | `types/config/index.ts` |
| `style` tokens (no chalk in reports) | P10 | `runtime/style.ts` |
| Footer summary line | P2a | `runtime/footer.ts` |
| `-T` / `-F` list limits | P6 | `shared/listing.ts`, `cli/utils/cli/listFlags.ts` |
| Commander-first help | P14 | `cli/utils/help/printCliHelp.ts` |
| `cache.enabled` / `disabled` status | P12 | `config/resolveCache.ts`, `cache/store/mode.ts` |
| Conservative init tiers | P13 | `init/detect.ts`, `init/template.ts` |
| Worktree `files.json` gate | P16 | `cache/store/worktreeTrack.ts`, `worktreeFiles.ts` |
| `expgov version` | P8 | `commands/version.ts` |
| Agent onboarding | P2 | `maintainer/agents/onboarding.md` |
