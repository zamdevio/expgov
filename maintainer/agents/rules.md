# Rules

## Config (non-negotiable)

1. **TypeScript config only** — `expgov.config.ts`; no JSON/YAML config files.
2. **Tier governance** — every root flat export must classify via `@sdkTier` or `tiers.{stable,internal,advanced}`.
3. **`validate` exits 1** on unclassified exports or tsconfig/npm drift — treat as CI gate.
4. **Cache is gitignored** — `.expgov/cache/`; tip users when missing from `.gitignore`.

## Core purity

- No `console.*` in `packages/core` command paths — use `emitLog` / report formatters.
- Core never imports CLI or `@inquirer/prompts`.
- Chalk tokens live in `runtime/style.ts` for shared semantic colors only.

## Output contract

- **stdout** — command results (human reports or `--json` envelope)
- **stderr** — errors from log sink when level is `error`
- **`-j/--json`** — single JSON envelope on stdout; human reports suppressed
- **`-q/--quiet`** — no info/tips; primary report output remains
- **`-s/--silent`** — no human output except errors and `--json`

## Logging

- `[expgov] [info/warn/tip]` via `coreLog` / `coreLogTip`
- Gates: `runtime/policy.ts` + `RunOptions`
- Per-command box banner (`maybePrintCommandBanner`) — off under `--json` / `--silent`
- Help `(default: …)` uses bright yellow (`style.highlight`), rest dim

## Tier config schema (current)

```ts
tiers: {
  stable:   { exact?: string[]; prefix?: string[] }
  internal: { exact?: string[]; prefix?: string[] }
  advanced: { exact?: string[]; prefix?: string[] }
}
```

- `prefix` entries: plain string → `startsWith`; regex metacharacters or `/pattern/` → `RegExp.test`

## Command footer (human mode)

Reports print first; `finishCommand` appends optional `summary: counts` then `command · ok|fail · Nms`.

## PR discipline

- One phase slice per PR
- Update `maintainer/phases/shipped-slices.md` when closing a slice
- Run `pnpm build && expgov validate` before commit when touching exports or tiers
- User docs in `docs/` — no maintainer jargon

## Export changes

- Root barrel: `packages/core/src/index.ts`
- Update `expgov.config.ts` tier allowlist (or add `@sdkTier` on declaration)
- Run `expgov validate` after changing public exports
