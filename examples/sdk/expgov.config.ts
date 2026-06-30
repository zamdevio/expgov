import { defineConfig, type ExpgovConfig } from 'expgov/core';

/**
 * Consumer-shaped expgov config for `@example/sdk-demo`.
 *
 * Classification strategies shown in `src/`:
 * - `tiers.stable.exact` / `.prefix` — config buckets
 * - `tiers.internal.prefix` — regex-friendly maintainer patterns
 * - `@sdkTier` JSDoc — tag precedence over config (see `tiers.tag`)
 */

export default defineConfig({
  packageName: '@example/sdk-demo',
  core: {
    dir: '.',
    rootBarrel: 'src/index.ts',
    subpaths: {
      '.': 'src/index.ts',
    },
  },
  tsconfig: 'tsconfig.json',
  cache: {
    enabled: true,
    dir: '.expgov/cache',
  },
  git: {
    tagPattern: 'v*',
    timelineBarrelPath: 'src/index.ts',
  },
  tiers: {
    tag: {
      name: 'sdkTier',
      precedence: 'tag',
    },
    stable: {
      exact: ['greet', 'SDK_VERSION', 'GreetOptions'],
      prefix: ['format'],
    },
    internal: {
      prefix: ['_', '^internal[A-Z_]'],
    },
    advanced: {
      prefix: ['^beta[A-Z_]', 'experimental'],
    },
  },
} satisfies ExpgovConfig);
