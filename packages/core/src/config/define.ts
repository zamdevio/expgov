import type { ExpgovConfig } from './types.js';

/** Type-safe helper for `expgov.config.ts` default export. */
export function defineConfig(config: ExpgovConfig): ExpgovConfig {
  return config;
}
