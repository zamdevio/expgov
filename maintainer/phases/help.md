# Phase — Help color hierarchy

**Status:** Planned — small independent slice; may ship before, alongside, or after current Diff/Agentic work.

**Reference:** local `~/Tools/i18nprune` help renderer · [`cli-output-audit.md`](./cli-output-audit.md) · [`../systems/cli.md`](../systems/cli.md)

---

## Mission

Match i18nprune's command-help token hierarchy without changing help text or CLI behavior:

- **CLI binary** (`expgov`) → bold blue
- **Command path** (`validate`, `diff`, …) → bold cyan
- **Flags and their values** (`-j`, `--since v1.0.0`) → dim
- **Section labels** (`Usage:`, `Examples:`) → keep bold magenta

Apply the same hierarchy to both `Usage:` and every command line under `Examples:`.

```txt
Usage: expgov validate [options]

Examples:
  expgov validate
  expgov validate -j
  expgov diff v1.0.0..HEAD --fail-on-removed
```

`--no-color` must retain identical plain text.

---

## HELP1 — Token-aware help styling

**Scope:** one small PR or a parallel addition to another CLI-only slice.

1. Update `styleUsageLine` to recognize `CLI_NAME` and style the binary separately from the command path and placeholders.
2. Add `styleExampleLine` (adapt the proven tokenizer from `~/Tools/i18nprune/packages/cli/src/utils/help/exampleLine.ts`):
   - binary first;
   - command/subcommand tokens until the first flag;
   - flags and following values dim;
   - preserve spacing and plain text.
3. Route `Examples:` rows through `styleExampleLine` instead of styling the full line cyan.
4. Add focused ANSI/no-color tests for usage, no-flag examples, short/long flags, and flag values.

---

## Expected touchpoints

| Area | Path |
|------|------|
| Help renderer | `packages/cli/src/utils/help/configureCliHelp.ts` |
| Example tokenizer | `packages/cli/src/utils/help/exampleLine.ts` (new) |
| Tests | `packages/cli/src/utils/help/__tests__/exampleLine.test.ts` and/or `configureCliHelp.test.ts` |
| Durable map after ship | `maintainer/systems/cli.md` |
| Receipt after ship | `maintainer/shipped/README.md` |

`packages/core/src/runtime/style.ts` already exposes `blue`, `accent` (cyan), and `dim`; add no new chalk usage outside that semantic token module.

---

## Acceptance criteria

- [ ] `Usage:` keeps its magenta label; `expgov` is blue; command path is cyan; placeholders/options are dim.
- [ ] Every `Examples:` command uses blue binary + cyan command + dim flags/values.
- [ ] Root and subcommand help use the same formatter.
- [ ] `--no-color` output is byte-for-byte equivalent in text and spacing.
- [ ] Existing Commander sections, descriptions, defaults, related commands, and workflow appendix are unchanged.
- [ ] Focused tests pass; required repository gates run if shipped with code.

---

## Non-goals

- Rewriting help copy, command aliases, or Commander layout
- Changing JSON/silent behavior
- Broad CLI output restyling (remains in [`cli-output-audit.md`](./cli-output-audit.md))
- Introducing chalk imports outside `runtime/style.ts`

