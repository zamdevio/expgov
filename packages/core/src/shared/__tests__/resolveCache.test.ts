import { describe, expect, it } from 'vitest';

import { resolveCacheSettings } from '../../config/resolveCache.js';
import { DEFAULT_CACHE_DIR } from '../constants/cache.js';

describe('resolveCacheSettings', () => {
  it('defaults to enabled with default dir', () => {
    expect(resolveCacheSettings({})).toEqual({ enabled: true, dir: DEFAULT_CACHE_DIR });
  });

  it('accepts cache: false shorthand', () => {
    expect(resolveCacheSettings({ cache: false })).toEqual({
      enabled: false,
      dir: DEFAULT_CACHE_DIR,
    });
  });

  it('accepts cache: true shorthand', () => {
    expect(resolveCacheSettings({ cache: true })).toEqual({
      enabled: true,
      dir: DEFAULT_CACHE_DIR,
    });
  });

  it('reads cache.dir from object form', () => {
    expect(resolveCacheSettings({ cache: { dir: '.cache/custom' } })).toEqual({
      enabled: true,
      dir: '.cache/custom',
    });
  });

  it('honors cache.enabled false in object form', () => {
    expect(resolveCacheSettings({ cache: { enabled: false, dir: '.expgov/cache' } })).toEqual({
      enabled: false,
      dir: '.expgov/cache',
    });
  });
});
