---
description: "expgov validate — governance checks on the working tree; optional --since baseline fails on flat export removals."
---

# validate

Governance checks on the working tree. **Exits 0 on pass, 1 on fail.**

```bash
expgov validate
expgov validate -v
expgov validate -T 5
expgov validate -F
expgov validate --since v1.0.0
expgov validate --since v1.0.0 -j -s
```

Checks include:

- tsconfig path ↔ `package.json` exports parity
- Unclassified root flat exports
- Internal/advanced symbols still flat on the root barrel

## `--since <ref>` (CI / PR gate)

Compare the **working tree** against a git baseline (tag, branch, or SHA). Fail when:

1. Any current-tree validate check fails (same as bare `validate`), **or**
2. Any **flat export was removed** relative to that baseline (same gate as [`diff --fail-on-removed`](./diff.md))

Additions are allowed. Prefer an immutable released tag:

```bash
# One-command PR / CI gate
expgov validate --since v1.0.0

# Machine-readable
expgov validate --since v1.0.0 -j -s
```

JSON includes `data.since`, `data.sinceLabel`, `data.added`, `data.removed`, and removal issues use code `expgov.diff.exports_removed` (alongside `expgov.validate.violation` for other failures). See [JSON output](../cli/json.md) and [workflows](../guides/workflows.md).

`--since` requires a commit ref — not `worktree` / `wt`.

## Related

- [suggest](./suggest.md)
- [doctor](./doctor.md)
- [diff](./diff.md) — informational compare + opt-in fail flags
- [JSON output](../cli/json.md)
- [Workflows / CI](../guides/workflows.md)
