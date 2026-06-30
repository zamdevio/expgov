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

**List flags** (inventory, diff, graph, trend, timeline): `-T, --top <n>` (default 10, min 1), `-F, --full` (no truncation).

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
expgov diff v0.1.3..v0.1.4
expgov diff a6caa74..HEAD
```

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

Git log of commits that edited the root barrel. Default range: `@4w`.

```bash
expgov timeline
expgov timeline @3m
expgov timeline 2025-01-01..2025-06-01
expgov timeline v1.0.0..HEAD
expgov timeline v1.0.0
```

Range formats: `@4w`, `@3m`, ISO dates, and git refs (`v1.0.0..HEAD`, single ref → `ref..HEAD`). Shows flat count and Δ between consecutive barrel edits.

Human output order: meta (`range`, `from`, `to`, …) → **warm** section (`Snapshot warm`: latest line by default, all lines with `-v`; then `warmed` summary) → commit table → insights.

JSON: `data.warmStats` includes `{ warmed, totalMs, entries[] }`.

---

## `graph [ref]`

Re-export governance map — target subpath groups, root namespaces, top source modules.

```bash
expgov graph
expgov graph HEAD -v
```

---

## `help [topic]`

Long-form usage. Topics: `init`, `inventory`, `diff`, `validate`, `trend`, `timeline`, `graph`, `help`, or omit for all.

```bash
expgov help validate
```

---

## Output order (human mode)

```txt
banner → report / meta → tips → footer (summary + command · ok|fail · Nms)
```

Footer and banners are suppressed under `--json` and `--silent`. See [json.md](./json.md).
