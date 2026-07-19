import type {
  InsightLine,
  TimelineInsightRow,
  TimelineInsights,
} from '../types/insights/index.js';
import { trimInsightLines } from './common.js';

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function isoWeekKey(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function busiestWeek(rows: TimelineInsightRow[]): { week: string; commits: number } | undefined {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = isoWeekKey(row.date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: { week: string; commits: number } | undefined;
  for (const [week, commits] of counts) {
    if (!best || commits > best.commits) best = { week, commits };
  }
  return best;
}

export function computeTimelineInsights(rows: TimelineInsightRow[]): TimelineInsights | null {
  if (rows.length < 2) return null;

  const lines: InsightLine[] = [];
  let added = 0;
  let removed = 0;
  let largestStep: { delta: number; date: string } | undefined;

  for (const row of rows) {
    if (row.delta === null || row.delta === 0) continue;
    if (row.delta > 0) added += row.delta;
    else removed += Math.abs(row.delta);
    if (!largestStep || Math.abs(row.delta) > Math.abs(largestStep.delta)) {
      largestStep = { delta: row.delta, date: row.date };
    }
  }

  if (added > 0 || removed > 0) {
    lines.push({
      key: 'flat-churn',
      text: `flat churn: ${signed(added)} added · −${removed} removed over ${rows.length} commits`,
    });
  }

  const newest = rows[0]!;
  const oldest = rows[rows.length - 1]!;
  const netFlat = newest.rollup.rootFlat - oldest.rollup.rootFlat;
  if (netFlat !== 0) {
    lines.push({
      key: 'window-net',
      text: `net flat: ${signed(netFlat)} (${oldest.date}→${newest.date})`,
    });
  }

  if (largestStep) {
    lines.push({
      key: 'largest-step',
      text: `largest step: ${signed(largestStep.delta)} flat on ${largestStep.date}`,
    });
  }

  const busy = busiestWeek(rows);
  if (busy && busy.commits > 1) {
    lines.push({
      key: 'busiest-week',
      text: `busiest week: ${busy.week} (${busy.commits} commits)`,
    });
  }

  if (!lines.length) return null;

  return trimInsightLines({
    lines,
    addedTotal: added || undefined,
    removedTotal: removed || undefined,
    netFlat: netFlat || undefined,
    largestStep,
    busiestWeek: busy,
  });
}
