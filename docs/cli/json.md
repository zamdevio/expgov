---
description: "expgov --json envelope contract — ok, kind, data, issues, meta.apiVersion, exit codes, and CI parsing examples."
---

# JSON output

Pass `-j` or `--json` to any command for machine-readable output on **stdout**.

Human reports, banners, tips, and footers are suppressed. Errors still surface on stderr when not using `--silent`.

## Shape

```ts
type CliJsonEnvelope<K extends string, D> = {
  ok: boolean;
  kind: K;           // command name, e.g. 'validate' | 'inventory'
  data: D;           // command-specific payload
  issues: Issue[];   // structured errors/warnings
  meta: {
    apiVersion: string;   // envelope contract version (currently '1')
    cwd?: string;
    durationMs?: number;
    command?: string;
    schemaVersion?: string;
  };
};

type Issue = {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  path?: string;
};
```

`apiVersion` is `RESULT_API_VERSION` from `@expgov/cli/core` or `@expgov/core` — bump when the envelope shape changes.

`--json` already suppresses all human output; `--silent` is redundant when JSON mode is active.

**Detail flags:** With `--json`, `-v` / `--verbose` and `-F` / `--full` expand `data` with the same list payloads humans see. **List policy is shared:** `-T` / `--top` and `-F` / `--full` truncate or uncap JSON arrays the same way as human lists.

When a list is truncated, JSON includes a stable **`data.listGuidance`** block carrying both the flag and the guidance in one place:

```json
{
  "listGuidance": {
    "truncated": true,
    "note": "symbols: 91 more hidden (showing 10 of 101). Use -F/--full for all rows, or -T/--top <n> to raise the cap."
  }
}
```

Agents should check `listGuidance.truncated` before assuming a list is complete; `listGuidance.note` explains how to expand it. Uncapped runs still emit `listGuidance: { "truncated": false }` (no `note`) whenever list sections are present.

## Insights

Commands that emit insights always include `data.insights` as:

```ts
{
  lines: Array<{ key: string; text: string }>; // max 5; may be []
  // plus optional command-specific typed fields
}
```

Empty insights are `{ "lines": [] }` (never `null`). Human mode hides the Insights block when `lines` is empty.

**Delta sign convention** (typed fields and `+/−` text):

| Command | Positive means |
|---------|----------------|
| `diff` | Growth on the **right** side (right − left) |
| `trend` | Growth on the **later** tag (tags oldest → newest) |
| `timeline` | Growth on the **newer** commit (rows newest-first; `delta` = this row − older row below; oldest row `delta` is `null`) |

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Command succeeded (`ok: true`) |
| `1` | Validation or governance failure (`validate` with violations) |
| other | Unexpected errors |

### Thrown and usage errors

Errors raised before a command can finish also emit the standard envelope. The command stays in `kind` / `meta.command`; structured error details live at `data.error`:

```bash
expgov diff missing-tag..HEAD -j
```

```json
{
  "ok": false,
  "kind": "diff",
  "data": {
    "error": {
      "code": "unknown_ref",
      "message": "Unknown git ref \"missing-tag\"",
      "details": {
        "ref": "missing-tag",
        "suggestion": "Known version tags: v1.0.0, v1.0.1"
      }
    }
  },
  "issues": [
    {
      "severity": "error",
      "code": "unknown_ref",
      "message": "Unknown git ref \"missing-tag\""
    }
  ],
  "meta": { "apiVersion": "1", "command": "diff", "durationMs": 0 }
}
```

This applies to domain errors (`unknown_ref`, `invalid_range`, `barrel_missing`), unexpected execution errors (`unexpected_error`), and CLI parser errors (`usage`). Stdout remains parseable JSON and the process still exits non-zero.

## Examples

### `validate` (pass)

```bash
expgov validate --json
```

```json
{
  "ok": true,
  "kind": "validate",
  "data": {
    "passed": true,
    "violations": [],
    "notes": [],
    "sdkTiers": { "stable": 80, "advanced": 0, "internal": 0, "unclassified": 0 }
  },
  "issues": [],
  "meta": {
    "apiVersion": "1",
    "cwd": "/path/to/project",
    "durationMs": 42,
    "command": "validate"
  }
}
```

### `validate` (fail)

When checks fail, `ok` is `false`, `issues` lists structured violations, and the process exits `1`:

```json
{
  "ok": false,
  "kind": "validate",
  "data": {
    "passed": false,
    "violations": ["3 unclassified root flat export(s)"],
    "notes": []
  },
  "issues": [
    {
      "severity": "error",
      "code": "expgov.validate.violation",
      "message": "3 unclassified root flat export(s)"
    }
  ],
  "meta": { "apiVersion": "1", "command": "validate", "durationMs": 38 }
}
```

### `validate --since`

Baseline vs working tree (CLI `--since`, or `git.compatBaseline` when the flag is omitted; CLI wins). Removals use the same issue code as `diff --fail-on-removed`. `data.since` is the effective resolved ref (`'latest-tag'` becomes the newest matching tag):

```bash
expgov validate --since v1.0.0 -j
```

```json
{
  "ok": false,
  "kind": "validate",
  "data": {
    "passed": false,
    "violations": ["1 flat export removed: legacyHelper"],
    "notes": [],
    "since": "v1.0.0",
    "sinceLabel": "v1.0.0 → working tree",
    "added": ["newApi"],
    "removed": ["legacyHelper"]
  },
  "issues": [
    {
      "severity": "error",
      "code": "expgov.diff.exports_removed",
      "message": "1 flat export removed: legacyHelper"
    }
  ],
  "meta": { "apiVersion": "1", "command": "validate", "durationMs": 52 }
}
```

### `inventory`

Default JSON is summary-only. Pass `-v` or `-F` to include root flat symbols and namespaces. Lists honor the same `-T` / `-F` policy as human verbose mode (default top `10`; `-F` = uncapped, `top` serializes as `null`):

When `--tier` / `--category` / `--namespace` / `--module` / `--subpath` are set, JSON includes `data.filters` with only the active keys (omitted entirely when none apply).

Warn diagnostics (direct barrel decls, unreachable module exports) appear in top-level `issues[]` with `ok: true` — they do not fail the command. Codes: `expgov.inventory.direct_barrel_export`, `expgov.inventory.unreachable_module_exports`. Optional `samples[]` lists export names; human Diagnostics shows path + message, then up to 3 samples on the next line (and respects `-T`/`-F` for how many diagnostic rows print).

```bash
expgov inventory -v -j          # top 10 symbols + namespacesHidden
expgov inventory -v -T 5 -j     # top 5
expgov inventory -F -j          # all symbols (same as -v -F)
```

```json
{
  "ok": true,
  "kind": "inventory",
  "data": {
    "ref": "worktree",
    "sha": "__worktree__",
    "summary": { "root": { "flat": 80, "namespace": 0 }, "subpaths": [] },
    "cache": { "status": "hit" },
    "insights": {
      "lines": [{ "key": "largest-module", "text": "largest module: … (N edges, M flats)" }],
      "largestModule": { "path": "packages/core/src/…", "count": 12 }
    },
    "top": 10,
    "symbols": [
      {
        "name": "runValidate",
        "tier": "stable",
        "category": "run",
        "symbolKind": "function",
        "targetSubpath": "./commands/validate",
        "module": "packages/core/src/commands/validate.ts"
      }
    ],
    "namespaces": [],
    "symbolsHidden": 70,
    "namespacesHidden": 0,
    "listGuidance": {
      "truncated": true,
      "note": "symbols: 70 more hidden (showing 10 of 80). Use -F/--full for all rows, or -T/--top <n> to raise the cap."
    }
  },
  "issues": [],
  "meta": { "apiVersion": "1", "command": "inventory", "durationMs": 12 }
}
```

Use `summary.root.flat` for the true total; `symbols.length + symbolsHidden` matches that total when detail is present. Omit `-v`/`-F`/`--names-only` and those list fields are absent.

With `--names-only` (alone or with `-v`/`-F`), detail arrays are bare name strings and `data.namesOnly` is `true`:

```json
{
  "namesOnly": true,
  "symbols": ["runValidate", "runInventory"],
  "namespaces": ["Cli"]
}
```

### `graph`

Default JSON is analytics + target groups. Pass `-v`, `-F`, or `--names-only` to include re-export `edges[]` under the same `-T`/`-F` list policy + `listGuidance`. With `--names-only`, `edges` is unique sorted symbol names and `data.namesOnly` is `true`.

```bash
expgov graph -v -j
expgov graph -F -j
```

```json
{
  "ok": true,
  "kind": "graph",
  "data": {
    "ref": "worktree",
    "edgeCount": 120,
    "targetGroups": [{ "targetSubpath": "./commands", "flat": 9, "namespace": 0 }],
    "analytics": { "edgeDensity": 1.2, "hottestModule": { "path": "…", "edges": 12 } },
    "insights": { "lines": [] },
    "top": 10,
    "edges": [
      {
        "kind": "flat-reexport",
        "from": "packages/core/src/index.ts",
        "symbol": "runValidate",
        "toModule": "packages/core/src/commands/validate.ts",
        "targetSubpath": "./commands/validate"
      }
    ],
    "edgesHidden": 110,
    "listGuidance": {
      "truncated": true,
      "note": "edges: 110 more hidden (showing 10 of 120). Use -F/--full for all rows, or -T/--top <n> to raise the cap."
    }
  },
  "issues": [],
  "meta": { "apiVersion": "1", "command": "graph", "durationMs": 18 }
}
```

`edgeCount` is the true total; `edges.length + edgesHidden` matches it when detail is present.

### `diff`

Default JSON always includes complete `added` / `removed` name arrays (and `tierViolations`) — do not truncate those for CI. Pass `-v` or `-F` for rich symbol detail under the shared `-T`/`-F` list policy:

```bash
expgov diff v1.0.0..HEAD -v -j
expgov diff v1.0.0..HEAD -F -j
```

```json
{
  "ok": true,
  "kind": "diff",
  "data": {
    "rangeLabel": "v1.0.0 → HEAD",
    "added": ["newApi"],
    "removed": ["legacyHelper"],
    "tierViolations": [],
    "top": 10,
    "addedDetail": [
      {
        "name": "newApi",
        "tier": "stable",
        "category": "run",
        "symbolKind": "function",
        "targetSubpath": ".",
        "module": "packages/core/src/commands/new.ts"
      }
    ],
    "removedDetail": [
      {
        "name": "legacyHelper",
        "tier": "stable",
        "category": "other",
        "symbolKind": "function",
        "targetSubpath": ".",
        "module": "packages/core/src/legacy.ts"
      }
    ],
    "addedDetailHidden": 0,
    "removedDetailHidden": 0,
    "listGuidance": { "truncated": false }
  },
  "issues": [],
  "meta": { "apiVersion": "1", "command": "diff", "durationMs": 40 }
}
```

Use `added` / `removed` for complete name sets; use `*Detail` when agents need tier/module metadata. Omit `-v`/`-F` and detail fields are absent.

## `kind` values

| `kind` | Command |
|--------|---------|
| `inventory` | `expgov inventory` |
| `diff` | `expgov diff` |
| `validate` | `expgov validate` |
| `doctor` | `expgov doctor` |
| `suggest` | `expgov suggest` |
| `trend` | `expgov trend` |
| `timeline` | `expgov timeline` |
| `graph` | `expgov graph` |

## CI usage

```bash
pnpm build
expgov validate --since v1.0.0 --json > validate.json
test "$(jq -r .ok validate.json)" = "true"
```

When `--since` is set, `data` also includes `since`, `sinceLabel`, `added`, and `removed`. Failures may mix `expgov.validate.violation` with `expgov.diff.exports_removed` in `issues[]`.

Surface-only regression gate (opt-in on `diff`):

```bash
expgov diff v1.0.0..HEAD --fail-on-removed --json > diff.json
test "$(jq -r .ok diff.json)" = "true"
```

Failing diff runs emit `issues[]` with `expgov.diff.exports_removed` and/or `expgov.diff.tier_violation`. Parse `ok` and `issues` for automation. Exit-code-only gates work without `--json`.

## Related

- [Flags](./flags.md)
- [Workflows](../guides/workflows.md)
- [SDK overview](../sdk/README.md)
