# expgov

Export-governance CLI for TypeScript SDK barrels — inventory, diff, validate, trend, timeline, and graph.

## Docs

| Topic | Guide |
|-------|-------|
| Install & run | [install.md](./install.md) |
| `expgov.config.ts` | [config.md](./config.md) |
| Commands | [commands.md](./commands.md) |
| `--json` output | [json.md](./json.md) |

## Quick start

```bash
pnpm add -D expgov
pnpm exec expgov init
pnpm exec expgov validate
```

Config is TypeScript only: `expgov.config.ts` at the project root (or git root). See [config.md](./config.md).
