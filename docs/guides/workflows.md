---
description: "Practical expgov workflows — scaffold config, tune tiers, review releases, and wire validate --since into CI with JSON output."
---

# Workflows

Copy-paste recipes for common SDK governance tasks. All flows respect the [governance model](../governance.md): read-only except `init`.

## New SDK setup

Scaffold config, inventory the barrel, and enforce tiers.

```bash
pnpm add -D @expgov/cli
expgov init
expgov inventory
expgov validate
```

Use `init -y -r` in CI or when you want commented tier examples without prompts.

## Tune tier allowlists

When you add flat exports, get dry-run hints then edit config.

```bash
expgov suggest
# copy names into tiers.stable.exact (or add @sdkTier tags)
expgov validate
```

## Release review

Compare export surface across tags before you ship.

```bash
expgov trend
expgov diff v1.2.0..v1.3.0
expgov validate
expgov graph HEAD -v
```

## Barrel archaeology

See which commits touched the root barrel and how counts moved.

```bash
expgov timeline @4w
expgov timeline v1.0.0..HEAD
expgov timeline HEAD~30..HEAD~1
```

## Environment hygiene

Run before your first governance pass on a repo.

```bash
expgov doctor
expgov doctor -v
```

Use `validate` for full tier enforcement; `doctor` catches config path and cache gitignore issues.

## CI gate (exit code)

```bash
pnpm build
expgov validate
```

Fails with exit `1` when violations exist — suitable for GitHub Actions without parsing output.

## CI gate (compat + validate)

After a frozen 1.x baseline tag, prefer the **one-command** PR gate — current-tree governance **and** no flat export removals:

```bash
pnpm build
expgov validate --since v1.0.0
```

Or pin the baseline in config and omit the flag in CI:

```ts
// expgov.config.ts
git: { tagPattern: 'v*', compatBaseline: 'v1.0.0' },
```

```bash
pnpm build
expgov validate
```

CLI `--since` still overrides `git.compatBaseline`. Use `'latest-tag'` when you want the newest tag matching `git.tagPattern`.

Equivalent two-step form (still useful when you want separate jobs or only the surface check):

```bash
expgov validate
expgov diff v1.0.0..HEAD --fail-on-removed
```

Optional on `diff` only: also fail on right-side tier notes with `--fail-on-tier-violations`. Default `diff` (no fail flags) stays exit `0`. See [validate](../commands/validate.md) and [diff](../commands/diff.md).

| Goal | Command |
|------|---------|
| Current-tree tiers + parity | `expgov validate` (no baseline configured) |
| No removals since baseline | `expgov diff <tag>..HEAD --fail-on-removed` |
| Both (recommended CI) | `expgov validate --since <tag>` or config `compatBaseline` |
| JSON artifact for agents | add `-j` (`-s` is redundant) |

## CI gate (JSON artifact)

```bash
expgov validate --since v1.0.0 --json > validate.json
test "$(jq -r .ok validate.json)" = "true"
```

Parse `issues[]` for structured automation (`expgov.validate.violation`, `expgov.diff.exports_removed`). See [JSON output](../cli/json.md).

### GitHub Actions sketch

```yaml
- name: Export governance
  run: pnpm exec expgov validate --since v1.0.0
```

Or with a JSON artifact:

```yaml
- name: Export governance (JSON)
  run: |
    pnpm exec expgov validate --since v1.0.0 -j > validate.json
    test "$(jq -r .ok validate.json)" = "true"
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: expgov-validate
    path: validate.json
```

## Monorepo dogfood

Point at another package root:

```bash
expgov -C packages/my-sdk validate
expgov -C packages/my-sdk inventory
```

## Related

- [Install](../install.md)
- [Commands overview](../commands/README.md)
- [validate](../commands/validate.md)
- [diff](../commands/diff.md)
- [SDK overview](../sdk/README.md)
