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

## Related

- [suggest](./suggest.md)
- [doctor](./doctor.md)
- [JSON output](../cli/json.md)
