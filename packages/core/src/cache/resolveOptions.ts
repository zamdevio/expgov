import { getProjectContext } from '../context/index.js';
import type { CacheOptions } from '../types/cache/store.js';

export type CliCacheFlags = Pick<CacheOptions, 'noCache' | 'force' | 'profile' | 'depth' | 'git'>;

/** Merge CLI cache flags with resolved config (`cache.enabled`). */
export function resolveCacheOptions(flags: CliCacheFlags = {}): CacheOptions {
  const { cacheEnabled } = getProjectContext();
  return {
    ...flags,
    cacheEnabled,
  };
}
