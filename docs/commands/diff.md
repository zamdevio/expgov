---
description: "expgov diff — compare export surfaces between git refs or working tree with added/removed flats and tier violation reports."
---

# diff

Compare export surfaces between refs. Default: `HEAD` → working tree.

```bash
expgov diff
expgov diff HEAD
expgov diff v0.1.3..v0.1.4
expgov diff HEAD~30..HEAD~1
```

## Ref ranges

| Form | Meaning |
|------|---------|
| `older..newer` | Snapshot at `older` vs snapshot at `newer` — **order matters** |
| `(omit)` / default | `HEAD` → **working tree** |
| single ref `v0.1.4` | `v0.1.4` → **working tree** |

**Diff-only** — timeline time ranges (`@4w`, ISO dates) are not supported here.

Reports added/removed flat exports and tier violations (internal/advanced promoted to root).

## Related

- [timeline](./timeline.md) — shared `A..B` grammar for ref ranges
- [validate](./validate.md)
