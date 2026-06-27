# Architecture phases (blueprint)

**Status:** Active — `doctor` + cache rename shipped; `sync-tiers` next.

**Shipped history:** [`shipped-slices.md`](./shipped-slices.md) · **Commands:** [`commands.md`](./commands.md)

---

## Mission

Portable export-governance CLI for TypeScript SDK barrels: inventory, diff, validate, trend, timeline, graph.

**Immediate focus:** `sync-tiers` dry-run helper.

---

## Core principles

| Principle | Rule |
|-----------|------|
| Config as code | `expgov.config.ts` only — typed via `defineConfig` |
| Core purity | Engine in `packages/core` — no TTY/chalk/prompts |
| Thin CLI | `packages/cli` — Commander, banners, init prompts |
| Tier explicitness | `@sdkTier` or config bucket — `unclassified` fails validate |
| Cache is local | `.expgov/cache/` per SHA — gitignored, never committed |

---

## Package map

```txt
packages/core/src/
├── commands/       # runExports* command hosts
├── config/         # load, types, tiers resolver
├── context/        # ProjectContext
├── cache/          # snapshot warm/read
├── inventory/      # barrel parse, tiers classifier
├── init/           # scaffold detection + template
├── git/            # refs, gitignore tip
├── runtime/        # RunOptions, emitter, policy, timer
├── logger/         # human report formatters
└── help/           # long-form usage text

packages/cli/src/
├── main.ts         # Commander program
├── commands/init/  # ensureConfig + prompts
└── utils/          # help colorization, banners
```

**Import rule:** CLI → core only. See [`agents/architecture.md`](../agents/architecture.md).

---

## Tier resolution (shipped)

```txt
@sdkTier JSDoc  →  tiers.internal  →  tiers.advanced  →  tiers.stable  →  unclassified
```

Detail: [`systems/tiers.md`](../systems/tiers.md).

---

## Out of scope (deferred)

- JSON config files
- Remote cache / shared artifact store
- Auto-fix PR bot for tier allowlists
- `sync-tiers` command (planned)
