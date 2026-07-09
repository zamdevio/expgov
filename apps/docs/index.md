---
layout: home

title: expgov — Export governance for TypeScript SDKs
description: "Inventory, diff, validate, trend, timeline, and graph for TypeScript barrel exports — tier classification, drift detection, and CI-friendly JSON output."

hero:
  name: expgov
  text: Govern your SDK export surface
  tagline: Classify exports with tiers, catch drift between refs, and ship safer semver — read-only by default, TypeScript config only.
  image:
    src: /expgov.svg
    alt: expgov
  actions:
    - theme: brand
      text: Get started
      link: /guides/workflows
    - theme: alt
      text: SDK
      link: /sdk/
    - theme: alt
      text: Install
      link: /install

features:
  - icon: 📋
    title: Barrel inventory
    details: Flat counts, namespaces, tier and category breakdown — working tree or any git ref.
  - icon: 🔀
    title: Diff and validate
    details: Compare export surfaces between tags or commits; enforce tier rules and tsconfig ↔ package.json parity.
  - icon: 📈
    title: Trend and timeline
    details: Export counts across release tags; git log of barrel edits with summary metrics and cache coverage.
  - icon: 🕸️
    title: Export graph
    details: Namespace-first view of re-export targets, subpaths, and module fan-in with analytics summary.
  - icon: 🛡️
    title: Read-only by default
    details: Governance commands never edit your barrel — only init writes expgov.config.ts.
  - icon: 📦
    title: SDK-ready core
    details: "@expgov/core exposes the same engines as the CLI — embed governance in your own hosts."
---

## Install

**CLI (terminal):**

```bash
pnpm add -D @expgov/cli
# or: npm install -D @expgov/cli
```

**SDK (programmatic APIs only — not needed for CLI or config):**

```bash
pnpm add -D @expgov/core
# or: npm install -D @expgov/core
```

The **`@expgov/cli`** devDependency includes **`@expgov/cli/core`** for optional `defineConfig` in `expgov.config.ts`. npm blocks unscoped `expgov` (too similar to `expo`) — see [Install](/install).

## Quick start

```bash
pnpm add -D @expgov/cli
expgov init
expgov validate
expgov inventory
expgov diff HEAD
expgov timeline @4w
expgov graph
```

Install as a **devDependency** — the CLI tarball includes `@expgov/cli/core` for optional config types. See [Install](/install).

## Documentation

| Topic | What you will learn |
|-------|---------------------|
| [Workflows](/guides/workflows) | Copy-paste recipes for SDK setup, release review, and CI |
| [Governance model](/governance) | Read-only defaults, tiers, and what validate enforces |
| [Install](/install) | Requirements, init, local dev, cache |
| [SDK](/sdk/) | `@expgov/core` — install and host contract |
| [Configuration](/config) | `expgov.config.ts`, tiers, `@sdkTier` |
| [Commands](/commands/) | Per-command reference |
| [CLI flags](/cli/flags) | `--json`, cache, list truncation |
| [JSON output](/cli/json) | Machine-readable envelope for CI |

## Design principles

**Governance without surprises.** expgov separates inventory from enforcement. Commands are read-only except `init`. Tier rules live in TypeScript config you review in PRs — not hidden heuristics. Inspired by focused CLI tools: a thin host, clear defaults, and stable `--json` for automation.
