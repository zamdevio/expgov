---
description: "expgov suggest — dry-run tier allowlist helper listing unclassified flat exports to add to tiers.stable.exact without editing config."
---

# suggest

Dry-run tier allowlist helper — lists unclassified flat exports and prints names to add to `tiers.stable.exact`. **Does not edit config.** Exits `1` when suggestions exist.

```bash
expgov suggest
expgov suggest -v
```

Workflow: `suggest` → copy into `expgov.config.ts` → `validate`.

## Related

- [validate](./validate.md)
- [Configuration](../config.md)
