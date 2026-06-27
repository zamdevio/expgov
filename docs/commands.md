# Commands

All governance commands are **read-only** except `init` (writes `expgov.config.ts`).

## Global flags

| Flag | Role |
|------|------|
| `-j, --json` | Machine-readable JSON envelope on stdout |
| `-q, --quiet` | Suppress info logs and tips; keep primary report |
| `-s, --silent` | Suppress human output except errors and `--json` |
| `-C, --cwd` | Project root |
| `--config` | Path to `expgov.config.ts` |
| `--no-color` | Plain output |
| `-y, --yes` | Non-interactive `init` |

Per-command: `-v/--verbose`, `-f/--force`, `--no-cache` where applicable.

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
```

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
```

Range formats: `@4w`, `@3m`, ISO dates. Shows flat count and Δ between consecutive barrel edits.

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
