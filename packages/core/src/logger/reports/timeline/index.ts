
import { style } from '../../../runtime/style.js';

import { getRootIndexRepoPath } from '../../../context/paths.js';
import { computeTimelineInsights } from '../../../insights/index.js';
import type { TimelineRange } from '../../../types/time/range.js';
import type { TimelineRow } from '../../../types/timeline/row.js';
import { formatSubject } from '../../format.js';
import { formatMetaEndpoint, logLine, logListTruncation, printMeta } from '../../report.js';
import { printInsightsBlock } from '../insights.js';
import { formatReleaseMarker, resolveDisplayTags } from './markers.js';
import {
  formatTimelineStepShorthand,
  hasTimelineStepActivity,
} from '../../../timeline/stepMeta.js';
import { printTimelineWarmSection } from './warm.js';
import type { TimelineWarmStats } from '../../../types/timeline/warm.js';

function timelineMetaEndpoints(range: TimelineRange): { from: string; to: string } {
  if (range.kind === 'time') {
    return { from: style.dim(range.since), to: style.dim(range.until) };
  }
  return {
    from: formatMetaEndpoint(range.left.label, range.left.sha),
    to: formatMetaEndpoint(range.right.label, range.right.sha),
  };
}

export function printTimelineReport(input: {
  range: TimelineRange;
  top: number;
  rows: TimelineRow[];
  hiddenCount?: number;
  verbose?: boolean;
  warmStats?: TimelineWarmStats;
  gitStats?: string;
  insights?: ReturnType<typeof computeTimelineInsights>;
}): void {
  const topLabel = Number.isFinite(input.top) ? String(input.top) : 'all';
  const endpoints = timelineMetaEndpoints(input.range);
  printMeta({
    range: input.range.label,
    from: endpoints.from,
    to: endpoints.to,
    top: style.dim(topLabel),
    barrel: style.dim(`${input.rows.length} commits · ${getRootIndexRepoPath()}`),
    git: input.gitStats ? style.dim(input.gitStats) : undefined,
  });

  printTimelineWarmSection(input.warmStats, input.verbose);

  if (!input.rows.length) {
    logLine('');
    logLine(style.dim('       No commits touching the root barrel in this range.'));
    if (input.range.kind === 'ref') {
      if (input.range.left.sha === input.range.right.sha) {
        logLine(
          style.dim(
            '       Left and right resolve to the same commit — try older..newer (e.g. HEAD~30..HEAD).',
          ),
        );
      } else {
        logLine(
          style.dim(
            '       Git ref ranges are directional (older..newer), same as diff — reversed order is usually empty.',
          ),
        );
      }
    }
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

    const subject = formatSubject(row.subject, input.verbose ? 36 : 48, input.verbose);
    const stepSuffix =
      input.verbose && row.step && hasTimelineStepActivity(row.step)
        ? style.dim(`  ${formatTimelineStepShorthand(row.step)}`)
        : '';
    logLine(
      `       ${row.date.padEnd(12)} ${row.sha.slice(0, 7).padEnd(9)} ${String(row.rollup.rootFlat).padStart(5)} ${deltaStr}  ${subject}${stepSuffix}`,
    );
    const markerTags = resolveDisplayTags(row.tags, input.verbose);
    if (markerTags.length) {
      logLine(formatReleaseMarker(markerTags));
    }
  }
  logListTruncation(input.hiddenCount ?? 0);

  const insights = input.insights ?? computeTimelineInsights(input.rows);
  if (insights) printInsightsBlock(insights.lines);
}
