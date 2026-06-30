# Runtime & CLI output

Logging policy, human reports, listing contract, help, and insights.

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

Engineering map: [`systems/cli.md`](../systems/cli.md).

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

## P14 — Commander-first help / A5 (shipped) · `7a580d1`, `2845c79`

- [x] `expgov help` ≡ Commander `outputHelp` + **Workflows** appendix
- [x] `expgov help <cmd>` ≡ `expgov <cmd> -h` (same box + colorized options)
- [x] Usage errors → `printCliHelp(program, topic)` + `printHelpHint`
- [x] `registerCommandHelpExtras` — per-command Examples / Related (`addHelpText`)
- [x] `help` command skips per-command banner (box from `formatHelp` only)
- [x] Core `printHelp` retained for programmatic use only — CLI does not call it

---

## P15 — list truncation hints / A1b (shipped) · `4f943b3`, `55eab70`

- [x] `formatListTruncationHint` — `…and N more (use -F/--full or -T/--top <n>)`
- [x] Report-layer only — graph `topModules` no pre-slice in command host
- [x] Timeline — full commit fetch; `hiddenCount` on display cap

---

## P17 — command insights / Phase E (shipped) · `006b45a`, `b60faad`

- [x] `packages/core/src/insights/` — pure aggregations over snapshots (all governance commands)
- [x] `logger/reports/insights.ts` — dim `◇` block before footer; max 5 lines; `--quiet` ok, `--silent` off
- [x] JSON: additive `data.insights` on inventory, validate, diff, trend, graph, timeline
- [x] `inventory` — largest module (edges), median exports/module, unclassified warnings
- [x] `validate` — hot spot / worst subpath on failure; internal/advanced counts on `-v`
- [x] `diff` — module edge delta, tier movement, new advanced, truncated add/remove samples
- [x] `trend` — largest tag-pair jump/drop, stable % shift
- [x] `graph` — densest module, target fan-out, category mix
- [x] `timeline` — flat churn, net window delta, largest step, busiest week
- [x] Tests: `shared/__tests__/insights.test.ts`

---

## P18 — help path polish (shipped) · `5492383`, `42ed91d`

- [x] Bare `expgov` (no subcommand) prints root help and exits **0**
- [x] Root **Workflows** appendix on `expgov -h`, `--help`, and `expgov help` (shared `workflowAppendix.ts`)
- [x] `expgov help <cmd>` ≡ `expgov <cmd> -h` (unchanged; paths now consistent at root)

Engineering map: [`systems/cli.md`](../systems/cli.md#help-shipped-p14).

---

## P20 — timeline warm log layout (shipped)

- [x] `TimelineWarmer` collects per-commit timings (`timeline/warmer.ts`) — no `console.*` in verbose mode
- [x] Non-verbose: stderr `\r` spinner only during warm; cleared before report
- [x] `printTimelineWarmSection` — warm log **below** meta (`logger/reports/timeline/warm.ts`); `warmed` row matches meta indent (`       key      value`)
- [x] `-v` / `--verbose` — `Snapshot warm` section with per-commit `· N/M  sha  hit  Nms` lines + summary row
- [x] JSON: `data.warmStats` includes `entries[]` for machine consumers
- [x] Removed duplicate `warm` meta row (summary lives in warm section)
