/**
 * Timeline range parsing for exports:timeline.
 * Supports ISO weeks, date ranges, relative windows, and git ref ranges.
 */
import { ExportError } from '../errors/index.js';
import { gitRevParse, splitRangeToken } from '../git/ref.js';
import type { TimelineRange, TimelineRefRange, TimelineTimeRange } from '../types/time/range.js';

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function endOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
}

function timeRange(input: Omit<TimelineTimeRange, 'kind'>): TimelineTimeRange {
  return { kind: 'time', ...input };
}

/** ISO week year-week e.g. 2026-W24 */
function parseIsoWeek(token: string): TimelineTimeRange | null {
  const match = /^(\d{4})-W(\d{2})$/i.exec(token);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (week < 1 || week > 53) return null;

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const weekStart = new Date(jan4);
  weekStart.setUTCDate(jan4.getUTCDate() - day + 1 + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);

  const since = startOfUtcDay(weekStart);
  const until = endOfUtcDay(weekEnd);
  return timeRange({
    label: `${token}`,
    since: isoDate(since),
    until: isoDate(until),
    sinceIso: since.toISOString(),
    untilIso: until.toISOString(),
  });
}

function parseDateRange(token: string): TimelineTimeRange | null {
  const idx = token.indexOf('..');
  if (idx <= 0) return null;
  const left = token.slice(0, idx).trim();
  const right = token.slice(idx + 2).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(left) || !/^\d{4}-\d{2}-\d{2}$/.test(right)) return null;
  const since = startOfUtcDay(new Date(`${left}T00:00:00.000Z`));
  const until = endOfUtcDay(new Date(`${right}T00:00:00.000Z`));
  return timeRange({
    label: `${left}..${right}`,
    since: left,
    until: right,
    sinceIso: since.toISOString(),
    untilIso: until.toISOString(),
  });
}

function parseRelative(token: string, now = new Date()): TimelineTimeRange | null {
  const rel = /^@(\d+)([dwm])$/i.exec(token);
  if (!rel) return null;
  const amount = Number(rel[1]);
  const unit = rel[2]!.toLowerCase();
  const until = endOfUtcDay(now);
  const since = startOfUtcDay(new Date(until));
  if (unit === 'd') since.setUTCDate(since.getUTCDate() - amount + 1);
  if (unit === 'w') since.setUTCDate(since.getUTCDate() - amount * 7 + 1);
  if (unit === 'm') since.setUTCMonth(since.getUTCMonth() - amount);
  return timeRange({
    label: token,
    since: isoDate(since),
    until: isoDate(until),
    sinceIso: since.toISOString(),
    untilIso: until.toISOString(),
  });
}

function refRange(leftLabel: string, rightLabel: string): TimelineRefRange {
  const leftSha = gitRevParse(leftLabel);
  const rightSha = gitRevParse(rightLabel);
  return {
    kind: 'ref',
    label: `${leftLabel}..${rightLabel}`,
    left: { kind: 'commit', sha: leftSha, label: leftLabel },
    right: { kind: 'commit', sha: rightSha, label: rightLabel },
  };
}

function parseRefRange(token: string): TimelineRefRange | null {
  const trimmed = token.trim();
  const range = splitRangeToken(trimmed);
  if (range) {
    if (
      range.right === 'worktree' ||
      range.right === 'working-tree' ||
      range.right === 'wt'
    ) {
      throw new ExportError('Timeline ref range requires two commit refs', 'invalid_range', {
        details: {
          range: trimmed,
          suggestion: 'Use two commits, tags, or branches — e.g. v1.0.0..HEAD',
        },
      });
    }
    return refRange(range.left, range.right);
  }

  if (trimmed.startsWith('@')) return null;

  try {
    gitRevParse(trimmed);
  } catch {
    return null;
  }
  return refRange(trimmed, 'HEAD');
}

export function parseTimelineRange(token: string): TimelineRange | null {
  const trimmed = token.trim();
  return (
    parseIsoWeek(trimmed) ??
    parseDateRange(trimmed) ??
    parseRelative(trimmed) ??
    parseRefRange(trimmed)
  );
}

export function formatTimelineRangeHelp(): string[] {
  return [
    '2026-W24           ISO week (Mon–Sun, UTC)',
    '2026-06-01..2026-06-14   inclusive date range',
    '@7d                last 7 days',
    '@4w                last 4 weeks',
    '@3m                last 3 months',
    'v1.0.0..HEAD       git ref range (tag, branch, sha)',
    'v1.0.0             barrel edits since ref to HEAD',
  ];
}

/** Meta `from` / `to` labels for human timeline reports. */
export function timelineRangeEndpoints(range: TimelineRange): { from: string; to: string } {
  if (range.kind === 'time') {
    return { from: range.since, to: range.until };
  }
  return { from: range.left.label, to: range.right.label };
}
