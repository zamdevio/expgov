# Shipped work

Closed slices only — check here before re-implementing. Durable engineering detail lives in [`systems/`](../systems/README.md).

**Commits on `main`:** `a78a6fe` → `651bf29` (2026-W26) · `d372532` → `e74abeb` (P7–P16) · `006b45a` → `0b7f5f0` (P17–P20) · `5492383` → `7698189` (P18–P19) · `b8ccbdb` (Phase I1/I3) · `495f6ec` → `31d8ded` (B1, P21–P23) · `3eeb5cf` → `53dd15c` (R1–R4, v1.0.0 / v1.0.1).

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
| 2026-W26 | **P14** — Commander-first help (A5) | `printCliHelp`; workflows appendix; per-command Examples/Related (`7a580d1`, `2845c79`) |
| 2026-W26 | **P15** — list truncation hints (A1b) | Report-layer `…and N more`; graph/timeline `hiddenCount` fixes (`4f943b3`, `55eab70`) |
| 2026-W26 | **P16** — worktree files index (2e) | `files.json` + `inputFilesEpoch` hash gate under `__worktree__/` (`e74abeb`) |
| 2026-W26 | **P17** — command insights (Phase E) | All governance commands + JSON `data.insights` (`006b45a`, `b60faad`, `0b7f5f0`) |
| 2026-W26 | **P18** — help path polish | Bare invoke help exit 0; Workflows on all `-h` / `--help` / `help` (`5492383`, `42ed91d`) |
| 2026-W26 | **P19** — CI job split | Parallel typecheck/test; `core:build` before CLI typecheck (`7698189`) |
| 2026-W26 | **P20** — timeline warm log | Report-layer `Snapshot warm` below meta; latest line default, all with `-v` (`5000073`) |
| 2026-W26 | **I1** — SDK example | `examples/sdk/` teaching fixture (`b8ccbdb`) |
| 2026-W26 | **I3** — example SDK CI | `expgov -C examples/sdk validate` in `ci.yml` (`b8ccbdb`) |
| 2026-W26 | **B1** — timeline ref ranges | Git ref grammar on `timeline`; `TimelineRange` time \| ref (`495f6ec`) |
| 2026-W26 | **B2** — release markers | Dim `── v1.0.0 ──` rows; JSON `rows[].tags` |
| 2026-W26 | **B3** — timeline step meta | `rows[].step` via `diffSnapshots`; `-v` shorthand |
| 2026-W27 | **B4** — timeline summary | `computeTimelineSummary`; human `Summary` block; JSON `data.summary` |
| 2026-W27 | **B5** — timeline series metrics | Symbol churn, tier/namespace drift, cache coverage in default Summary |
| 2026-W27 | **C2** — graph analytics | `computeGraphAnalytics`; Summary block; JSON `data.analytics` (`b7a120b`) |
| 2026-W27 | **C1** — graph namespace-first | Namespaces sorted by edge count; composition lines; meta `namespaces` |
| 2026-W26 | **P21** — listing policy (tiers) | Custom tier rollup rows + diff violations/deltas; suggest/doctor `-T/-F` (`c5a5342`) |
| 2026-W26 | **P22** — meta + range help | `formatMetaEndpoint`; Commander `Range formats:`; CLI `types/` (`ab8cb85`) |
| 2026-W26 | **P23** — tier policy engine | `tiers.policies` registry; composable `rootFlat` rules (`31d8ded`) |
| 2026-W28 | **R1–R4** — v1.0.0 stable release | Dual npm (`@expgov/cli` + `@expgov/core`), docs site, GitHub tag (`3eeb5cf`) — [`release.md`](./release.md) |
| 2026-W28 | **P24** — cache schema invalidation | Reject legacy snapshots missing tier `custom` rollups; auto-rebuild on read (`4c8ea8e`) |
| 2026-W28 | **P25** — diff custom-tier guard | Incomplete summary rollups safe in diff/insights (`8f4273c`) |
| 2026-W28 | **R4a** — v1.0.1 patch | Cache recovery docs + package bump (`8b83ff9`, `53dd15c`) — [`release.md`](./release.md) |
| 2026-W29 | **D1** — diff fail gate | `--fail-on-removed` / `--fail-on-tier-violations`; `evaluateDiffFailMode`; docs + tests |
| 2026-W29 | **D2 / AG4** — `validate --since` | Baseline vs worktree; removals ∪ validate; CI docs in workflows |
| 2026-W29 | **AG3** — diff JSON detail | `addedDetail` / `removedDetail` under `-v`/`-F` + listGuidance |
| 2026-W29 | **AG8** — JSON error envelopes | Domain, unexpected, and CLI parser errors emit `ok:false` envelopes under `-j` |
| 2026-W29 | **P7b** — layout hygiene | Types/constants out of logic modules; import-only; architecture + rules docs |
| 2026-W29 | **SF1** — stable surface split | Thin `@expgov/core` root; `./advanced` + `./internal` subpaths; tier reclass |
| 2026-W29 | **REL1–3** — release automation | `versions:*` + `release.yml` OIDC dual publish |
| 2026-W29 | **AG1** — inventory JSON detail | `symbols[]` / `namespaces[]` under `-v`/`-F` + `--json`; `format/inventoryJson.ts` |
| 2026-W29 | **AG2** — graph JSON edges | `edges[]` under `-v`/`-F` + `--json`; `format/graphJson.ts` + shared `listGuidance` |
| 2026-W29 | **AG5** — shared filters | Repeatable `--tier` / `--category` on inventory, diff detail, and graph; filter before list limits |

---

## Receipt groups

| Group | Slices | Doc |
|-------|--------|-----|
| Foundation | P0, P7 | [`foundation.md`](./foundation.md) |
| Inventory & cache | P0a, P0b, P4, P16, P24, AG1 | [`inventory-cache.md`](./inventory-cache.md) |
| Git & commands | P0c, P0d, P4a, P5, P8, B1–B5, C1–C2, P25, D1, D2, AG2, AG3, AG5 | [`git-commands.md`](./git-commands.md) · [`timeline.md`](./timeline.md) · [`graph.md`](./graph.md) |
| Tiers & config | P2 tiers, P9–P11, P13, P23 | [`tiers-config.md`](./tiers-config.md) |
| Runtime & CLI output | P1, P1a, P2a, P6, P14, P15, P17, P18, P20, P21, P22, AG8 | [`runtime-cli.md`](./runtime-cli.md) |
| Tooling & docs | P2 hub, P3, P3a, P12, P19, I1, I3, R1–R4, R4a | [`tooling-docs.md`](./tooling-docs.md) · [`examples-sdk.md`](./examples-sdk.md) · [`release.md`](./release.md) |

---

## Dogfood / integration

| Target | Status |
|--------|--------|
| **expgov repo** | Root `expgov.config.ts`; custom tiers (`beta`, `deprecated`); `expgov validate` passes |
| **Global CLI (local dogfood)** | `pnpm build`; `~/.local/share/pnpm/expgov` symlinks to `dist/cli.js` |
| **npm** | `@expgov/cli@1.0.1` + `@expgov/core@1.0.1` published |
| **Docs** | [expgov.pages.dev](https://expgov.pages.dev) |

---

## Explicitly not shipped

- [x] `validate --since` ([`phases/diff.md`](../phases/diff.md) D2 / Agentic AG4)
- [ ] `compatBaseline` config ([`phases/diff.md`](../phases/diff.md) D3)
- [x] Diff verbose JSON detail ([`phases/agentic.md`](../phases/agentic.md) AG3)
- [x] JSON envelopes for thrown/parser errors ([`phases/agentic.md`](../phases/agentic.md) AG8)
- [x] Filter flags `--tier` / `--category` ([`phases/agentic.md`](../phases/agentic.md) AG5)
- [ ] Automated tier allowlist PR bot
- [ ] JSON config / `expgov.config.json`
- [ ] Remote or shared cache
- [ ] `trend` columns for custom tier buckets (still stable/adv/int only)

Current sprint: [`phases/active-phase.md`](../phases/active-phase.md).

---

## Quick lookup

| If you need… | Shipped in… | Code / doc |
|--------------|-------------|------------|
| Barrel snapshot | P0a | `inventory/build.ts` |
| Cache warm/read | P0b | `cache/store/*` |
| Legacy snapshot reject / rebuild | P24 | `cache/store/validation.ts` · [`systems/cache.md`](../systems/cache.md) |
| tsconfig ↔ npm check | P0d | `commands/validate.ts` |
| `--json` envelope | P1 | `shared/result/cliJson.ts` |
| `-q` / `-s` gates | P1 | `runtime/policy.ts` |
| `expgov init` | P1a | `cli/commands/init/` |
| Nested `tiers.*` | P2 | `config/tiers.ts` |
| Custom tier + policy | P10, P23 | `config/tierCatalog.ts`, `config/tierPolicy.ts` |
| `tiers.policies` registry | P23 | `types/config/policies.ts`, `shared/constants/tierPolicies.ts` |
| Listing on custom tier rows | P21 | `logger/reports/tierRollup.ts`, `shared/listing.ts` |
| Commander range formats help | P22 | `cli/utils/help/commandHelp.ts`, `formatMetaEndpoint` |
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
| Command insights (`data.insights`) | P17 | `insights/`, `logger/reports/insights.ts` |
| Timeline warm log | P20 | `timeline/warmer.ts`, `logger/reports/timeline/` |
| Timeline 2.0 (B1–B5) | B1–B5 | [`timeline.md`](./timeline.md) |
| Graph 2.0 (C1–C2) | C1–C2 | [`graph.md`](./graph.md) · `graph/analytics.ts` |
| Timeline release markers | B2 | `git/versionTags.ts`, `logger/reports/timeline/markers.ts` |
| Timeline step metadata | B3 | `timeline/stepMeta.ts`, light snapshot symbols |
| `expgov version` | P8 | `commands/version.ts` |
| SDK example workspace | I1, I3 | [`examples-sdk.md`](./examples-sdk.md) · [`examples/sdk/`](../../examples/sdk/) |
| Dual npm + docs site | R1–R4, R4a | [`release.md`](./release.md) |
| Diff fail-on-removed / tier violations | D1 | `format/diffFail.ts`, `commands/diff.ts` |
| `validate --since` (removals ∪ validate) | D2 / AG4 | `format/validateSince.ts`, `commands/validate.ts` |
| Inventory JSON symbols / namespaces | AG1 | `format/inventoryJson.ts`, `commands/inventory.ts` |
| Graph JSON edges | AG2 | `format/graphJson.ts`, `commands/graph.ts` |
| Agent onboarding | P2 | `maintainer/agents/onboarding.md` |
