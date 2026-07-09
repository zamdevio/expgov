---
description: "expgov init — scaffold expgov.config.ts with conservative tier defaults, layout detection, and non-interactive flags for CI."
---

# init

Scaffold `expgov.config.ts` at the project root.

```bash
expgov init
expgov init -y -r    # non-interactive with commented tier examples
```

| Flag | Role |
|------|------|
| `-y, --yes` | Write without prompts (CI / non-TTY) |
| `-f, --force` | Overwrite existing config |
| `-r, --rich` | Commented `cache` block and `tiers.*` exact/prefix examples |

Detects monorepo `packages/core` vs single-package `src/index.ts` layouts.

## Related

- [Configuration](../config.md)
- [Workflows](../guides/workflows.md)
