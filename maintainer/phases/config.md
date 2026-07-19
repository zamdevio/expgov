# Phase — Config formats & introspection

**Status:** Deferred — after Severity / Suggest / Fix backlog (or parallel with Phase H-src if a repo needs JSON config).

**Companion:** [`../systems/config.md`](../systems/config.md) · [`../systems/principles.md`](../systems/principles.md) · [`sourceProfiles.md`](./sourceProfiles.md) (barrel `core.sourceProfile` only) · [`commands.md`](./commands.md)

---

## Mission

1. **Single config schema layer** — `parseExpgovConfig(unknown)` is the only validator; `.ts` and `.json` loaders are dumb adapters (no drift).
2. **`expgov config`** — read-only introspection of resolved project config + SDK barrel context.
3. **`expgov config export`** — serialize resolved config to `expgov.config.json` (or stdout).
4. **`expgov config convert`** — transform between supported **config file** extensions via load → parse → emit (ts ↔ json first; more as loaders ship).
5. **Later:** load `expgov.config.json` (and other extensions) via the same parse layer.

`expgov.config.ts` stays the **primary** authoring format for dogfood and docs.

---

## Command design

### Why `config`, not top-level `export`

In expgov, **export** already means npm / barrel **export surface** (inventory, validate, tiers). A bare `expgov export` reads like “dump the SDK exports” not “dump config.”

**Recommended:**

```txt
expgov config              →  same as config show (default action)
expgov config show         →  human metadata report
expgov config export       →  write / print expgov.config.json
expgov config convert      →  transform between supported config formats
```

**Scope boundary:** `config convert` is for **`expgov.config.*` project config** only — not SDK barrel files (`index.ts` → `index.mjs`). Barrel / module format changes live in [`sourceProfiles.md`](./sourceProfiles.md) (H-src), not here.

**Optional alias (one PR, if desired):** `expgov export` → delegates to `config export` only. Document both; implement alias after `config export` ships.

**Do not add (v1):**

| Idea | Why skip |
|------|----------|
| `config validate` | Duplicates `expgov validate` |
| `config edit` | Use editor + `fix config` later |
| `config init` | `expgov init` owns scaffold |
| Top-level `export` without `config` namespace | Collides with domain language |

### `expgov config show` (default)

Structured, read-only report — **not** a dump of raw file text. Answers: “what is expgov using right now?”

**Human sections (example):**

```txt
       Config
       · file     expgov.config.ts (typescript loader)
       · package  @expgov/core
       · repo     /path/to/repo

       Core
       · barrel   packages/core/src/index.ts
       · subpaths 2 published (./internal, ./experimental)

       Tiers
       · stable   policy public · exact 12 · prefix 3
       · internal policy maintainer · prefix 2
       · advanced policy experimental · prefix 1

       Tooling
       · tsconfig tsconfig.json
       · cache    .expgov/cache (enabled)
       · git tags v*
```

**JSON (`--json`):** `kind: 'config'`, `data.resolved` — normalized `ExpgovConfig` subset + `meta` (loader id, config path, tier catalog summary counts). No secrets.

**Flags:** `-v` expands exact/prefix lists; `-j` envelope.

### `expgov config export`

Serialize **resolved** config after `parseExpgovConfig` — not a pretty-print of the `.ts` source.

| Flag | Effect |
|------|--------|
| `-o, --out <path>` | Write file (default `expgov.config.json` in repo root) |
| `--stdout` | Print JSON to stdout (pipes / CI) |
| `-j, --json` | Full CLI envelope; `data` includes export path or byte count |
| `--pretty` | Indented JSON (default on file; `--no-pretty` for compact) |
| `--dry-run` | Print to stdout without writing (alias-friendly with `--stdout`) |

**Round-trip contract:** load `.ts` → `config export` → load `.json` → `buildProjectContext` equivalent → same `validate` outcome.

### `expgov config convert`

Transform a config file from one **supported extension** to another. Pipeline is always:

```txt
source loader  →  parseExpgovConfig  →  target emitter
```

No second schema — same anti-drift rule as export/load.

**Invocation:**

```bash
expgov config convert expgov.config.ts expgov.config.json
expgov config convert --from json --to ts -i expgov.config.json -o expgov.config.ts
expgov config convert --from ts --to json --stdout
```

| Flag | Effect |
|------|--------|
| `-i, --input <path>` | Source file (default: discovered config) |
| `-o, --out <path>` | Destination file (required unless `--stdout`) |
| `--from <ext>` | Source format: `ts`, `json`, … (inferred from `-i` when omitted) |
| `--to <ext>` | Target format (inferred from `-o` when omitted) |
| `--stdout` | Emit to stdout (implies `--to json` or raw TS text) |
| `--dry-run` | Print emitted content without writing |
| `-y, --yes` | Overwrite existing `-o` without prompt |
| `-j, --json` | Envelope with `data.from`, `data.to`, `data.path` |

**Supported formats (grow with loaders — one emitter per loader family):**

| Extension | Load (CF*) | Emit (convert) | Notes |
|-----------|------------|----------------|-------|
| `.ts` | CF1 (jiti) | CF6 codegen | `defineConfig({ … })` + `satisfies ExpgovConfig` |
| `.json` | CF4 | CF3 serialize | Canonical data interchange |
| `.mts` | CF7 (deferred) | CF6 variant | ESM TypeScript config — same AST emit as `.ts` |
| `.mjs` / `.cjs` | CF7 (deferred) | CF7 emit | `export default defineConfig(…)` — no types in file |
| `.js` | CF7 (deferred) | CF7 emit | jiti-compatible JS config |

**v1 convert pairs:** `ts → json`, `json → ts` (after CF1 + CF4).

**Later pairs (each needs loader + emitter in same PR):** `ts ↔ mts`, `json ↔ mjs`, etc. Matrix is **explicit** — unsupported pair fails with list of allowed `--from/--to` values ([`issues.md`](./issues.md) `expgov.config.convert_unsupported`).

**Lossy transforms (document in user docs):**

| Direction | Preserved | Lost |
|-----------|-----------|------|
| `ts → json` | Resolved values | Comments, `satisfies`, import style |
| `json → ts` | Schema-valid config | JSON key order irrelevant; regen uses stable serializer ordering |
| `ts → mts` | Logic | Mostly path/extension; may normalize import specifiers |
| Any → `mjs`/`cjs` | Values | TypeScript types, `satisfies` |

**Relationship to `export`:** `config export` is `convert --from <current> --to json` with repo-default paths. Keep both — `export` is the common shortcut; `convert` is the general tool.

**Not `fix`:** convert writes a **new or replaced config file**; it does not patch tier snippets in place ([`fix.md`](./fix.md) `fix config`).

---

## Schema layer (anti-drift)

**Canonical type:** `ExpgovConfig` — `types/config/expgov.ts` (unchanged public contract).

**New entrypoint:** `packages/core/src/config/parse.ts`

```ts
export function parseExpgovConfig(input: unknown, meta?: { sourcePath?: string }): ExpgovConfig;
```

- Structural validation: `packageName`, `core`, tiers, policies, cache, git.
- Call existing resolvers (`resolveTierCatalog`, `resolveTierPolicies`) and surface errors as parse failures.
- **Every loader** ends here — no loader-specific validation.

**Loaders:** `packages/core/src/config/loaders/`

| Loader | Extension | Flow |
|--------|-----------|------|
| `typescript.ts` | `.ts` | jiti → `default` → `parseExpgovConfig` |
| `json.ts` | `.json` | `JSON.parse` → `parseExpgovConfig` |
| `moduleTs.ts` | `.mts` | CF7 — jiti ESM TS |
| `moduleJs.ts` | `.mjs`, `.cjs`, `.js` | CF7 — jiti / dynamic import |

**Emitters (convert):** `packages/core/src/config/emitters/`

| Emitter | Extension | Output |
|---------|-----------|--------|
| `json.ts` | `.json` | `serializeExpgovConfig` |
| `typescript.ts` | `.ts`, `.mts` | `formatConfigModule` — reuse `buildInitConfigTemplate` patterns |
| `javascript.ts` | `.mjs`, `.cjs`, `.js` | `export default defineConfig(…)` (CF7) |

**Orchestration:** refactor `config/load.ts` — discover by extension → loader → parse → merge CLI overrides.

### Discovery order (when `--config` omitted)

1. `expgov.config.ts` (wins — config-as-code)
2. `expgov.config.json` (after CF3)
3. Never merge two files; `doctor` warns if both exist.

Today: `assertTypeScriptConfigPath` in `load.ts` rejects non-`.ts` — removed when CF3 ships.

---

## Slices (one PR each)

| # | Slice | Goal |
|---|-------|------|
| **CF1** | `parseExpgovConfig` | Single validator; jiti path refactored through it |
| **CF2** | `config show` | `runConfigShow`; human + `--json` metadata report |
| **CF3** | `config export` | `serializeExpgovConfig`; `-o` / `--stdout` |
| **CF4** | JSON loader | `loaders/json.ts`; discovery; round-trip tests |
| **CF5** | Doctor + docs | Loaded file path, duplicate-config warning; `docs/config.md` + principles |
| **CF6** | `config convert` | `ts ↔ json` via load → parse → emit; `--from` / `--to` |
| **CF7** | Extra config loaders + emit | `.mts`, `.mjs`, `.cjs`, `.js` config files (one PR per family) |

**Optional CF8:** `expgov export` alias → `config export`.

**Phase v1 complete when:** CF1–CF3 shipped (`show` + `export` on `.ts` config).

**Phase v2 complete when:** CF4–CF6 shipped (JSON load + `ts ↔ json` convert).

**Phase v3 complete when:** CF7 pairs documented in convert matrix.

---

## CF1 — `parseExpgovConfig`

**Exit:**

- [ ] Dogfood `expgov.config.ts` loads identically to today.
- [ ] Invalid tier/policy shapes fail with actionable messages.
- [ ] Tests: fixture objects valid/invalid.

---

## CF2 — `config show`

**Core:** `runConfigShow` — uses `getProjectContext()` after load.

**Exit:**

- [ ] `expgov config` and `expgov config show` equivalent.
- [ ] Human sections: Config / Core / Tiers / Tooling (see above).
- [ ] `--json` `kind: 'config'`, no write.

---

## CF3 — `config export`

**Core:** `runConfigExport` + `config/serialize.ts` (stable key ordering).

**Exit:**

- [ ] Default writes `expgov.config.json`.
- [ ] `config export --stdout` valid JSON.
- [ ] Gate: `pnpm build`, `typecheck`, `test`, `expgov validate`.

---

## CF4 — JSON load

**Exit:**

- [ ] `--config expgov.config.json` works.
- [ ] Auto-discovery picks `.ts` over `.json` when both exist.
- [ ] `validate` identical for equivalent TS vs exported JSON.

---

## CF5 — Doctor + docs

- `doctor` reports: config path, loader kind, warn if `.ts` + `.json` both present.
- Move JSON config off principles “never” list → “load supported”.
- User `docs/config.md`: show/export/convert workflows, parse layer note.

---

## CF6 — `config convert`

**Core:** `runConfigConvert` — pick loader by `--from` / input ext → `parseExpgovConfig` → pick emitter by `--to` / output ext.

**Codegen (`json → ts`):** `config/emitters/typescript.ts` — extend `buildInitConfigTemplate` / `formatConfigModule`; not a text copy of original TS.

**Exit:**

- [ ] `config convert expgov.config.ts expgov.config.json` equivalent to export for same input.
- [ ] `config convert -i expgov.config.json -o expgov.config.ts --dry-run` prints valid TS.
- [ ] Round-trip: convert ts→json→ts → `parseExpgovConfig` equivalent (values; comments not compared).
- [ ] Unsupported `--from`/`--to` → clear error + allowed pairs list.
- [ ] Gate: `pnpm build`, `typecheck`, `test`, `expgov validate` after json→ts replace (manual dogfood).

---

## CF7 — Additional config extensions

Add loader + emitter together per extension family (`.mts`, `.mjs`/`.cjs`/`.js`). Extend convert matrix; extend discovery order in `load.ts`.

**Exit:**

- [ ] Each new ext: load test + convert out + convert in (where symmetric).
- [ ] Document lossy fields per emitter in `docs/config.md`.

---

## Relationship to other phases

| Phase | Touch |
|-------|--------|
| [`sourceProfiles.md`](./sourceProfiles.md) H2 | Optional `core.sourceProfile` in config — documented in user `docs/config.md`, not this phase |
| [`fix.md`](./fix.md) F4 | `fix config` merges snippets — uses same `parseExpgovConfig` after edit |
| [`issues.md`](./issues.md) | `expgov.config.*` issue codes on parse/load failures |

---

## Non-goals

- JSON replaces TS for dogfood authoring
- YAML config (until parse + loader pattern proven — new loader only)
- **Barrel** `index.ts` ↔ `index.mjs` conversion — [`sourceProfiles.md`](./sourceProfiles.md), not `config convert`
- Lossless `ts → json → ts` comment preservation (document as lossy)
- JSON Schema as source of truth (types + parse are truth)

---

## Files (expected touch)

| Area | Paths |
|------|-------|
| Parse | `config/parse.ts`, `config/serialize.ts` |
| Loaders | `config/loaders/typescript.ts`, `json.ts`; refactor `load.ts` |
| Commands | `commands/configShow.ts`, `commands/configExport.ts`, `commands/configConvert.ts` |
| Emitters | `config/emitters/typescript.ts`, `json.ts`, `javascript.ts` (CF7) |
| CLI | `packages/cli/bin/cli.ts` — `config` subcommand group |
| Reports | `logger/reports/config.ts` |
| Docs | `docs/config.md`, `systems/config.md` |

---

## Receipt checklist (on ship)

- [ ] Row in [`../shipped/README.md`](../shipped/README.md).
- [ ] Durable notes in [`../systems/config.md`](../systems/config.md).
- [ ] Trim per [`README.md`](./README.md) lifecycle.
