# SDK example workspace (Phase I)

Teaching fixture for external SDK authors — not expgov dogfood config.

**Live tree:** [`examples/sdk/`](../../examples/sdk/) · **User entry:** [`docs/install.md`](../../docs/install.md)

---

## I1 — skeleton + README (shipped) · `b8ccbdb`

- [x] `examples/sdk/` — `@example/sdk-demo` barrel with stable / internal / advanced namespace pattern
- [x] `expgov.config.ts` — minimal tiers (`exact`, `prefix`, `@sdkTier`)
- [x] `package.json` — `"expgov": "link:../.."` (avoids `packages/cli` name clash)
- [x] `README.md` — init → inventory → validate workflow
- [x] `pnpm-workspace.yaml` — `examples/*` membership

**Exit:** `pnpm build && expgov -C examples/sdk validate` passes.

---

## I3 — CI smoke (shipped) · `b8ccbdb`

- [x] `ci.yml` — `node dist/cli.js -C examples/sdk validate` after dogfood validate

---

## Optional (not scheduled)

- **I2** — `examples/sdk-monorepo/` workspace variant

Engineering map: [`systems/config.md`](../systems/config.md).
