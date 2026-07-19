# Phase — Agentic JSON & flexible flags

**Status:** Active — **AG1–AG2 shipped**; D2/AG4 (`validate --since`) next. D1 completed the fail-mode half of AG3. **AG3/AG4** share Diff D1/D2 work (do not duplicate).

**Companion:** [`diff.md`](./diff.md) · [`severity.md`](./severity.md) · [`cli-output-audit.md`](./cli-output-audit.md) · [`docs/cli/json.md`](../../docs/cli/json.md) · [`docs/guides/workflows.md`](../../docs/guides/workflows.md)

---

## Mission

Make expgov **agent-native** without abandoning human UX:

1. **`--json` carries 100% of useful data we already compute** (no secret second channel in `.expgov/cache`).
2. **Flags make commands flexible** for CI, agents, and interactive review (`--since`, fail modes, full listings, filters).
3. **Exit codes and `issues[]` mean the same thing** to a shell script and to an LLM tool loop.

Dogfood target: nodehunter (and any SDK that freezes a 1.x surface) can automate release review and PR gates without scraping banners.

---

## Evidence (brutal dogfood on nodehunter)

| Gap | Today | Agent impact |
|-----|-------|--------------|
| `inventory -v/-F -j` | Summary only; symbol table was human `-v` only | **Shipped AG1** — `data.symbols` / `data.namespaces` |
| `graph -v/-F -j` | Analytics rollup only; edges not in JSON | **Shipped AG2** — `data.edges` + `listGuidance` |
| Default `-T 10` | Truncation in human lists | Fine for TTY; wrong default for agents if they scrape text |
| `diff` detail | Fail gate shipped; verbose JSON lacks added/removed metadata | Agents can gate removals, but cannot inspect rich symbol changes |
| `validate --since` | Reserved, unimplemented | One-command “PR shippable?” missing |
| Insights shape | `{ lines }` vs richer objects, per command | Fragile agent parsers |
| Full data | Lives in `inventory.full.json` cache | Unofficial; agents shouldn’t dig cache |

Cache already has `symbols[]` + `edges[]` in `inventory.full.json`. **JSON mode should expose that same truth**, not a thin summary.

---

## Principles

1. **List policy is shared** — `-T` / `-F` truncate or uncap JSON arrays the same as human lists; include `top` + `*Hidden` (or equivalent) so agents know truncation. Prefer `-F -j -s` when agents need the full surface.
2. **`-v` affects JSON too** — verbose = more fields / list sections in `data`, not only more stderr.
3. **Fail modes are opt-in** — default interactive commands stay quiet/exit 0 unless flags request enforcement.
4. **Stable issue codes** — every fail path emits `issues[].code` agents can switch on.
5. **No breaking envelope** — keep `{ ok, kind, data, issues, meta }`; grow `data` additively; bump `meta.apiVersion` only if shape breaks.
6. **Human banners stay** — agents use `-j -s`; humans keep the current report UX.

---

## A — JSON completeness (ship the data we already have)

### A1 — `inventory -j`

Always or under `-v` / `-F`, include (same `-T`/`-F` list policy as human verbose):

```ts
data: {
  ref, sha, summary, cache, insights,
  top,                    // resolveListLimit; Infinity → null in JSON
  symbols: Array<{…}>,  // truncated unless -F
  namespaces: Array<{…}>,
  symbolsHidden, namespacesHidden,
}
```

Source: same structures already printed by `printVerboseInventory` / stored in cache snapshots.

### A2 — `graph -j`

Under `-v` or `-F`, include (same `-T`/`-F` list policy + `listGuidance`):

```ts
data: {
  ref, edgeCount, targetGroups, analytics, insights,
  top, edges, edgesHidden, listGuidance,
}
```

### A3 — `diff -j`

Already has `added` / `removed` name arrays — good. Add:

- `removedDetail` / `addedDetail` (tier, category, targetSubpath) when `-v` (today verbose detail is human-only)
- `tierViolations` in `data` (and `issues[]` when fail flags set — [`diff.md`](./diff.md))

### A4 — `timeline` / `trend` -j

Already row-rich. Normalize:

- `insights` always `{ lines: InsightLine[], …typedFields }`
- Document Δ sign convention (newest-first vs oldest-first) so agents don’t mistrust `summary`

### A5 — Docs contract

Update `docs/cli/json.md` with per-`kind` full schemas and a rule:

> With `--json`, `-v` and `-F` expand `data` rather than only human stdout.

---

## B — Flags that unlock real workflows

### B1 — Enforce / baseline (depends on [`diff.md`](./diff.md))

| Flag | Command | Role |
|------|---------|------|
| `--fail-on-removed` | `diff` | Exit 1 if any flat removed |
| `--fail-on-tier-violations` | `diff` | Exit 1 if right snapshot has tier violations |
| `--since <ref>` | `validate` | **Implement** reserved flag — baseline → tree; fail on removals + existing validate rules |
| `--compat-baseline` / config `git.compatBaseline` | validate/diff | Default baseline when flag omitted |

```bash
# Agent / CI — one shot
expgov validate --since v1.0.0 -j -s

# Explicit surface check
expgov diff v1.0.0..HEAD --fail-on-removed -j -s
```

### B2 — Listing control (all list-heavy commands)

| Flag | Behavior |
|------|----------|
| `-T, --top <n>` | Cap human rows (keep) |
| `-F, --full` | No human truncation **and** full arrays in JSON |
| `--names-only` | JSON/human: only export names (compact agent listing) |
| `--tier <stable\|advanced\|internal\|…>` | Filter inventory/diff/graph symbols (repeatable) |
| `--category <run\|type\|…>` | Filter by category |

Align with paused Graph C3 filters (`--namespace`, `--module`, `--subpath`) — one filter vocabulary across `inventory`, `graph`, `diff` detail.

### B3 — Output / agent ergonomics

| Flag | Behavior |
|------|----------|
| `-j / --json` | Envelope (exists) |
| `-s / --silent` | No human chrome (exists) |
| `-q / --quiet` | Exists — document agent recipe: prefer `-j -s` |
| `--no-insights` | Omit insights block (smaller payloads) |
| `--include-cache-meta` | Emit cache hit/miss + path (debug for agents) |

### B4 — `suggest` clarity

| Today | Target |
|-------|--------|
| Exit `1` when suggestions exist | Keep, but document as “work remaining,” not crash |
| JSON `ok: true` with `hasSuggestions: true` possible? | Prefer `ok: false` when exit 1 **or** keep ok true and document; pick one and freeze |
| Empty suggest | Exit 0, clear `data.hasSuggestions: false` |

Add `--apply-dry-run` only if it stays read-only (real apply stays in [`fix.md`](./fix.md)).

### B5 — `doctor` filters

| Flag | Behavior |
|------|----------|
| `--fail-on-warning` | Exit 1 if any warning (strict CI) |
| `-v` | Include cache file counts / path details in JSON `data` |

---

## C — Shared comparison core

Avoid duplicating snapshot logic:

```txt
compareSnapshots(left, right)
  → { added, removed, tierViolations, detail? }

diff CLI     → print + optional fail flags
validate --since → compare(baseline, worktree) ∪ current validate findings
```

One engine; two UX entry points (matches [`diff.md`](./diff.md) D1→D2).

---

## Delivery slices

| ID | Slice | Depends | Outcome |
|----|-------|---------|---------|
| **AG1** | JSON inventory symbols/namespaces (`-v`/`-F`) | — | **Shipped** — agents can list all exports |
| **AG2** | JSON graph edges (`-v`/`-F`) | — | **Shipped** — agents can map re-exports |
| **AG3** | Diff detail + fail flags | [`diff.md`](./diff.md) D1 | **Partial** — fail flags shipped in D1; `-v` detail JSON still open |
| **AG4** | `validate --since` | AG3 compare core | One-command PR gate |
| **AG5** | Filter flags (`--tier`, `--category`, …) | AG1–2 | Flexible queries |
| **AG6** | Insights schema normalization | — | Stable agent parsing |
| **AG7** | Docs + workflow recipes (`-j -s`, CI) | AG1–4 | Public contract |

Suggested remaining order: **AG3 detail → AG4 → AG5 → AG6 → AG7**.

---

## Acceptance criteria

- [x] `expgov inventory -v -j -s` includes symbol/namespace lists under the same `-T`/`-F` policy as human verbose (use `-F` for every flat)
- [x] `expgov graph -F -j -s` includes edge list matching `edgeCount` under shared listGuidance
- [x] `expgov diff A..B --fail-on-removed` exits 1 iff removals exist; default diff still exits 0
- [ ] `expgov validate --since <ref>` exits 1 on removals or existing validate failures
- [ ] Filter flags compose with JSON without requiring human output parsing
- [x] `docs/cli/json.md` documents inventory + graph detail shapes (diff detail still growing)
- [ ] No regression: human mode banners/truncation remain usable; envelope `apiVersion` unchanged unless breaking

---

## Non-goals

- Making expgov write barrels (`fix` stays separate phase)
- Replacing package managers or TypeScript program emit
- Forcing JSON-only UX
- Auto-failing on export **additions**
- Guaranteeing OpenTelemetry / MCP server in this phase (optional later note only)

---

## Agent recipe (target end state)

```bash
# Health
expgov doctor -j -s --fail-on-warning

# Current surface (full)
expgov inventory -v -j -s > inventory.json

# PR / release gate
expgov validate --since v1.0.0 -j -s > validate.json
test "$(jq -r .ok validate.json)" = "true"

# Explicit archaeology
expgov diff v1.0.0..HEAD -v -j -s
expgov timeline @4w -j -s
expgov trend -j -s
```

---

## Relation to other phases

| Phase | Overlap |
|-------|---------|
| [`diff.md`](./diff.md) | Fail-on-removed / validate `--since` ownership |
| [`severity.md`](./severity.md) | Graded `issues[]`; agentic fail paths should emit codes severity can later grade |
| [`cli-output-audit.md`](./cli-output-audit.md) | Human truncation / banner consistency; agentic owns JSON completeness |
| Graph C3 ([`graph-2.md`](./graph-2.md)) | Shared filter flag vocabulary |

---

## After AG3/AG4 — nodehunter

Same follow-up as [`diff.md`](./diff.md): bump expgov in `~/Tools/nodehunter`, add CI gate on `v1.0.0`, document in maintainer exports map. Prefer `validate --since v1.0.0` once AG4 lands.
