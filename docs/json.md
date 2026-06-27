# JSON envelope

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

`apiVersion` is `RESULT_API_VERSION` from `expgov/core` — bump when the envelope shape changes.

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

```json
{
  "ok": true,
  "kind": "inventory",
  "data": {
    "ref": "worktree",
    "sha": "__worktree__",
    "summary": { "root": { "flat": 80, "namespaces": 0 }, "sdkTiers": { "stable": 80 } },
    "cache": { "status": "hit" }
  },
  "issues": [],
  "meta": { "apiVersion": "1", "command": "inventory", "durationMs": 12 }
}
```

## `kind` values

| `kind` | Command |
|--------|---------|
| `inventory` | `expgov inventory` |
| `diff` | `expgov diff` |
| `validate` | `expgov validate` |
| `doctor` | `expgov doctor` |
| `trend` | `expgov trend` |
| `timeline` | `expgov timeline` |
| `graph` | `expgov graph` |

## CI usage

```bash
pnpm build
node dist/cli.js validate --json
```

Parse `ok` and `issues` for automation. `expgov validate` without `--json` is sufficient for a pass/fail gate (exit code only).
