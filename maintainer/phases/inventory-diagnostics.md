# Phase — Inventory diagnostics (reachable SDK surface)

**Status:** Planned — independent of Agentic/Diff; schedule after AG1–AG2 or as a parallel engine slice if a silent-miss dogfood hurts.

**Companion:** [`../systems/principles.md`](../systems/principles.md) · [`../systems/exports.md`](../systems/exports.md) · [`../../docs/governance.md`](../../docs/governance.md) · orphan brainstorm in [`graph-2.md`](./graph-2.md)

---

## Mission

Make inventory **honest about what it does not see**, without turning expgov into a workspace-wide analyzer (Knip/Madge).

expgov governs the **reachable SDK surface** only:

- Root package barrels
- Package subpaths
- Every downstream module transitively reachable from those entry points

Anything outside that graph is intentional implementation detail and out of scope.

---

## Problem

### ID1 — Direct declarations inside tracked barrels

Inventory walks re-exports (`export { … } from` / `export * as`). Declarations defined **directly** in a tracked barrel are silently ignored:

```ts
export { add } from './math';
export const VERSION = '1.0.0'; // inventoriable? today: no, and no warning
```

### ID2 — Tracked modules with no reachable SDK exports

A module already in the barrel/re-export closure may declare symbols (even with `@sdkTier`) yet contribute **zero** reachable exports to the governing surface. Today that can stay silent.

---

## Delivery slices

| ID | Slice | Outcome |
|----|-------|---------|
| **ID1** | Direct barrel declarations | Detect locals in tracked barrels; never fail silently — warn (and optionally inventorie later) |
| **ID2** | Dead contribution in closure | After graph build: modules in closure that declare but expose nothing reachable; info/warn only; **no** workspace-wide scan |
| **ID-DOC** | Principle + diagnostic docs | Update systems + public docs **after** ID1/ID2 code lands (see below) |

Suggested order: **ID1 → ID2 → ID-DOC**. Warn-first for ID1; first-class inventory of barrel locals is a follow-up if dogfood demands it.

---

## ID1 — Proposed behavior

If a tracked barrel contains direct export declarations:

- Report them explicitly (human + `issues[]` / structured note under JSON).
- Either treat as first-class SDK exports **or** emit a diagnostic that they are not governed yet.
- Never fail silently.

Stable issue code (proposed): `expgov.inventory.direct_barrel_export`.

---

## ID2 — Proposed behavior

After building the reachable SDK graph, report tracked modules that contain declarations but expose nothing through the governing barrel/subpath.

Applies **only** to modules already in the SDK graph. Must **not** scan the whole workspace.

Stable issue code (proposed): `expgov.inventory.unreachable_module_exports`.

Cross-link: graph-2 “orphan detection” brainstorm — keep module-vs-edges UX there; ID2 is inventory/validate diagnostic on the same closure.

---

## Doc plan (ship with / after code — ID-DOC)

Do **not** claim diagnostics exist in public docs before the flags/codes ship. Update these when ID1/ID2 land:

| Audience | Path | What to write |
|----------|------|----------------|
| Maintainer principle | [`../systems/principles.md`](../systems/principles.md) | Row: **Reachable SDK surface** (scope + non-goals vs Knip/Madge) — principle text may land early; diagnostic bullets after code |
| Maintainer map | [`../systems/exports.md`](../systems/exports.md) | Scope section: entry points → closure; parser rules (re-export vs direct); ID1/ID2 check list |
| Maintainer cache | [`../systems/cache.md`](../systems/cache.md) | Tie invalidation closure to the same reachable graph |
| Public model | [`../../docs/governance.md`](../../docs/governance.md) | “What expgov governs” = reachable surface; link diagnostics once live |
| Public commands | `docs/commands/inventory.md`, `validate.md` | When diagnostics appear, how severity / exit codes behave |
| Receipt | [`../shipped/README.md`](../shipped/README.md) + inventory-cache receipt | Fold ID1/ID2 when shipped |

---

## Acceptance criteria

- [ ] Direct barrel export decls produce an explicit diagnostic (or enter inventory) — no silent drop
- [ ] Closure modules with decls but zero reachable SDK exports produce an explicit diagnostic
- [ ] No workspace-wide scan; only entry barrels/subpaths + transitive closure
- [ ] Stable issue codes in JSON when emitted
- [ ] Human output readable under default / `-v`; quiet under `-s` except via JSON
- [ ] ID-DOC: systems + `docs/governance.md` (+ command pages) updated after code
- [ ] Tests cover fixture barrels with locals and dead-contribution modules

---

## Non-goals

- Replacing Knip/Madge for unused files outside the SDK graph
- Auto-rewriting barrels to move locals into modules
- Failing CI by default on ID2 info-level notes (policy/severity later)
- Changing AG1 JSON completeness (symbols already inventoriable)

---

## Scheduling note

Independent of Diff D2 and Agentic AG1–AG2. Prefer finishing AG1 (expose current truth over JSON) before widening what inventory *means*, unless a consumer is already bitten by silent direct-barrel misses.
