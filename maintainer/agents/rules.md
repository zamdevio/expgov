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

## Source layout (types / constants)

Keep logic modules thin — full rules in [`architecture.md`](./architecture.md#module-organization-types--constants).

1. **Types** — `export type` / `export interface` only under `packages/*/src/types/` (subdir barrels OK).
2. **Constants** — named consts under `packages/core/src/shared/constants/` or `packages/cli/src/constants/`.
3. **Logic imports, does not re-export** — feature modules must not `export type { … }` or re-export consts for call-sites; import from the type/const barrel instead.
4. **Local aliases OK** — file-private `type X = …` with no export is fine.
5. **Public root exception** — only `packages/core/src/index.ts` is the intentional published re-export surface.

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
- Update `maintainer/shipped/README.md` when closing a slice
- Run `pnpm build && expgov validate` before commit when touching exports or tiers
- User docs in `docs/` — no maintainer jargon

## Commit messages (Conventional Commits)

Format: `<type>(<scope>): <imperative subject>` — subject lowercase, no trailing period, ≤72 chars.

| Type | Use for |
|------|---------|
| `feat` | New commands, behavior, public exports |
| `fix` | Bug fixes |
| `refactor` | Internal structure; no intended user-visible change |
| `docs` | `docs/` or `maintainer/` only |
| `ci` | `.github/workflows/` |
| `build` | tsup / build pipeline only |

**Scopes (pick one):** `cli`, `core`, `config`, `cache`, `doctor`, `suggest`, `ci`, `docs`.

Breaking CLI or config contracts: `feat(scope)!:` in the subject and/or a `BREAKING CHANGE:` footer.

Example: `feat(cli): add version command with build-time semver injection`

**Recovery:** `backup/pre-conventional-071a012` preserves pre-rewrite history if needed.

## Export changes

- Root barrel: `packages/core/src/index.ts`
- Update `expgov.config.ts` tier allowlist (or add `@sdkTier` on declaration)
- Run `expgov validate` after changing public exports
