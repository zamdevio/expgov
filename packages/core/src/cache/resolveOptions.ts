import { getProjectContext } from '../context/index.js';
import type { CacheOptions, CliCacheFlags } from '../types/cache/store.js';

/** Merge CLI cache flags with resolved config (`cache.enabled`). */
export function resolveCacheOptions(flags: CliCacheFlags = {}): CacheOptions {
  const { cacheEnabled } = getProjectContext();
  return {
    ...flags,
    cacheEnabled,
  };
}
