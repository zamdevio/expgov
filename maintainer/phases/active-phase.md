# Active sprint

**Shipped receipts:** [`../shipped/README.md`](../shipped/README.md)

**Roadmap:** [`commands.md`](./commands.md) · **Principles:** [`../systems/principles.md`](../systems/principles.md)

**Engineering maps:** [`../systems/README.md`](../systems/README.md)

---

## Focus now — v1.0.0 stable release

**Checklist:** [`release.md`](./release.md)

Ship **npm** (`@expgov/cli` + `@expgov/core`), **docs site** (`expgov.pages.dev`), and **GitHub** public repo — not Phase C3 or backlog features unless publish-blocking.

| # | Slice | Status | Goal |
|---|-------|--------|------|
| 1 | **R1** — Publish metadata | Shipped | LICENSE, READMEs, `publishConfig`, `prepack`, dual npm packages |
| 2 | **R2** — Docs site | Shipped | VitePress `apps/docs/`, sync from `docs/`, Cloudflare Pages |
| 3 | **R3** — Docs audit | Shipped | `docs/*` + `maintainer/*` match shipped CLI |
| 4 | **R4** — Tag & publish | In progress | `v1.0.0` tag, npm publish ×2 (registry URL + install hints) |

**Publish model (match nodehunter):**

| Package | npm name | Role |
|---------|----------|------|
| Root | `@expgov/cli` | CLI binary + `@expgov/cli/core` subpath (self-contained build) |
| `packages/core` | `@expgov/core` | Standalone SDK for programmatic imports |

---

## Paused — Phase C (Graph 2.0)

**Doc:** [`graph-2.md`](./graph-2.md) · **Shipped (C1–C2):** [`../shipped/graph.md`](../shipped/graph.md)

Resume **C3** graph filters after v1.0.0 ships.

| # | Slice | Status |
|---|-------|--------|
| C1–C2 | Namespace-first + analytics | **Shipped** |
| C3 | `--namespace`, `--module`, `--category`, `--subpath` | Paused |
| C4 | Graph modes | Brainstorm |

---

## Program backlog (after release)

| # | Slice | Goal | Doc |
|---|-------|------|-----|
| 1 | Phase **C3** — Graph filters | Filtered graph view | [`graph-2.md`](./graph-2.md) |
| 2 | Phase **D** — API chain | Execution introspection / tier rule trace | [`../api-chain.md`](../api-chain.md) |
| 3 | Phase **F** — CLI output audit | UX audit receipt; close gaps | [`cli-output-audit.md`](./cli-output-audit.md) |
| 4 | Phase **G** — Long-term observability | Metrics over cached snapshots | [`../systems/observability.md`](../systems/observability.md) |
| 5 | **Severity** | Policy `severity` rule, graded `issues[]` | [`severity.md`](./severity.md) |
| 6 | **Suggest** | Suggestion engine, full fixes, filters | [`suggest.md`](./suggest.md) |
| 7 | **Fix** | `fix tags`, `fix config` | [`fix.md`](./fix.md) |
| 8 | **Config** | `config show` / `export` / `convert` | [`config.md`](./config.md) |
| 9 | **Issues** | `issues/` registry, doc links | [`issues.md`](./issues.md) |
| 10 | **Multibarrel** | Multi-entry API surface, workspace | [`multibarrel.md`](./multibarrel.md) |

---

## Deferred (unscheduled)

| Slice | Why deferred |
|-------|----------------|
| Auto-fix PR bot | Blocked on [`fix.md`](./fix.md) |
| `fix subpath` / barrel moves | Postponed in [`fix.md`](./fix.md) |
| JSON config | [`config.md`](./config.md) — TS stays primary |
| Remote / shared cache | [`../systems/cache.md`](../systems/cache.md) |
| Source profiles (H-src) | [`sourceProfiles.md`](./sourceProfiles.md) |
| Multibarrel / workspace | [`multibarrel.md`](./multibarrel.md) — MB4 |
| SDK monorepo example (I2) | [`../shipped/examples-sdk.md`](../shipped/examples-sdk.md) |

---

## Guiding rules

- **Config is TypeScript first:** `expgov.config.ts` via jiti.
- **Core purity:** `packages/core` never imports CLI, prompts, or chalk.
- **CLI is thin:** Commander host, banners, help colorization, `init` prompts only.
- **Tier sources:** `@sdkTier` JSDoc + nested config buckets — [`systems/tiers.md`](../systems/tiers.md).

---

## Where detail lives

| Need | Doc |
|------|-----|
| Release checklist | [`release.md`](./release.md) |
| What shipped, when | [`../shipped/README.md`](../shipped/README.md) |
| Timeline (Phase B) | [`../shipped/timeline.md`](../shipped/timeline.md) |
| Graph (Phase C partial) | [`../shipped/graph.md`](../shipped/graph.md) |
| Command contracts | [`commands.md`](./commands.md) |
| Tiers, cache, CLI, config | [`../systems/`](../systems/README.md) |
| Agent layout + import rules | [`agents/architecture.md`](../agents/architecture.md) |
