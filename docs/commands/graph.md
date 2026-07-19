---
description: "expgov graph — export surface graph with namespace-first layout, re-export targets, subpaths, module fan-in, and analytics summary."
---

# graph

Export surface graph — **root namespaces first** (sorted by edge count), re-export targets, published subpaths, top source modules.

```bash
expgov graph
expgov graph HEAD -v
expgov graph --module commands --category run -T 5
expgov graph --subpath types -v -j
```

Human output: meta → namespaces (tier/category composition) → re-export targets → published subpaths → top modules → **Summary** (edge density, hottest module, fan-in) → insights.

Shared filters (`--tier`, `--category`, `--namespace`, `--module`, `--subpath`) narrow the snapshot view **before** analytics and lists. Active filters appear in meta / `data.filters`. See [Flags](../cli/flags.md#filter-flags).

JSON: `data.analytics` includes namespace composition, edge density, hottest module, and fan-in modules. With `-v` or `-F`, JSON also includes `data.edges` under the same `-T`/`-F` list policy as other commands (see [JSON output](../cli/json.md)).

## Related

- [inventory](./inventory.md)
- [validate](./validate.md)
