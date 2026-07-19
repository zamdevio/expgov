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

`-v` prints root-barrel symbols and namespaces (tier with short provenance like `(exact)` / `(prefix)`, category, target subpath). With `--json`, `-v` or `-F` also adds the same root-scoped `data.symbols` / `data.namespaces` under the shared `-T`/`-F` list policy (see [JSON output](../cli/json.md)). Source module paths are on JSON rows as `module` (not a human table column).

Shared filters (`--tier`, `--category`, `--namespace`, `--module`, `--subpath`) narrow those root-detail lists. They do not expand the listing to published subpath barrels. A package that keeps advanced/internal exports off its stable root can therefore return an empty detail list for `--tier advanced` or `--tier internal`; SDK-wide counts and published-subpath rollups remain in the summary. Active filters appear in meta / `data.filters` (see [Flags](../cli/flags.md#filter-flags)).

**Diagnostics** (warn-first): direct barrel decls and unreachable exports inside tracked modules. Shown as a Diagnostics block; JSON `issues[]` with `expgov.inventory.*` codes. Does not fail the command — see [Governance](../governance.md).

## Related

- [validate](./validate.md)
- [graph](./graph.md)
- [Governance model](../governance.md)
