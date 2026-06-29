/** Public npm registry URL for `expgov` latest (persisted in `~/.expgov/state/version.json`). */
export const NPM_REGISTRY_LATEST_URL =
  'https://registry.npmjs.org/expgov/latest' as const;

/** Bump when the on-disk `version.json` shape changes. */
export const UPDATE_STATE_SCHEMA_VERSION = 1 as const;
