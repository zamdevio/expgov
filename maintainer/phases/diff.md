# Phase — Diff fail gate (export surface regressions)

**Status:** Active — **D1–D2 shipped**; optional D3 `compatBaseline`. Triggered by [nodehunter](https://github.com/zamdevio/nodehunter) `v1.0.0` frozen surface.

**Companion:** [`agentic.md`](./agentic.md) · [`commands.md`](./commands.md) · [`severity.md`](./severity.md) · [`docs/commands/diff.md`](../../docs/commands/diff.md)

---

## Mission

Make `expgov diff` (and/or `validate --since`) usable as a **CI fail gate** when a published SDK freezes its flat export surface. Removals relative to a baseline tag must exit non-zero; default interactive `diff` stays informational.

---

## Problem

Consumers that treat the root barrel as a **frozen stable contract** (e.g. `@nodehunter/core` after `v1.0.0`) need CI to fail when exports are **removed** relative to a baseline tag. D1 provides the direct `diff` gate; D2 composes that comparison into `validate --since`.

| Command | What it does | Exit on removals? |
|---------|--------------|-------------------|
| `expgov validate` | Tier / tsconfig ↔ npm parity / unclassified | **No** — current-tree only |
| `expgov diff A..B` | Reports `added` / `removed` / tier notes | **Opt-in** — `--fail-on-removed` exits `1`; default remains informational |
| `validate --since <ref>` | Current validate ∪ removals vs baseline | **Yes** — removals or validate failures → exit `1` |

Bare `expgov diff v1.0.0..HEAD` intentionally stays green for compatibility. Prefer `validate --since` for one-command CI.

---

## Why this matters for SDK 1.x

Pre-1.0, removing exports was fine. Post-1.0:

- `validate` still catches **unclassified** new exports (good).
- Nothing catches **accidental deletion / rename** of an already-classified export (bad for semver minors/patches).

`trend` / `timeline` are archaeology — not CI fail gates.

---

## Delivery options

### D1 — `diff` fail flags (smallest; ship first)

```bash
expgov diff v1.0.0..HEAD --fail-on-removed
expgov diff v1.0.0..HEAD --fail-on-removed --fail-on-tier-violations
```

| Flag | Behavior |
|------|----------|
| `--fail-on-removed` | Exit `1` when `removed.length > 0` |
| `--fail-on-tier-violations` | Exit `1` when right-side `tierViolations.length > 0` |
| (neither) | Unchanged — always exit `0`, report added/removed |

JSON when failing:

- `ok: false`
- `issues[]` with stable codes, e.g. `expgov.diff.exports_removed`, `expgov.diff.tier_violation`
- Keep `data.added` / `data.removed` for agents

### D2 — implement `validate --since <ref>` (CI-friendly)

```bash
expgov validate --since v1.0.0
```

- Compare baseline snapshot → working tree (or HEAD).
- Fail on removals **and** keep existing validate failures (unclassified, parity, policy).
- Uses the already-reserved CLI flag — agents prefer one command for “is this PR shippable?”

Recommended combo: **D1 then D2** (shared comparison core; validate composes it).

**Public docs (required with D2):** ship recommended CI usage — not only command-flag notes. Prefer one of:

1. Expand [`docs/guides/workflows.md`](../../docs/guides/workflows.md) CI sections into a clear recipe (validate vs `diff --fail-on-removed` vs `validate --since`, when to use each, JSON/`-j -s` artifacts, GHA snippet), **or**
2. Add a dedicated guide (e.g. `docs/guides/ci.md`) and link it from workflows + command pages.

Also update [`docs/commands/validate.md`](../../docs/commands/validate.md) once `--since` is real, and keep [`docs/commands/diff.md`](../../docs/commands/diff.md) fail-flag guidance in sync. Wire any new page into the VitePress sidebar.

### D3 — config baseline (optional)

```ts
git: {
  tagPattern: 'v*',
  compatBaseline: 'v1.0.0', // or 'latest-tag'
},
```

CI can run `expgov validate --since` / `expgov diff --fail-on-removed` without hard-coding the tag every time (CLI override still wins).

---

## Acceptance criteria

- [x] Known removal between `A..B` → non-zero exit when fail mode enabled
- [x] No removals → exit `0`
- [x] Default `expgov diff` (no fail flag) remains exit `0` (no breaking CLI change)
- [x] `--json` sets `ok: false` + structured `issues` when failing
- [x] Docs: `docs/commands/diff.md`, `docs/commands/validate.md`, CI snippet in `docs/guides/workflows.md`
- [x] Core tests for fail / no-fail paths (`shared/__tests__/diffFail.test.ts`)
- [x] `expgov validate --since <ref>` exits 1 on removals or existing validate failures
- [x] Recommended CI usage in `docs/guides/workflows.md` (validate / diff / `--since` table + GHA sketch)
- [x] `validate --since` documented on `docs/commands/validate.md` (un-reserved)
- [x] Workflows + JSON guide point at the one-command PR gate

**D1–D2 shipped.** **D3** (`compatBaseline`) still open.

---

## CI use (shipped)

```bash
# Recommended one-command gate
expgov validate --since v1.0.0

# Or two-step
expgov validate
expgov diff v1.0.0..HEAD --fail-on-removed
```

Use an immutable released tag or commit as the baseline. This protects removals and renames while allowing additive API growth.

---

## After this ships — update nodehunter

Repo: **https://github.com/zamdevio/nodehunter** (local: `~/Tools/nodehunter`).

1. Bump `@expgov/cli` / `@expgov/core` (or the `file:../expgov` / workspace pin).
2. Add a verify CI step:

   ```yaml
   - name: export surface (compat since v1.0.0)
     run: pnpm exec expgov validate --since v1.0.0
   ```

3. Document in nodehunter `maintainer/systems/exports.md` and note baseline `v1.0.0`.
4. **Do not** fail on additions — post-v1 work will keep adding stable exports; only **removals** (and optional tier violations on `diff`) fail.

---

## Non-goals

- Failing on additions by default
- Rewriting barrels or auto-fixing removals
- Replacing `trend` / `timeline` (they stay archaeology)
