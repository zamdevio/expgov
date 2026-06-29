import type { CacheOptions, CacheStatus } from '../../types/cache/store.js';

/** Whether this run may read an on-disk snapshot. */
export function shouldReadCache(options: CacheOptions): boolean {
  return options.cacheEnabled !== false && !options.noCache && !options.force;
}

/** Whether this run may write an on-disk snapshot after building. */
export function shouldWriteCache(options: CacheOptions): boolean {
  return options.cacheEnabled !== false && !options.noCache;
}

/** Cache line status after a fresh build (not a hit). */
export function rebuildCacheStatus(
  options: CacheOptions,
): Extract<CacheStatus, 'miss' | 'refresh' | 'bypass' | 'disabled'> {
  if (options.cacheEnabled === false) return 'disabled';
  if (options.noCache) return 'bypass';
  if (options.force) return 'refresh';
  return 'miss';
}
