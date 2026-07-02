import type { TimelineRange } from '../types/time/range.js';
import type { TimelineRow } from '../types/timeline/row.js';
import type {
  TimelineActivePeriod,
  TimelineCacheCoverage,
  TimelineCategoryShift,
  TimelineExportChurn,
  TimelineModuleShift,
  TimelineReleaseJump,
  TimelineStableRatio,
  TimelineStepPeak,
  TimelineSummary,
  TimelineTierMovement,
} from '../types/timeline/summary.js';
import type { TimelineStepTierDelta } from '../types/timeline/step.js';
import { TIMELINE_ACTIVE_WINDOW_DAYS } from '../shared/constants/timeline.js';

function primaryTag(tags: readonly string[]): string | undefined {
  if (!tags.length) return undefined;
  return tags[tags.length - 1]!;
}

function rangeEndpointLabels(range: TimelineRange): { from: string; to: string } {
  if (range.kind === 'ref') {
    return { from: range.left.label, to: range.right.label };
  }
  return { from: range.since, to: range.until };
}

function scanStepPeaks(rows: TimelineRow[]): {
  largestExpansion?: TimelineStepPeak;
  largestReduction?: TimelineStepPeak;
  avgStepChange?: number;
} {
  let largestExpansion: TimelineStepPeak | undefined;
  let largestReduction: TimelineStepPeak | undefined;
  const magnitudes: number[] = [];

  for (const row of rows) {
    if (row.delta === null || row.delta === 0) continue;
    magnitudes.push(Math.abs(row.delta));
    if (row.delta > 0 && (!largestExpansion || row.delta > largestExpansion.delta)) {
      largestExpansion = { delta: row.delta, sha: row.sha, date: row.date };
    }
    if (row.delta < 0 && (!largestReduction || row.delta < largestReduction.delta)) {
      largestReduction = { delta: row.delta, sha: row.sha, date: row.date };
    }
  }

  if (!magnitudes.length) return {};
  const avgStepChange = magnitudes.reduce((sum, value) => sum + value, 0) / magnitudes.length;
  return { largestExpansion, largestReduction, avgStepChange };
}

function parseIsoDate(isoDate: string): number {
  return Date.parse(`${isoDate}T12:00:00Z`);
}

function formatWindowLabel(startIso: string, endIso: string): string {
  if (startIso === endIso) return startIso;
  return `${startIso}–${endIso}`;
}

function mostActiveWindow(rows: TimelineRow[]): TimelineActivePeriod | undefined {
  if (rows.length < 2) return undefined;

  const dates = rows.map((row) => row.date).sort();
  const minTs = parseIsoDate(dates[0]!);
  const maxTs = parseIsoDate(dates[dates.length - 1]!);
  const windowMs = (TIMELINE_ACTIVE_WINDOW_DAYS - 1) * 86_400_000;

  let best: TimelineActivePeriod | undefined;

  for (let endTs = minTs; endTs <= maxTs; endTs += 86_400_000) {
    const startTs = endTs - windowMs;
    let commits = 0;
    let startIso = '';
    let endIso = '';

    for (const row of rows) {
      const ts = parseIsoDate(row.date);
      if (ts < startTs || ts > endTs) continue;
      commits += 1;
      if (!startIso || row.date < startIso) startIso = row.date;
      if (!endIso || row.date > endIso) endIso = row.date;
    }

    if (commits < 2) continue;
    if (!best || commits > best.commits) {
      best = {
        label: formatWindowLabel(startIso, endIso),
        commits,
      };
    }
  }

  return best;
}

function largestReleaseJump(rows: TimelineRow[]): TimelineReleaseJump | undefined {
  const tagged = rows
    .filter((row) => row.tags.length)
    .map((row) => ({
      date: row.date,
      flat: row.rollup.rootFlat,
      tag: primaryTag(row.tags)!,
    }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.tag.localeCompare(b.tag));

  if (tagged.length < 2) return undefined;

  let best: TimelineReleaseJump | undefined;
  for (let i = 1; i < tagged.length; i += 1) {
    const prev = tagged[i - 1]!;
    const curr = tagged[i]!;
    const delta = curr.flat - prev.flat;
    if (delta <= 0) continue;
    if (!best || delta > best.delta) {
      best = { fromTag: prev.tag, toTag: curr.tag, delta };
    }
  }

  return best;
}

function addTierDelta(target: TimelineTierMovement, delta: TimelineStepTierDelta): void {
  if (delta.stable) target.stable = (target.stable ?? 0) + delta.stable;
  if (delta.advanced) target.advanced = (target.advanced ?? 0) + delta.advanced;
  if (delta.internal) target.internal = (target.internal ?? 0) + delta.internal;
  if (delta.unclassified) target.unclassified = (target.unclassified ?? 0) + delta.unclassified;
}

function hasTierMovement(movement: TimelineTierMovement): boolean {
  return Boolean(
    movement.stable || movement.advanced || movement.internal || movement.unclassified,
  );
}

function aggregateStepSeries(rows: TimelineRow[]): {
  exportChurn?: TimelineExportChurn;
  namespaceNet: number;
  tierMovement: TimelineTierMovement;
  largestModuleShift?: TimelineModuleShift;
  cacheCoverage: TimelineCacheCoverage;
} {
  let added = 0;
  let removed = 0;
  let namespaceNet = 0;
  const tierMovement: TimelineTierMovement = {};
  let largestModuleShift: TimelineModuleShift | undefined;
  const cacheCoverage: TimelineCacheCoverage = {
    hits: 0,
    refreshed: 0,
    misses: 0,
    total: rows.length,
  };

  for (const row of rows) {
    if (row.cache === 'hit') cacheCoverage.hits += 1;
    else if (row.cache === 'refresh') cacheCoverage.refreshed += 1;
    else if (row.cache === 'miss') cacheCoverage.misses += 1;

    if (!row.step) continue;
    added += row.step.added;
    removed += row.step.removed;
    namespaceNet += row.step.namespaceDelta;
    addTierDelta(tierMovement, row.step.tierDelta);

    const moduleChange = row.step.largestModuleChange;
    if (moduleChange) {
      const candidate: TimelineModuleShift = {
        module: moduleChange.module,
        delta: moduleChange.delta,
        sha: row.sha,
        date: row.date,
      };
      if (
        !largestModuleShift ||
        Math.abs(moduleChange.delta) > Math.abs(largestModuleShift.delta)
      ) {
        largestModuleShift = candidate;
      }
    }
  }

  const exportChurn =
    added > 0 || removed > 0 ? { added, removed, total: added + removed } : undefined;

  return { exportChurn, namespaceNet, tierMovement, largestModuleShift, cacheCoverage };
}

function stableRatio(rollup: TimelineRow['rollup']): number | undefined {
  if (rollup.rootFlat <= 0) return undefined;
  return Math.round((rollup.stable / rollup.rootFlat) * 1000) / 10;
}

function topCategory(byCategory: Record<string, number>): string | undefined {
  let best: { category: string; count: number } | undefined;
  for (const [category, count] of Object.entries(byCategory)) {
    if (!count) continue;
    if (!best || count > best.count) best = { category, count };
  }
  return best?.category;
}

function categoryShift(rows: TimelineRow[]): TimelineCategoryShift | undefined {
  if (rows.length < 2) return undefined;
  const newest = rows[0]!;
  const oldest = rows[rows.length - 1]!;
  const from = topCategory(oldest.rollup.byCategory);
  const to = topCategory(newest.rollup.byCategory);
  if (!from || !to || from === to) return undefined;
  return { from, to };
}

function stableRatioShift(rows: TimelineRow[]): TimelineStableRatio | undefined {
  if (rows.length < 2) return undefined;
  const first = stableRatio(rows[rows.length - 1]!.rollup);
  const last = stableRatio(rows[0]!.rollup);
  if (first === undefined || last === undefined || first === last) return undefined;
  return { first, last };
}

export function computeTimelineSummary(
  rows: TimelineRow[],
  range: TimelineRange,
): TimelineSummary | null {
  if (rows.length < 2) return null;

  const newest = rows[0]!;
  const oldest = rows[rows.length - 1]!;
  const endpoints = rangeEndpointLabels(range);
  const apiGrowth = {
    delta: newest.rollup.rootFlat - oldest.rollup.rootFlat,
    fromLabel: endpoints.from,
    toLabel: endpoints.to,
  };

  const { largestExpansion, largestReduction, avgStepChange } = scanStepPeaks(rows);
  const mostActivePeriod = mostActiveWindow(rows);
  const largestRelease = largestReleaseJump(rows);
  const series = aggregateStepSeries(rows);
  const ratio = stableRatioShift(rows);
  const shiftedCategory = categoryShift(rows);

  const hasStory =
    apiGrowth.delta !== 0 ||
    largestExpansion ||
    largestReduction ||
    mostActivePeriod ||
    largestRelease ||
    series.exportChurn ||
    series.namespaceNet !== 0 ||
    hasTierMovement(series.tierMovement) ||
    ratio ||
    shiftedCategory ||
    series.largestModuleShift ||
    series.cacheCoverage.hits < series.cacheCoverage.total;

  if (!hasStory && avgStepChange === undefined) return null;

  return {
    apiGrowth,
    largestExpansion,
    largestReduction,
    avgStepChange,
    mostActivePeriod,
    largestRelease,
    exportChurn: series.exportChurn,
    namespaceNet: series.namespaceNet !== 0 ? series.namespaceNet : undefined,
    tierMovement: hasTierMovement(series.tierMovement) ? series.tierMovement : undefined,
    stableRatio: ratio,
    largestModuleShift: series.largestModuleShift,
    categoryShift: shiftedCategory,
    cacheCoverage: series.cacheCoverage,
  };
}
