# Shipped work

Closed slices only — check here before re-implementing. Durable engineering detail lives in [`systems/`](../systems/README.md).

**Commits on `main`:** `a78a6fe` → `651bf29` (2026-W26) · `d372532` → `e74abeb` (P7–P16) · `006b45a` → `b60faad` (P17) · `5492383` → `7698189` (P18–P19).

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
| 2026-W26 | **P17** — command insights (E partial) | `inventory` / `validate` / `diff` / `trend` metadata + JSON `data.insights` (`006b45a`, `b60faad`) |
| 2026-W26 | **P18** — help path polish | Bare invoke help exit 0; Workflows on all `-h` / `--help` / `help` (`5492383`, `42ed91d`) |
| 2026-W26 | **P19** — CI job split | Parallel typecheck/test; `core:build` before CLI typecheck (`7698189`) |

---

## Receipt groups

| Group | Slices | Doc |
|-------|--------|-----|
| Foundation | P0, P7 | [`foundation.md`](./foundation.md) |
| Inventory & cache | P0a, P0b, P4, P16 | [`inventory-cache.md`](./inventory-cache.md) |
| Git & commands | P0c, P0d, P4a, P5, P8 | [`git-commands.md`](./git-commands.md) |
| Runtime & CLI output | P1, P1a, P2a, P6, P14, P15, P17, P18 | [`runtime-cli.md`](./runtime-cli.md) |
| Tiers & config | P2 tiers, P9–P11, P13 | [`tiers-config.md`](./tiers-config.md) |
| Tooling & docs | P2 hub, P3, P3a, P12, P19 | [`tooling-docs.md`](./tooling-docs.md) |

---

## Dogfood / integration

| Target | Status |
|--------|--------|
| **expgov repo** | Root `expgov.config.ts`; custom tiers (`beta`, `deprecated`); `expgov validate` passes |
| **Global CLI** | `pnpm build && pnpm link --global` → `expgov` on PATH |

---

## Explicitly not shipped

- [ ] Phase **E** — `graph` / `timeline` insights (inventory, validate, diff, trend shipped — P17)
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
| Command insights (`data.insights`) | P17 | `insights/`, `logger/reports/insights.ts` |
| `expgov version` | P8 | `commands/version.ts` |
| Agent onboarding | P2 | `maintainer/agents/onboarding.md` |
