---
description: "expgov validate — governance checks on the working tree with exit code 0 on pass and 1 on tier or parity violations."
---

# validate

Governance checks on the working tree. **Exits 0 on pass, 1 on fail.**

```bash
expgov validate
expgov validate -v
expgov validate -T 5
expgov validate -F
```

Checks include:

- tsconfig path ↔ `package.json` exports parity
- Unclassified root flat exports
- Internal/advanced symbols still flat on the root barrel

`--since <ref>` is reserved for future baseline delta validation (not enforced yet). Until then, use [`diff --fail-on-removed`](./diff.md) as the CI surface-regression gate.

## Related

- [suggest](./suggest.md)
- [doctor](./doctor.md)
- [diff](./diff.md) — opt-in removal / tier fail flags
- [JSON output](../cli/json.md)
