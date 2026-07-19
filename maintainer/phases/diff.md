# Phase — Diff fail gate (export surface regressions)

**Status:** Active — optional **D3** only · **Companion:** [`agentic.md`](./agentic.md)

Triggered by nodehunter frozen `v1.0.0` surface.

---

## Shipped

| ID | Outcome | Receipt |
|----|---------|---------|
| **D1** | `diff --fail-on-removed` / `--fail-on-tier-violations`; `ok:false` + `issues[]` | [`../shipped/git-commands.md`](../shipped/git-commands.md) |
| **D2 / AG4** | `validate --since <ref>` (removals ∪ validate) | same · CI docs in `docs/guides/workflows.md` |

```bash
expgov validate --since v1.0.0          # preferred one-command CI gate
expgov diff v1.0.0..HEAD --fail-on-removed
```

Default interactive `diff` (no fail flags) stays exit `0`.

---

## Remaining — D3 `compatBaseline` (optional)

```ts
git: {
  tagPattern: 'v*',
  compatBaseline: 'v1.0.0', // or 'latest-tag'
},
```

CI can omit the tag when config supplies a default; CLI `--since` still wins.

**Non-goals:** fail on additions by default; rewrite barrels; replace `trend` / `timeline`.

---

## After ship — nodehunter

1. Bump `@expgov/cli` / `@expgov/core` (or workspace pin).
2. CI: `pnpm exec expgov validate --since v1.0.0`.
3. Document baseline in nodehunter maintainer exports notes.
