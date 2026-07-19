# Phase — Automated releases (version sync + tag publish)

**Status:** **Shipped** (REL1–REL3) — see [`../systems/release.md`](../systems/release.md) · receipt [`../shipped/release.md`](../shipped/release.md)

**Reference:** local `~/Tools/i18nprune` — `scripts/release/sync.ts` · `.github/workflows/release.yml` · root `versions:*` scripts  
**Companion:** [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (configured for `@expgov/cli` + `@expgov/core`)

---

---

## Mission

Stop hand-editing three `package.json` versions and hand-running `npm publish`. Match i18nprune’s proven release line:

1. **Local version commands** — bump / sync / verify one release line across packages.
2. **Tag-triggered CI** — push `v*` → verify → pack → publish both npm packages via OIDC (no `NPM_TOKEN`).

Does **not** replace the existing CLI verb `expgov version` (runtime “what am I running?”). This phase is **maintainer release tooling**.

---

## Current state (gap)

| Piece | Today | Target |
|-------|-------|--------|
| Version bump | Manual edit root + `packages/core` (+ workspace `packages/cli`) | `pnpm versions:up -- 1.0.2` |
| Alignment check | None in CI/scripts | `pnpm versions:verify` (CI + pre-tag) |
| Publish | Manual / ad-hoc after tag | `.github/workflows/release.yml` on `v*` |
| Auth | Operator npm login | npm Trusted Publishing (OIDC) |
| Retry safety | Easy to double-publish | Skip if `name@version` already on registry |

Publish model (unchanged): root **`@expgov/cli`** + **`@expgov/core`** — see [`../shipped/release.md`](../shipped/release.md). Workspace `packages/cli` (`name: expgov`, `private: true`) stays version-aligned but is **not** published.

---

## Delivery slices

| ID | Slice | Outcome |
|----|-------|---------|
| **REL1** | `versions:*` + `scripts/release/sync.ts` | Align / bump / verify release line |
| **REL2** | `.github/workflows/release.yml` | Tag `v*` → verify → pack → dual publish |
| **REL3** | Maintainer docs | Systems map + ship checklist; fold into `shipped/release.md` when live |

Suggested order: **REL1 → REL2 → REL3**. REL1 can ship alone (useful immediately for the next patch).

---

## REL1 — Version management commands

**Adapt from:** `~/Tools/i18nprune/scripts/release/sync.ts`

### Packages on the release line

| Path | npm / role | Label |
|------|------------|-------|
| `package.json` | `@expgov/cli` (publishable root) | root |
| `packages/core/package.json` | `@expgov/core` (publishable SDK) | core |
| `packages/cli/package.json` | `expgov` (private workspace sources) | cli workspace |

Source of truth for `--sync`: **root** `version`.

### pnpm scripts (root `package.json`)

```json
"versions:up": "tsx --tsconfig tsconfig.json scripts/release/sync.ts --up",
"versions:sync": "tsx --tsconfig tsconfig.json scripts/release/sync.ts --sync",
"versions:verify": "tsx --tsconfig tsconfig.json scripts/release/sync.ts --verify"
```

### CLI surface (script flags)

| Command | Behavior |
|---------|----------|
| `pnpm versions:verify` | Fail if root / core / cli workspace versions differ |
| `pnpm versions:sync` | Copy root → core + cli workspace |
| `pnpm versions:up -- <semver>` | Set all three to `<semver>` |
| `--force` | Allow downgrades / far major\|minor jumps (warn first) |

Risk gates (same spirit as i18nprune): block downgrade, major jump > 1, minor jump > 10 unless `--force`. Print recommended patch/minor/major from current line max.

### Acceptance (REL1)

- [x] `versions:verify` exits 0 when aligned; exits 1 with fix hint when drifted
- [x] `versions:up -- <semver>` updates all three `package.json` files
- [x] `versions:sync` copies root → others
- [x] `--force` required for risky bumps; help text documents flags
- [x] Script lives under `scripts/` (chalk OK); not imported into `packages/core`

---

## REL2 — `release.yml` (auto dual publish)

**Adapt from:** `~/Tools/i18nprune/.github/workflows/release.yml`

### Trigger

```yaml
on:
  push:
    tags:
      - 'v*'
```

### Job DAG

```txt
verify  →  publish-cli   (@expgov/cli tarball)
        →  publish-core  (@expgov/core tarball)
```

Publish jobs depend only on `verify` (not each other) so a partial failure can retry without republishing a version that already succeeded. Root CLI does not need `@expgov/core` on npm at install time for the bundled CLI (same parallel-publish rationale as i18nprune).

### `verify` steps (expgov-shaped)

1. Checkout (`fetch-depth: 0` if any step needs full git history)
2. pnpm + Node 22 + `pnpm install --frozen-lockfile`
3. `pnpm versions:verify`
4. Typecheck / test / build (`EXPGOV_PUBLISH=1` where applicable)
5. `expgov validate` (dogfood)
6. Tag ↔ version gate: `v1.0.2` requires `1.0.2` in root + core (+ cli workspace)
7. `npm pack` both packages → upload artifacts

### Publish steps (each package)

1. `id-token: write` + npm Trusted Publishing (configure on npm for `zamdevio/expgov` → `release.yml`)
2. Download artifact tarball
3. Skip if `npm view name@version` already exists (safe retry)
4. Dist-tag: `latest`, or `beta` when version contains `-`
5. `npm publish <tarball> --access public --tag <dist-tag>`

### Operator checklist (first time)

1. npm → package settings → Trusted Publisher → GitHub Actions (`zamdevio` / `expgov` / `release.yml`) for **both** `@expgov/cli` and `@expgov/core`
2. Ship REL1 on `main`
3. `pnpm versions:up -- x.y.z` → commit → `git tag vX.Y.Z` → `git push origin vX.Y.Z`
4. Watch Release workflow; confirm both packages on npm

### Acceptance (REL2)

- [x] Pushing `v*` runs verify + dual publish (workflow checked in)
- [x] Mismatched tag vs package versions fails verify
- [x] Re-running a publish job after one package already published skips that package
- [x] No `NPM_TOKEN` / `NODE_AUTH_TOKEN` in repo secrets for this path
- [x] Prerelease versions (`1.1.0-beta.1`) publish under `beta` tag
- [x] Trusted Publishing configured on npm for both packages

---

## REL3 — Docs

| Audience | Path | Content |
|----------|------|---------|
| Maintainer map | `maintainer/systems/` (new `release.md` or section under tooling) | `versions:*`, tag flow, OIDC setup |
| Shipped receipt | `maintainer/shipped/release.md` | Point automation at REL1/REL2 when shipped; keep R1–R4 history |
| Public (optional) | `docs/` only if users need “how we release” — default keep maintainer-only |

---

## Local release recipe (after REL1+REL2)

```bash
pnpm versions:verify
pnpm versions:up -- 1.0.2          # or versions:sync after editing root
git add package.json packages/core/package.json packages/cli/package.json
git commit -m "chore(release): bump to 1.0.2"
git tag v1.0.2
git push origin main
git push origin v1.0.2             # triggers release.yml
```

---

## Non-goals

- Releases portal / changelog site (`apps/releases` in i18nprune) — separate product surface
- Changing npm package names or dual-publish model
- Replacing `expgov version` CLI output
- Changesets / semantic-release bots (stick to explicit `versions:up` + tag)
- Auto-creating GitHub Release notes (optional follow-up; i18nprune’s `releases:notes` is out of scope here)

---

## Scheduling note

Independent of D2 / AG4. Prefer finishing `validate --since` first if CI consumers are waiting; pull REL1 forward whenever the next patch bump is imminent so versions cannot drift again.
