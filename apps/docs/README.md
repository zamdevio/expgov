# expgov docs site (`apps/docs`)

VitePress app for user-facing documentation. **Source of truth:** root `docs/`; synced copy: `apps/docs/content/` (gitignored — run `pnpm docs:sync`).

## Maintainer note: sidebar

Navigation is **manual** in `apps/docs/.vitepress/sidebar.ts`. When you add, rename, or remove pages under `docs/`, update the sidebar in the same change.

## Theme

Extensions live in `.vitepress/theme/` (`custom.css` + `index.ts`). Palette: slate surfaces, cyan brand (CLI accent), amber accent glow.

- Frosted nav bars, desktop sidebar edge, thin scrollbars
- Fixed ambient background (grid + dual glow + noise) on all pages via `layout-top`
- Logo / favicon: `.vitepress/public/expgov.svg`

## Scripts

From repo root:

- `pnpm docs:sync` — `docs/` → `apps/docs/content/`
- `pnpm docs:sync:verify` — idempotent sync gate (CI)
- `pnpm docs:dev` — sync watch + VitePress dev (port **8284**)
- `pnpm docs:build` — production build
- `pnpm docs:deploy` — build + deploy to Cloudflare Pages (`expgov.pages.dev`)

Custom home page: `apps/docs/index.md` (YAML `layout: home`) is copied to `content/index.md` on sync — not sourced from `docs/README.md`.

## Content map (source: `docs/`)

| Area | Pages |
|------|--------|
| Start | `install.md`, `config.md`, `governance.md` |
| Guides | `guides/workflows.md` |
| SDK | `sdk/README.md` |
| CLI | `cli/README.md`, `cli/flags.md`, `cli/json.md` |
| Commands | `commands/README.md` + one page per verb |
