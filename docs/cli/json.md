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

**Detail flags:** With `--json`, `-v` / `--verbose` and `-F` / `--full` expand `data` with the same list payloads humans see. **List policy is shared:** `-T` / `--top` and `-F` / `--full` truncate or uncap JSON arrays the same way as human lists.

When a list is truncated, JSON includes a stable **`data.listGuidance`** block (and mirrors the text in **`data.notes`**):

```json
{
  "listGuidance": {
    "truncated": true,
    "note": "symbols: 91 more hidden (showing 10 of 101). Use -F/--full for all rows, or -T/--top <n> to raise the cap."
  },
  "notes": [
    "symbols: 91 more hidden (showing 10 of 101). Use -F/--full for all rows, or -T/--top <n> to raise the cap."
  ]
}
```

Agents should check `listGuidance.truncated` (or scan `notes`) before assuming a list is complete. Uncapped runs still emit `listGuidance: { "truncated": false }` whenever list sections are present.

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Command succeeded (`ok: true`) |
| `1` | Validation or governance failure (`validate` with violations) |
| other | Unexpected errors |

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

### `inventory`

Default JSON is summary-only. Pass `-v` or `-F` to include root flat symbols and namespaces. Lists honor the same `-T` / `-F` policy as human verbose mode (default top `10`; `-F` = uncapped, `top` serializes as `null`):

```bash
expgov inventory -v -j -s          # top 10 symbols + namespacesHidden
expgov inventory -v -T 5 -j -s     # top 5
expgov inventory -F -j -s          # all symbols (same as -v -F)
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
        "name": "runExportsValidate",
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
    },
    "notes": [
      "symbols: 70 more hidden (showing 10 of 80). Use -F/--full for all rows, or -T/--top <n> to raise the cap."
    ]
  },
  "issues": [],
  "meta": { "apiVersion": "1", "command": "inventory", "durationMs": 12 }
}
```

Use `summary.root.flat` for the true total; `symbols.length + symbolsHidden` matches that total when detail is present. Omit `-v`/`-F` and those list fields are absent.

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
expgov validate --json --silent > validate.json
test "$(jq -r .ok validate.json)" = "true"
```

Surface regression gate (opt-in on `diff`):

```bash
expgov diff v1.0.0..HEAD --fail-on-removed --json --silent > diff.json
test "$(jq -r .ok diff.json)" = "true"
```

Failing diff runs emit `issues[]` with `expgov.diff.exports_removed` and/or `expgov.diff.tier_violation`. Parse `ok` and `issues` for automation. Exit-code-only gates work without `--json`.

## Related

- [Flags](./flags.md)
- [Workflows](../guides/workflows.md)
- [SDK overview](../sdk/README.md)
