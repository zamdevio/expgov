# Release automation

**Audience:** Maintainers bumping versions or publishing `@expgov/cli` + `@expgov/core`.

**Shipped receipt:** [`../shipped/release.md`](../shipped/release.md) · **Phase plan:** [`../phases/releases.md`](../phases/releases.md)

---

## Release line

| Path | npm / role |
|------|------------|
| `package.json` | `@expgov/cli` (published root) |
| `packages/core/package.json` | `@expgov/core` (published SDK) |
| `packages/cli/package.json` | `expgov` private workspace — version-aligned, not published |

Source of truth for `versions:sync`: **root** `version`.

---

## Commands

```bash
pnpm versions:verify              # fail if root / core / cli workspace differ
pnpm versions:sync                # copy root → core + cli workspace
pnpm versions:up -- 1.1.0         # set all three to 1.1.0
pnpm versions:up -- 1.1.0 --force # allow downgrade / far jumps
```

Implementation: `scripts/release/sync.ts`.

CI runs `pnpm versions:verify` on every push/PR (`ci.yml`).

---

## Tag → dual publish

Workflow: `.github/workflows/release.yml`

1. Push annotated tag `vX.Y.Z` (must match all three package.json versions)
2. **verify** — `versions:verify`, typecheck, `EXPGOV_PUBLISH=1` build, test, dogfood + example validate, tag↔version gate, `npm pack` both packages
3. **publish-cli** / **publish-core** (parallel) — OIDC Trusted Publishing; skip if `name@version` already on npm; prerelease (`-` in version) → `--tag beta`

No `NPM_TOKEN`. Trusted Publisher on npm for both packages → GitHub `zamdevio/expgov` / workflow `release.yml` (already configured).

---

## Local recipe (next ship = 1.1.0)

```bash
pnpm versions:verify
pnpm versions:up -- 1.1.0
# finish breaking work (surface split, command entrypoint rename, …)
pnpm build && pnpm test && node dist/cli.js validate
git add package.json packages/core/package.json packages/cli/package.json
git commit -m "chore(release): bump to 1.1.0"
git tag -a v1.1.0 -m "v1.1.0"
git push origin main
git push origin v1.1.0
```

Watch the Release workflow; confirm both packages on npm.

User-facing history: root [`CHANGELOG.md`](../../CHANGELOG.md) (no releases portal — keep that file updated on each ship).
