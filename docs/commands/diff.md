---
description: "expgov diff — compare export surfaces between git refs or working tree; optional CI fail flags for removals and tier violations."
---

# diff

Compare export surfaces between refs. Default: `HEAD` → working tree.

By default `diff` is **informational** — exit `0` even when exports were removed. Use opt-in fail flags for CI gates on a frozen 1.x surface.

```bash
expgov diff
expgov diff HEAD
expgov diff v0.1.3..v0.1.4
expgov diff HEAD~30..HEAD~1
expgov diff v1.0.0..HEAD --fail-on-removed
expgov diff v1.0.0..HEAD --fail-on-removed --fail-on-tier-violations
```

## Ref ranges

| Form | Meaning |
|------|---------|
| `older..newer` | Snapshot at `older` vs snapshot at `newer` — **order matters** |
| `(omit)` / default | `HEAD` → **working tree** |
| single ref `v0.1.4` | `v0.1.4` → **working tree** |

**Diff-only** — timeline time ranges (`@4w`, ISO dates) are not supported here.

Reports added/removed flat exports and tier violations (internal/advanced promoted to root).

## Fail flags (CI)

| Flag | Behavior |
|------|----------|
| `--fail-on-removed` | Exit `1` when any flat export was removed |
| `--fail-on-tier-violations` | Exit `1` when the right-side snapshot has tier violations |
| (neither) | Always exit `0` — report only |

With `--json`, failing runs set `ok: false` and emit `issues[]` with codes `expgov.diff.exports_removed` and/or `expgov.diff.tier_violation`. `data.added` / `data.removed` / `data.tierViolations` stay present for agents.

Additions never fail the gate — only removals (and optional tier violations).

### When to use `--fail-on-removed`

Use it after publishing a stable SDK baseline (usually a `v1.x` tag) when removing or renaming a root export would break consumers:

```bash
# CI: protect the public surface released at v1.0.0
expgov diff v1.0.0..HEAD --fail-on-removed

# Local: check uncommitted barrel edits against the current commit
expgov diff HEAD --fail-on-removed
```

Choose an immutable released tag or commit for the left side. The right side is the candidate release (`HEAD` in CI, or the working tree when only one ref is supplied).

Do not use this flag to reject additive API growth: additions remain allowed. It also does not replace `expgov validate`, which checks current-tree tier classification and package/config policy. Run both in CI until `validate --since` is implemented.

## Related

- [timeline](./timeline.md) — shared `A..B` grammar for ref ranges
- [validate](./validate.md)
- [Workflows](../guides/workflows.md)
