import { describe, expect, it } from 'vitest';

import { computeTimelineSummary } from '../../timeline/summary.js';
import type { TimelineRefRange, TimelineTimeRange } from '../../types/time/range.js';
import type { TimelineRow } from '../../types/timeline/row.js';
import type { TimelineStepMeta } from '../../types/timeline/step.js';

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
    Partial<Pick<TimelineRow, 'delta' | 'tags' | 'step' | 'cache'>>,
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

const emptyStep = (): TimelineStepMeta => ({
  added: 0,
  removed: 0,
  namespaceDelta: 0,
  subpathDelta: 0,
  tierDelta: {},
});

describe('computeTimelineSummary', () => {
  it('aggregates API growth, step peaks, active window, and release jump', () => {
    const rows: TimelineRow[] = [
      // Newest-first; delta = this flat − older row below.
      row({ date: '2026-06-14', sha: 'd60df9e1111', rollup: { rootFlat: 14, stable: 12, namespace: 2, advanced: 1, internal: 1, byCategory: { command: 8 } }, delta: 2, tags: ['v1.1.0'] }),
      row({ date: '2026-06-12', sha: 'abc12345678', rollup: { rootFlat: 12, stable: 10, namespace: 2, advanced: 1, internal: 1, byCategory: { command: 7 } }, delta: 4 }),
      row({ date: '2026-06-10', sha: 'def98765432', rollup: { rootFlat: 8, stable: 7, namespace: 1, advanced: 0, internal: 1, byCategory: { util: 5 } }, delta: -2 }),
      row({ date: '2026-06-08', sha: 'fedcba98765', rollup: { rootFlat: 10, stable: 8, namespace: 1, advanced: 0, internal: 2, byCategory: { util: 6 } }, delta: null, tags: ['v1.0.0'] }),
    ];

    const summary = computeTimelineSummary(rows, refRange);
    expect(summary?.apiGrowth).toEqual({
      delta: 4,
      fromLabel: 'v1.0.0',
      toLabel: 'HEAD',
    });
    expect(summary?.largestExpansion).toEqual({
      delta: 4,
      sha: 'abc12345678',
      date: '2026-06-12',
    });
    expect(summary?.largestReduction).toEqual({
      delta: -2,
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
    expect(summary?.categoryShift).toEqual({ from: 'util', to: 'command' });
    expect(summary?.cacheCoverage).toEqual({ hits: 4, refreshed: 0, misses: 0, total: 4 });
  });

  it('aggregates symbol churn, namespace net, and tier movement from step meta', () => {
    const rows: TimelineRow[] = [
      row({
        date: '2026-06-14',
        sha: '111',
        rollup: { rootFlat: 5, stable: 4, namespace: 2, advanced: 0, internal: 0, byCategory: {} },
        delta: 2,
        step: { ...emptyStep(), added: 2, removed: 1, namespaceDelta: 1, tierDelta: { stable: 2 } },
      }),
      row({
        date: '2026-06-01',
        sha: '222',
        rollup: { rootFlat: 3, stable: 2, namespace: 1, advanced: 0, internal: 0, byCategory: {} },
        delta: null,
        cache: 'refresh',
        step: null,
      }),
    ];

    const summary = computeTimelineSummary(rows, timeRange);
    expect(summary?.exportChurn).toEqual({ added: 2, removed: 1, total: 3 });
    expect(summary?.namespaceNet).toBe(1);
    expect(summary?.tierMovement).toEqual({ stable: 2 });
    expect(summary?.largestModuleShift).toBeUndefined();
    expect(summary?.cacheCoverage).toEqual({ hits: 1, refreshed: 1, misses: 0, total: 2 });
  });

  it('uses range endpoints for time windows', () => {
    const rows: TimelineRow[] = [
      row({ date: '2026-06-14', sha: '111', rollup: { rootFlat: 5, stable: 4, namespace: 0, advanced: 0, internal: 0, byCategory: {} }, delta: 2 }),
      row({ date: '2026-06-01', sha: '222', rollup: { rootFlat: 3, stable: 2, namespace: 0, advanced: 0, internal: 0, byCategory: {} }, delta: null }),
    ];

    const summary = computeTimelineSummary(rows, timeRange);
    expect(summary?.apiGrowth).toEqual({
      delta: 2,
      fromLabel: '2026-05-15',
      toLabel: '2026-06-14',
    });
    expect(summary?.stableRatio).toEqual({ first: 66.7, last: 80 });
  });

  it('returns null with fewer than two commits', () => {
    expect(
      computeTimelineSummary(
        [row({ date: '2026-06-01', sha: '111', rollup: { rootFlat: 1, stable: 1, namespace: 0, advanced: 0, internal: 0, byCategory: {} } })],
        timeRange,
      ),
    ).toBeNull();
  });
});
