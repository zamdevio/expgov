---
description: "expgov graph — export surface graph with namespace-first layout, re-export targets, subpaths, module fan-in, and analytics summary."
---

# graph

Export surface graph — **root namespaces first** (sorted by edge count), re-export targets, published subpaths, top source modules.

```bash
expgov graph
expgov graph HEAD -v
```

Human output: meta → namespaces (tier/category composition) → re-export targets → published subpaths → top modules → **Summary** (edge density, hottest module, fan-in) → insights.

JSON: `data.analytics` includes namespace composition, edge density, hottest module, and fan-in modules. With `-v` or `-F`, JSON also includes `data.edges` under the same `-T`/`-F` list policy as other commands (see [JSON output](../cli/json.md)).

## Related

- [inventory](./inventory.md)
- [validate](./validate.md)
