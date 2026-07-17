---
description: "Practical expgov workflows — scaffold config, tune tiers, review releases, and wire validate into CI with JSON output."
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

## CI gate (no export removals)

After a frozen 1.x baseline tag, fail when public flats disappear:

```bash
expgov validate
expgov diff v1.0.0..HEAD --fail-on-removed
```

Optional: also fail on right-side tier violations with `--fail-on-tier-violations`. Default `diff` (no fail flags) stays exit `0`. See [diff](../commands/diff.md).

## CI gate (JSON artifact)

```bash
expgov validate --json --silent > validate.json
test "$(jq -r .ok validate.json)" = "true"
```

Parse `issues[]` for structured automation. See [JSON output](../cli/json.md).

## Monorepo dogfood

Point at another package root:

```bash
expgov -C packages/my-sdk validate
expgov -C packages/my-sdk inventory
```

## Related

- [Install](../install.md)
- [Commands overview](../commands/README.md)
- [SDK overview](../sdk/README.md)
