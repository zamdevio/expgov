---
description: "expgov doctor — read-only setup checks for config paths, cache gitignore, and tsconfig/npm drift hints before running governance."
---

# doctor

Read-only setup checks — config paths, cache gitignore, tsconfig/npm drift hints. **Exits 0 when healthy, 1 when warnings remain.**

```bash
expgov doctor
expgov doctor -v
```

Use `validate` for full tier enforcement; `doctor` is for environment hygiene before you run governance commands.

## Related

- [validate](./validate.md)
- [Install](../install.md)
