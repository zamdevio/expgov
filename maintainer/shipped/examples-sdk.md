# SDK example workspace (Phase I)

Teaching fixture for external SDK authors — not expgov dogfood config.

**Live tree:** [`examples/sdk/`](../../examples/sdk/) · **User entry:** [`docs/install.md`](../../docs/install.md)

---

## I1 — skeleton + README (shipped) · `b8ccbdb`

- [x] `examples/sdk/` — `@example/sdk-demo` barrel with stable / internal / advanced namespace pattern
- [x] `expgov.config.ts` — minimal tiers (`exact`, `prefix`, `@sdkTier`)
- [x] `package.json` — `"@expgov/cli": "link:../.."` (avoids `packages/cli` workspace name clash)
- [x] `README.md` — init → inventory → validate workflow
- [x] `pnpm-workspace.yaml` — `examples/*` membership

**Exit:** `pnpm build && expgov -C examples/sdk validate` passes.

---

## I3 — CI smoke (shipped) · `b8ccbdb`

- [x] `ci.yml` — `node dist/cli.js -C examples/sdk validate` after dogfood validate

---

## Optional (not scheduled)

- **I2** — `examples/sdk-monorepo/` workspace variant

---

## External dogfood — vercel/ai `packages/ai`

Not checked into expgov. Maintainer-local config pattern for real multi-entry SDK (`ai`, `ai/internal`, `ai/test`).

| Item | Value |
|------|--------|
| Repo | [vercel/ai](https://github.com/vercel/ai) clone at `~/ai` |
| Config | `~/ai/expgov.config.ts` |
| Phase | [`multibarrel.md`](../phases/multibarrel.md) MB1–MB4 |
| Scratch | [`maintainer/temp/vercel-ai-dogfood.md`](../temp/vercel-ai-dogfood.md) |

**Gate commands:**

```bash
cd ~/ai && expgov inventory && expgov validate
```

Expect tsconfig parity noise until MB4 (monorepo root has no `paths`). Tier prefixes cover gateway/provider-utils re-exports and `ai/test` Mock* helpers.

Engineering map: [`systems/config.md`](../systems/config.md).
