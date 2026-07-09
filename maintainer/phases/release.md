# Release checklist — v0.0.1

First public release: **GitHub** + **npm** (dual packages) + **docs site**.

Reference: [nodehunter](https://github.com/zamdevio/nodehunter) publish model (`nodehunter` + `@nodehunter/core`).

---

## Publish model

| Package | npm name | Built from | Notes |
|---------|----------|------------|-------|
| Root | `@expgov/cli` | `tsup` → `dist/cli.js` + `dist/core.js` | Self-contained CLI; no runtime dep on `@expgov/core` |
| `packages/core` | `@expgov/core` | `tsc` → `packages/core/dist/` | Standalone SDK for programmatic imports |

Both packages expose config types. CLI consumers: `import from '@expgov/cli/core'`. SDK consumers: `import from '@expgov/core'`.

### npm: why not unscoped `expgov`?

npm rejected **`expgov`** (unscoped) as too similar to **`expo`**. The **`@expgov`** org scope is unaffected — publish CLI as **`@expgov/cli`**; binary name stays `expgov`.

---

## R1 — Publish metadata

- [x] `LICENSE` (MIT)
- [x] Root `README.md`
- [x] `packages/core/README.md`
- [x] Root `package.json` — `publishConfig`, `prepack`, `repository`, `homepage`, `keywords`; remove `private`
- [x] `packages/core/package.json` — `private: false`, `publishConfig`, `prepack`, `repository.directory`
- [x] `EXPGOV_PUBLISH=1` omits source maps in root `tsup` build
- [x] Verify `pnpm pack` tarballs for both packages (dry run before publish)

---

## R2 — Docs site

- [x] `apps/docs/` VitePress scaffold
- [x] `pnpm docs:sync` — `docs/` → `apps/docs/content/`
- [x] `pnpm docs:sync:verify` — idempotent sync gate
- [x] `pnpm docs:build` — production build
- [x] `pnpm docs:deploy` — Cloudflare Pages (`expgov.pages.dev`)

---

## R3 — Docs audit

**Public `docs/`:**

- [x] Structured IA — `guides/`, `cli/`, `commands/`, `sdk/`, `governance.md`
- [x] `description` frontmatter on every published page
- [x] Branded VitePress theme + logo (nodehunter-style slate/cyan/amber)

**Maintainer `maintainer/`:**

- [x] `phases/active-phase.md` — release sprint
- [x] `agents/architecture.md` — dual publish documented

---

## R4 — Gate & publish

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
expgov validate
node dist/cli.js -C examples/sdk validate
pnpm docs:sync:verify
pnpm docs:build
```

**Publish (maintainer action):**

```bash
# from packages/core
pnpm publish --access public

# from repo root
pnpm publish --access public   # @expgov/cli

git tag v0.0.1
git push origin v0.0.1
```

---

## Explicitly out of scope for v0.0.1

- C3 graph filters
- Phase D / multibarrel / fix / config / issues backlog
- New features beyond credible first release

---

## Pre-v1 contract

CLI argv, `--json` envelope, and exit codes are user-facing. Internal APIs may still change pre-v1.
