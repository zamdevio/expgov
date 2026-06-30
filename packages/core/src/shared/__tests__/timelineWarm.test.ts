import { describe, expect, it } from 'vitest';

import { TimelineWarmer } from '../../timeline/warmer.js';

describe('TimelineWarmer', () => {
  it('collects warm entries for report rendering', () => {
    const warmer = new TimelineWarmer(2);
    warmer.tick('abc1234567890abcdef1234567890abcd', 7, 'hit');
    warmer.tick('def1234567890abcdef1234567890abcd', 0, 'hit');
    const stats = warmer.finish();

    expect(stats.warmed).toBe(2);
    expect(stats.totalMs).toBe(7);
    expect(stats.entries).toHaveLength(2);
    expect(stats.entries[0]?.sha).toBe('abc1234');
    expect(stats.entries[1]?.index).toBe(2);
  });
});
