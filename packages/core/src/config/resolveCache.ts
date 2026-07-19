import type { ExpgovCacheConfig } from '../types/config/cache.js';
import type { ExpgovConfig } from '../types/config/expgov.js';
import type { ResolvedCacheSettings } from '../types/config/cache.js';
import { DEFAULT_CACHE_DIR } from '../shared/constants/cache.js';

function resolveDir(cache: ExpgovCacheConfig | undefined): string {
  return cache?.dir ?? DEFAULT_CACHE_DIR;
}

/** Resolve `cache` from config into runtime cache policy. */
export function resolveCacheSettings(input: Pick<ExpgovConfig, 'cache'> = {}): ResolvedCacheSettings {
  if (input.cache === false) {
    return { enabled: false, dir: DEFAULT_CACHE_DIR };
  }

  if (input.cache === true) {
    return { enabled: true, dir: DEFAULT_CACHE_DIR };
  }

  if (input.cache && typeof input.cache === 'object') {
    return {
      enabled: input.cache.enabled ?? true,
      dir: resolveDir(input.cache),
    };
  }

  return { enabled: true, dir: DEFAULT_CACHE_DIR };
}
