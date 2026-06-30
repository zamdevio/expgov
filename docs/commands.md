# Commands

All governance commands are **read-only** except `init` (writes `expgov.config.ts`).

## Global flags

| Flag | Role |
|------|------|
| `-j, --json` | Machine-readable JSON envelope on stdout |
| `-q, --quiet` | Suppress info logs and tips; keep primary report |
| `-s, --silent` | Suppress human output except errors and `--json` |
| `-C, --cwd` | Project root |
| `-c, --config` | Path to `expgov.config.ts` |
| `-pn, --package-name` | Override package name |
| `-cd, --cache-dir` | Override cache directory |
| `-ncl, --no-color` | Plain output (`NO_COLOR` env, non-TTY also disable color) |
| `-nlg, --no-log-prefix` | Omit `[expgov]` log prefix |
| `-nlc, --no-log-channel` | Omit info/warn/tip channel tags |
| `-y, --yes` | Non-interactive `init` |

**List flags** (inventory, diff, graph, trend, timeline, validate, suggest, doctor): `-T, --top <n>` (default 10, min 1), `-F, --full` (no truncation).

Per-command: `-v/--verbose`, `-f/--force`, `-nch/--no-cache` where applicable.

### Cache (working tree)

Snapshots for uncommitted state live under `.expgov/cache/__worktree__/`. expgov tracks barrels, re-export chains, config, and scanned modules in `files.json` and rebuilds automatically when any tracked file changes.

- **Default** — correct freshness without flags; `cache: hit` in JSON when reused.
- **`-f/--force`** — rebuild this run (still writes unless `--no-cache`).
- **`-nch/--no-cache`** — bypass read and write (debug/CI), not a day-to-day stale-cache fix.

Commit/SHA refs use immutable per-SHA cache dirs — no `files.json` needed.

### Insights (Phase E)

Several commands append an **Insights** block before the footer — answers to the likely next question (largest module, diff module deltas, trend jumps, validate hot spots, etc.). Shown in human output (including `--quiet`); available as `data.insights` in `--json`. Suppressed under `--silent`.

Commands with insights today: `inventory`, `validate` (failure or `-v`), `diff`, `trend`, `graph`, `timeline`.

---

## `init`

Scaffold `expgov.config.ts`.

```bash
expgov init
expgov init -y -r    # non-interactive with commented tier examples
```

---

## `inventory [ref]`

Summarize root barrel exports — flat count, namespaces, tier and category breakdown.

```bash
expgov inventory          # working tree (includes uncommitted edits)
expgov inventory HEAD
expgov inventory v0.1.4
```

`-v` prints a symbol table (tier, category, target subpath).

---

## `diff [range]`

Compare export surfaces between refs. Default: `HEAD` → working tree.

```bash
expgov diff
expgov diff HEAD
expgov diff v0.1.3..v0.1.4
expgov diff HEAD~30..HEAD~1
expgov diff a6caa74..HEAD
```

### Git ref ranges (shared with `timeline` for `A..B`)

| Form | Meaning |
|------|---------|
| `older..newer` | Snapshot at `older` vs snapshot at `newer` — **order matters** |
| `HEAD~N..HEAD~M` | Compare two parent anchors (e.g. net export change across that slice) |
| `v0.1.3..v0.1.4` | Tag-to-tag comparison |

**Diff-only forms** (timeline does not use these):

| Form | Meaning |
|------|---------|
| `(omit)` or default | `HEAD` → **working tree** |
| single ref `v0.1.4` | `v0.1.4` → **working tree** (not `..HEAD`) |

**Timeline-only ranges** (diff does not support): `@4w`, `@3m`, ISO week, inclusive date ranges — those filter *when* barrel commits happened; diff compares two surfaces at two points.

Reports added/removed flat exports and tier violations (internal/advanced promoted to root).

---

## `validate`

Governance checks on the working tree. **Exits 0 on pass, 1 on fail.**

```bash
expgov validate
expgov validate -v
expgov validate -T 5    # cap violation/note lists (default 10)
expgov validate -F        # show all list rows
```

List flags (`-T`/`--top`, `-F`/`--full`) apply to violations, notes, and verbose symbol lists.

Checks include:

- tsconfig path ↔ `package.json` exports parity
- Unclassified root flat exports
- Internal/advanced symbols still flat on the root barrel

---

## `doctor`

Read-only setup checks — config paths, cache gitignore, tsconfig/npm drift hints. **Exits 0 when healthy, 1 when warnings remain.**

```bash
expgov doctor
expgov doctor -v
```

Use `validate` for full tier enforcement; `doctor` is for environment hygiene before you run governance commands.

---

## `suggest`

Dry-run tier allowlist helper — lists unclassified flat exports and prints names to add to `tiers.stable.exact`. **Does not edit config.** Exits `1` when suggestions exist.

```bash
expgov suggest
expgov suggest -v
```

Workflow: `suggest` → copy into `expgov.config.ts` → `validate`.

---

## `trend`

Export counts across release tags (`v*` by default).

```bash
expgov trend
expgov trend --tags=6
```

Prints flat / stable / advanced / internal per tag; footer compares first vs last tag in the window.

---

## `timeline [range]`

Git log of commits that **edited the root barrel** (`packages/core/src/index.ts` in dogfood). Default range: `@4w`.

```bash
expgov timeline
expgov timeline @3m
expgov timeline 2025-01-01..2025-06-01
expgov timeline v1.0.0..HEAD
expgov timeline v1.0.0
expgov timeline HEAD~20
expgov timeline HEAD~30..HEAD~1
```

### What appears in the table

Only commits that **touched the root barrel file** in the chosen window. Other commits in the same time span or ref range are ignored — the table is barrel archaeology, not full repo history.

### Time ranges

`@4w`, `@3m`, ISO week (`2026-W24`), and inclusive date ranges (`2026-06-01..2026-06-14`) filter by commit date (UTC).

### Git ref ranges (same `A..B` grammar as `diff`)

| Form | Meaning |
|------|---------|
| `older..newer` | Commits **after** `older` on the path toward `newer` that edited the barrel |
| `HEAD~N` | Shorthand for `HEAD~N..HEAD` |
| `HEAD~N..HEAD` | Barrel edits from the commit **N parents back** from `HEAD` up to tip |

**Timeline-only ranges** (diff does not support): `@4w`, `@3m`, ISO week (`2026-W24`), inclusive date ranges — time filters on commit dates.

**Diff-only forms** (timeline does not use): default / single ref → **working tree** instead of `..HEAD`.

**`HEAD~N` is not “the last N commits”.** It resolves to one specific commit (walk N parent links from `HEAD`). Timeline then lists barrel edits between your anchors.

**Order matters:** use **older..newer** (e.g. `b5c70bf..HEAD`, `HEAD~30..HEAD~1`). `HEAD~20..b5c70bf` is empty when both sides resolve to the same commit. Reversed ranges (`newer..older`) are usually empty.

**Examples (dogfood repo):**

- `expgov timeline HEAD~20` — same as `HEAD~20..HEAD`; only barrel commits after that anchor
- `expgov timeline HEAD~30..HEAD~1` — barrel history between two parent anchors, excluding the latest commit
- A commit like `92e7f77` appears because it modified `packages/core/src/index.ts`, even when most files in that commit were docs or CLI

Shows flat count and Δ between **consecutive barrel edits** (newest first). When a commit is tagged with a version (`git.tagPattern`, default `v*`), a dim release marker row appears below it (`── v1.1.0 ──`). Use `-v` to show every tag when multiple tags point at the same commit.

Human output order: meta (`range`, `from`, `to`, …) → **warm** section (`Snapshot warm`: latest line by default, all lines with `-v`; then `warmed` summary) → commit table → insights.

JSON: `data.rows[].tags` lists version tags on each commit. `data.rows[].step` has per-step `added`, `removed`, `namespaceDelta`, `subpathDelta`, `tierDelta` (pairwise vs row above). Use `-v` for inline shorthand (`+2 −1 st +1`). `data.warmStats` includes `{ warmed, totalMs, entries[] }`. Ref ranges include `range.kind: "ref"` with `left` / `right` refs.

---

## `graph [ref]`

Re-export governance map — target subpath groups, root namespaces, top source modules.

```bash
expgov graph
expgov graph HEAD -v
```

---

## `help [topic]`

Commander-based usage — `expgov help <cmd>` is the same as `expgov <cmd> -h`.

```bash
expgov help
expgov help timeline
expgov timeline -h
```

Per-command help includes **Examples**, **Range formats** (on `diff` and `timeline`), and **Related** commands. Range format lines match the grammar used at runtime and in invalid-range error suggestions.

Bare `expgov` (no subcommand) prints root help and exits 0.

---

## Output order (human mode)

```txt
banner → meta (ref / from·to / range) → report body → insights → tips → footer
```

Commands with a **meta** block: `inventory`, `diff`, `timeline`, `trend`, `graph`, `validate`, `suggest`, `doctor`. Ref endpoints use `label (shortsha)` — e.g. `HEAD~30 (902bd6c)`, `working tree (HEAD abc1234)`.

Footer and banners are suppressed under `--json` and `--silent`. See [json.md](./json.md).
