---
description: "expgov timeline — git log of commits that edited the root barrel with per-step deltas, summary metrics, and ref or time ranges."
---

# timeline

Git log of commits that **edited the root barrel**. Default range: `@4w`.

```bash
expgov timeline
expgov timeline @3m
expgov timeline 2025-01-01..2025-06-01
expgov timeline v1.0.0..HEAD
expgov timeline HEAD~20
expgov timeline HEAD~30..HEAD~1
```

## What appears

Only commits that **touched the root barrel file** in the chosen window — barrel archaeology, not full repo history.

## Time ranges

`@4w`, `@3m`, ISO week (`2026-W24`), and inclusive date ranges filter by commit date (UTC).

## Ref ranges

| Form | Meaning |
|------|---------|
| `older..newer` | Barrel edits after `older` toward `newer` |
| `HEAD~N` | Shorthand for `HEAD~N..HEAD` |

**`HEAD~N` is not “the last N commits”.** It resolves to one specific commit.

## Output

Human order: meta → warm section → commit table → **summary** (API growth, churn, drift, cache coverage) → insights.

JSON: `data.rows[].step`, `data.summary`, `data.warmStats`. Use `-v` for inline shorthand on table rows.

## Related

- [diff](./diff.md) — shared `A..B` ref grammar
- [Flags](../cli/flags.md)
