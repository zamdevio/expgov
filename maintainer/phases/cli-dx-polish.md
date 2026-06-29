# Phase A — CLI DX Polish

**Status:** In progress — A1 listing + A2 aliases + A3 color shipped in code.

**Companion:** [`commands.md`](./commands.md) · [`../systems/cli.md`](../systems/cli.md) · [`shipped-slices.md`](./shipped-slices.md)

---

## Goals

1. Make every list-oriented command feel identical: default 10 rows, `--top <n>`, `--full`.
2. Standardize short aliases across global and per-command flags without breaking existing argv.
3. Simplify color to **on by default**, **off via `--no-color`** (and `NO_COLOR` env).
4. Replace vague provenance labels (`[fallback]`, bare cache statuses) with actionable source strings.
5. Upgrade help from reference text to workflow-oriented discoverability.

---

## Rationale

expgov already ships seven governance commands with shared runtime (policy, footer, JSON envelope). Output quality is uneven because each command evolved its own truncation rules:

| Command | Current list behavior |
|---------|----------------------|
| `inventory` | Top 4 categories only |
| `graph` | 12 target groups, 15 namespaces, 8 top modules (20 verbose) |
| `diff` | All added/removed (unbounded) |
| `validate` | 5 notes max (unbounded violations) |
| `trend` | All tags in window (bounded by `--tags`) |
| `timeline` | `--limit` commits (default 20), not aligned with other commands |

Users learn one mental model per command today. A single listing contract reduces cognitive load, makes `--json` ↔ human parity easier, and sets up Phases E/F (rich metadata, output audit) without re-truncating ad hoc.

Global aliases and color simplification are low-risk, high-frequency DX wins. Provenance polish directly supports the shift from “export governance” to “SDK observability” — developers must trust *where* a tier or module came from.

---

## Architecture considerations

- **Core purity:** Listing limits and provenance formatting belong in `packages/core` (`logger/`, shared `list/` helpers). CLI only wires new flags into `RunOptions` or per-command options structs.
- **JSON contract:** `--top` / `--full` affect human output only unless we also add `data.truncated` + `data.total` to envelopes — recommended for machine consumers.
- **Backwards compatibility:** Keep long flags as canonical; add short aliases. Deprecate `--color` (positive) silently — Commander already defaults it `true`.
- **Shared helper:** Introduce `packages/core/src/shared/listing.ts` (name TBD) with:

  ```txt
  resolveListLimit({ top?, full?, default: 10 }) → number | Infinity
  formatProvenance(tierSource, sym) → string
  ```

  All `print*Report` functions call this instead of inline `.slice(0, N)`.

- **`RunOptions` extension:** `noLogPrefix` / `noLogChannel` already exist but are **not wired in CLI** — Phase A should expose them (see alias table).

---

## Implementation strategy

### A1 — Listing consistency

**Motivation:** One truncation contract across commands.

**User value:** `expgov graph --top 5` and `expgov inventory --top 5` behave the same; `--full` removes caps everywhere.

**Approach:**

1. Add global-style flags to every command that renders lists (not `init`, `help`, `validate` violation lists — those stay complete for CI).
2. Default `top = 10` when neither `--top` nor `--full` is set.
3. `--full` implies unlimited human rows; footer still summarizes totals.
4. Commands to adopt:

   | Command | Lists to cap | Notes |
   |---------|--------------|-------|
   | `inventory` | top categories, subpath rollups (verbose) | Primary tier block stays full (small) |
   | `diff` | added, removed | Tier violations always full (governance) |
   | `graph` | target groups, namespaces, top modules | |
   | `trend` | tag rows | `--tags` remains fetch window; display uses `--top` |
   | `timeline` | commit rows | Replace `--limit` semantics or alias `--limit` → `--top` with deprecation note |
   | `validate` | notes only (verbose) | Violations never truncated |

5. Emit dim footer hint when truncated: `… 42 more (expgov diff --full)`.

**Dependencies:** None beyond logger refactors.

**Complexity:** Medium — touches 5 command hosts + 6 formatters.

**Risks:** `timeline --limit` rename may surprise users; keep `--limit` as hidden alias for one release cycle.

**Future extensions:** `--top` on JSON with `truncated: true`; pipe-friendly `--no-color --top 20` for scripts.

---

### A2 — Global aliases

**Motivation:** Faster interactive use; align with common CLI conventions.

**User value:** Muscle memory transfers across commands.

**Approach:** Audit and add short forms in `packages/cli/src/main.ts`. Proposed map:

| Long | Short | Scope | Notes |
|------|-------|-------|-------|
| `--config` | `-c` | global | `-C` already is `--cwd` — no conflict |
| `--package-name` | `-pn` | global | |
| `--cache-dir` | `-cd` | global | |
| `--no-cache` | `-nch` | per-command cache | Long `--no-cache` stays primary in help |
| `--no-color` | `-ncl` | global | |
| `--no-log-prefix` | `-nlg` | global | Wire `RunOptions.noLogPrefix` |
| `--no-log-channel` | `-nlc` | global | Wire `RunOptions.noLogChannel` |
| `--top` | `-l` | per-command lists | Conflicts with nothing today |
| `--verbose` | `-v` | per-command | Already shipped |
| `--force` | `-f` | cache | Already shipped |
| `--json` | `-j` | global | Already shipped |
| `--quiet` | `-q` | global | Already shipped |
| `--silent` | `-s` | global | Already shipped |
| `--yes` | `-y` | global/init | Already shipped |

**Review additions:**

- `-t` for `--top` — conflicts with potential future `--since`; prefer `-l` for limit/top.
- `--tags` on `trend` → consider `-n` (count) alias; defer if ambiguous.

**Dependencies:** Commander alias registration; update `help/index.ts` and `configureCliHelp` default highlighting.

**Complexity:** Low.

**Risks:** Short aliases are a **user-facing contract** pre-v1 — document in `commands.md` before shipping.

**Future extensions:** `EXPGOV_DEFAULT_TOP=10` env override for CI logs.

---

### A3 — Color handling

**Motivation:** Industry norm is color on, opt-out via `--no-color` / `NO_COLOR`.

**User value:** Less flag noise; help matches behavior.

**Current state:** `main.ts` registers `.option('--color', 'force color output', true)` and `resolveNoColor(!opts.color)`. Help documents only `--no-color`.

**Approach:**

1. Remove positive `--color` from Commander registration.
2. Default: color enabled when stdout is TTY and `NO_COLOR` unset (existing `resolveNoColor` logic).
3. Keep `--no-color` / `-ncl` and `NO_COLOR` env.
4. Document in `systems/cli.md`: *Color is enabled for TTY output. Disable with `--no-color` or the `NO_COLOR` environment variable. JSON mode never applies ANSI.*

**Dependencies:** None.

**Complexity:** Low.

**Risks:** Scripts piping to files may get ANSI if they forget `--no-color`; mitigated by TTY check in `configureStyle`.

**Future extensions:** `CLICOLOR=0` support (optional, same as many tools).

---

### A4 — Output provenance polish — **shipped** (P9 + P10 + P11)

See [`shipped-slices.md`](./shipped-slices.md) P9–P11. `tierProvenance`, custom tier rollups, JSDoc re-export chain, `tiers.tag.precedence`.

---

### A5 — Help: Commander-first (`-h` styling) — **shipped** (P14)

See [`shipped-slices.md`](./shipped-slices.md) P14.

---

### A1b — List truncation hints (completeness) — **shipped** (P15)

See [`shipped-slices.md`](./shipped-slices.md) P15.

---

### A5 (legacy notes) — workflow content

**Motivation:** `expgov help` is accurate but passive; users need workflows.

**User value:** Faster onboarding; discover related commands.

**Workflow appendix** (on `expgov help` only):

```txt
Workflows
  New export surface     init → inventory → validate
  Release review         trend → diff v1..v2 → validate
  API archaeology        timeline @3m → diff <sha>..HEAD
  Dependency map         graph → inventory -v
```

**Follow-up:** per-command `addHelpText` for Examples, Related, Next steps; error hints from `ExportError.details.command`.

**Dependencies:** Commander-first help (above).

**Complexity:** Low–medium.

**Risks:** Help length; keep per-command `-h` focused, workflows only on root help.

**Future extensions:** `expgov help workflows` topic; shell completion (deferred).

---

## Dependencies (phase-level)

| Upstream | Blocks |
|----------|--------|
| Current governance sprint (tiers, CI validate) | Should complete first to avoid merge churn |
| Phase F (output audit) | Informs exact truncation copy and spacing |
| Phase E (rich metadata) | Footer/summary lines may reference new stats |

Phase A is otherwise **self-contained** and should land before B/C (those phases reuse `--top` / `--full`).

---

## Risks

| Risk | Mitigation |
|------|------------|
| Alias proliferation | Document canonical long form in JSON/help; short forms secondary |
| `--limit` vs `--top` on timeline | Deprecation shim + help redirect |
| Wider verbose output | Default view stays 10 rows; provenance compact |
| Breaking JSON consumers | Add fields additively; never remove envelope keys |

---

## Future extensions

- Shell completions from Commander metadata.
- `expgov --help=inventory` parity with dedicated help topic.
- Configurable default top via `expgov.config.ts` `cli.defaultTop` (advanced tier).

---

## Recommended execution order

1. **A3** Color simplification (smallest diff, immediate doc win).
2. **A2** Wire aliases + `noLogPrefix` / `noLogChannel`.
3. **A1** Shared listing helper + per-command adoption (`graph` → `diff` → `inventory` → `trend` → `timeline`).
4. **A4** Tier provenance in inventory build + logger.
5. **A5** Help workflows and related-command map.

Estimated total: **2–3 focused PRs** (A3+A2, A1, A4+A5).
