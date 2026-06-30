
import { style } from '../../runtime/style.js';

import type { CacheStatus } from '../../types/cache/index.js';
import { getRootIndexRepoPath } from '../../context/paths.js';
import { computeTimelineInsights } from '../../insights/index.js';
import { formatSubject } from '../format.js';
import { logLine, logListTruncation, printMeta } from '../report.js';
import { printInsightsBlock } from './insights.js';

export function printTimelineReport(input: {
  range: { label: string; since: string; until: string };
  top: number;
  rows: {
    date: string;
    sha: string;
    subject: string;
    cache: CacheStatus;
    rollup: { rootFlat: number; stable: number };
    delta: number | null;
  }[];
  hiddenCount?: number;
  verbose?: boolean;
  warmStats?: { warmed: number; totalMs: number };
  gitStats?: string;
  insights?: ReturnType<typeof computeTimelineInsights>;
}): void {
  const topLabel = Number.isFinite(input.top) ? String(input.top) : 'all';
  printMeta({
    range: input.range.label,
    from: style.dim(input.range.since),
    to: style.dim(input.range.until),
    top: style.dim(topLabel),
    barrel: style.dim(`${input.rows.length} commits · ${getRootIndexRepoPath()}`),
    warm: input.warmStats
      ? style.dim(`${input.warmStats.warmed}/${input.rows.length} · ${input.warmStats.totalMs}ms`)
      : undefined,
    git: input.gitStats ? style.dim(input.gitStats) : undefined,
  });

  if (!input.rows.length) {
    logLine('');
    logLine(style.dim('       No commits touching the root barrel in this range.'));
    return;
  }
  logLine(
    style.dim(
      '       Δ = flat change vs row above (newest first); — = first row; +N/−N flat exports vs newer barrel edit',
    ),
  );

  logLine('');
  logLine(style.dim(`       ${'date'.padEnd(12)} ${'sha'.padEnd(9)} ${'flat'.padStart(5)} ${'Δ'.padStart(5)}  subject`));
  for (const row of input.rows) {
    let deltaStr: string;
    if (row.delta === null) deltaStr = style.dim('    —');
    else if (row.delta === 0) deltaStr = style.dim('    0');
    else if (row.delta > 0) deltaStr = style.warn(` +${row.delta}`.padStart(4));
    else deltaStr = style.ok(` ${row.delta}`.padStart(4));

    const subject = formatSubject(row.subject, 48, input.verbose);
    logLine(
      `       ${row.date.padEnd(12)} ${row.sha.slice(0, 7).padEnd(9)} ${String(row.rollup.rootFlat).padStart(5)} ${deltaStr}  ${subject}`,
    );
  }
  logListTruncation(input.hiddenCount ?? 0);

  const insights = input.insights ?? computeTimelineInsights(input.rows);
  if (insights) printInsightsBlock(insights.lines);
}
