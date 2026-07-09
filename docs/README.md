# Maintainer docs index

User-facing source lives in **`docs/`** (synced to `apps/docs/content/`). The published home page is **`apps/docs/index.md`**.

## Structure

| Area | Pages |
|------|--------|
| Start | `install.md`, `config.md`, `governance.md` |
| Guides | `guides/workflows.md` |
| SDK | `sdk/README.md` |
| CLI | `cli/README.md`, `cli/flags.md`, `cli/json.md` |
| Commands | `commands/README.md` + one page per verb |

## Dev commands

```bash
pnpm docs:sync          # docs/ → apps/docs/content/
pnpm docs:sync:verify   # idempotent sync gate
pnpm docs:dev           # watch + VitePress :8284
pnpm docs:build
pnpm docs:deploy        # Cloudflare Pages
```

Update **`apps/docs/.vitepress/sidebar.ts`** when adding or renaming pages.
