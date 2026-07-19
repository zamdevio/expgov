import { CLI_PACKAGE_NAME } from './cli.js';

/** Public npm registry URL for `@expgov/cli` latest (persisted in `~/.expgov/state/version.json`). */
export const NPM_REGISTRY_LATEST_URL =
  `https://registry.npmjs.org/${encodeURIComponent(CLI_PACKAGE_NAME)}/latest` as const;

/** Bump when the on-disk `version.json` shape changes. */
export const UPDATE_STATE_SCHEMA_VERSION = 1 as const;

/** Placeholder when latest npm version cannot be resolved. */
export const VERSION_UNKNOWN = '—' as const;
