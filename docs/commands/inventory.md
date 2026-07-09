---
description: "expgov inventory — summarize root barrel exports at a git ref or working tree with tier, namespace, and category breakdown."
---

# inventory

Summarize root barrel exports — flat count, namespaces, tier and category breakdown.

```bash
expgov inventory          # working tree (includes uncommitted edits)
expgov inventory HEAD
expgov inventory v0.1.4
```

`-v` prints a symbol table (tier, category, target subpath).

## Related

- [validate](./validate.md)
- [graph](./graph.md)
