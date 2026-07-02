import { describe, expect, it } from 'vitest';

import { computeTimelineSummary } from '../../timeline/summary.js';
import type { TimelineRefRange, TimelineTimeRange } from '../../types/time/range.js';
import type { TimelineRow } from '../../types/timeline/row.js';

const timeRange: TimelineTimeRange = {
  kind: 'time',
  label: '@4w',
  since: '2026-05-15',
  until: '2026-06-14',
  sinceIso: '2026-05-15T00:00:00.000Z',
  untilIso: '2026-06-14T23:59:59.999Z',
};

const refRange: TimelineRefRange = {
  kind: 'ref',
  label: 'v1.0.0..HEAD',
  left: { kind: 'commit', sha: 'aaa', label: 'v1.0.0' },
  right: { kind: 'commit', sha: 'bbb', label: 'HEAD' },
};

function row(
  partial: Pick<TimelineRow, 'date' | 'sha' | 'rollup'> &
    Partial<Pick<TimelineRow, 'delta' | 'tags'>>,
): TimelineRow {
  return {
    subject: 'feat: test',
    cache: 'hit',
    step: null,
    tags: [],
    delta: null,
    ...partial,
  };
}

describe('computeTimelineSummary', () => {
  it('aggregates API growth, step peaks, active window, and release jump', () => {
    const rows: TimelineRow[] = [
      row({ date: '2026-06-14', sha: 'd60df9e1111', rollup: { rootFlat: 14, stable: 12 }, delta: null, tags: ['v1.1.0'] }),
      row({ date: '2026-06-12', sha: 'abc12345678', rollup: { rootFlat: 12, stable: 10 }, delta: 2 }),
      row({ date: '2026-06-10', sha: 'def98765432', rollup: { rootFlat: 8, stable: 7 }, delta: -4 }),
      row({ date: '2026-06-08', sha: 'fedcba98765', rollup: { rootFlat: 10, stable: 8 }, delta: 2, tags: ['v1.0.0'] }),
    ];

    const summary = computeTimelineSummary(rows, refRange);
    expect(summary?.apiGrowth).toEqual({
      delta: 4,
      fromLabel: 'v1.0.0',
      toLabel: 'HEAD',
    });
    expect(summary?.largestExpansion).toEqual({
      delta: 2,
      sha: 'abc12345678',
      date: '2026-06-12',
    });
    expect(summary?.largestReduction).toEqual({
      delta: -4,
      sha: 'def98765432',
      date: '2026-06-10',
    });
    expect(summary?.avgStepChange).toBeCloseTo(8 / 3);
    expect(summary?.mostActivePeriod?.commits).toBeGreaterThanOrEqual(2);
    expect(summary?.largestRelease).toEqual({
      fromTag: 'v1.0.0',
      toTag: 'v1.1.0',
      delta: 4,
    });
  });

  it('uses range endpoints for time windows', () => {
    const rows: TimelineRow[] = [
      row({ date: '2026-06-14', sha: '111', rollup: { rootFlat: 5, stable: 4 }, delta: null }),
      row({ date: '2026-06-01', sha: '222', rollup: { rootFlat: 3, stable: 2 }, delta: 2 }),
    ];

    const summary = computeTimelineSummary(rows, timeRange);
    expect(summary?.apiGrowth).toEqual({
      delta: 2,
      fromLabel: '2026-05-15',
      toLabel: '2026-06-14',
    });
  });

  it('returns null with fewer than two commits', () => {
    expect(
      computeTimelineSummary(
        [row({ date: '2026-06-01', sha: '111', rollup: { rootFlat: 1, stable: 1 } })],
        timeRange,
      ),
    ).toBeNull();
  });
});
