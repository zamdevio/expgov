# Onboarding

## Reading order

1. Root `README.md` — product vision and install
2. [`maintainer/phases/active-phase.md`](../phases/active-phase.md) — current slice (release sprint)
3. [`maintainer/phases/release.md`](../phases/release.md) — v1.0.0 checklist
3. [`maintainer/agents/architecture.md`](./architecture.md) — layout
4. [`maintainer/systems/tiers.md`](../systems/tiers.md) — tier schema + classifier
5. [`maintainer/systems/cli.md`](../systems/cli.md) — host output contract

## Trace a command

```txt
packages/cli/bin/cli.ts
  → bootstrapRuntime() + subscribe console sink
  → cli.ts preAction (RunOptions, style, banner)
  → initProjectContext({ cwd, config, ... })
  → runExportsValidate / inventory / …
  → beginCommand → reports via emitLog → finishCommand (JSON or tips)
```

`init` path:

```txt
commands/init/run.ts → runInit (core) → write expgov.config.ts
```

## Before coding a slice

- [ ] Scoped in `active-phase.md`
- [ ] Not already in `maintainer/shipped/README.md`
- [ ] Core logic has no prompts/chalk in command paths
- [ ] Tier/export changes include `expgov validate` pass
- [ ] Update `maintainer/shipped/README.md` on ship

## Local dev

```bash
pnpm install
pnpm build
pnpm cli:dev validate
# or after link:
expgov validate
```

Dogfood config: `./expgov.config.ts` at repo root.
