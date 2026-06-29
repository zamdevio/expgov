import { describe, expect, it } from 'vitest';

import { rebuildCacheStatus, shouldReadCache, shouldWriteCache } from '../../cache/store/mode.js';

describe('cache mode with config disabled', () => {
  const disabled = { cacheEnabled: false };

  it('skips read and write', () => {
    expect(shouldReadCache(disabled)).toBe(false);
    expect(shouldWriteCache(disabled)).toBe(false);
  });

  it('labels fresh builds as disabled', () => {
    expect(rebuildCacheStatus(disabled)).toBe('disabled');
  });

  it('cli --no-cache still bypasses when cache enabled', () => {
    expect(rebuildCacheStatus({ cacheEnabled: true, noCache: true })).toBe('bypass');
  });
});
