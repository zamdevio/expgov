import { boldDim, style } from '../../runtime/style.js';

import { computeTrendInsights } from '../../insights/index.js';
import type { CacheStatus } from '../../types/cache/index.js';
import { limitList, resolveListLimit } from '../../shared/listing.js';
import type { ListViewOptions } from '../../types/cli/list.js';
import { logLine, logListTruncation, padLabel, printMeta, formatMetaEndpoint } from '../report.js';
import { printInsightsBlock } from './insights.js';

export function printTrendReport(input: {
  rows: {
    tag: string;
    sha: string;
    cache: CacheStatus;
    rollup: {
      rootFlat: number;
      stable: number;
      advanced: number;
      internal: number;
      byCategory: Record<string, number | undefined>;
    };
  }[];
  tagLimit: number;
  verbose?: boolean;
  listView?: ListViewOptions;
}): void {
  const listLimit = resolveListLimit(input.listView);
  const displayRows = limitList(input.rows, listLimit);
  const windowFirst = input.rows[0];
  const windowLast = input.rows[input.rows.length - 1];

  printMeta({
    tags: style.dim(String(input.rows.length)),
    window: style.dim(`last ${input.tagLimit} version tags`),
    ...(windowFirst && windowLast
      ? {
          from: formatMetaEndpoint(windowFirst.tag, windowFirst.sha),
          to: formatMetaEndpoint(windowLast.tag, windowLast.sha),
        }
      : {}),
  });

  if (!displayRows.items.length) {
    logLine('');
    logLine(style.dim('       No version tags found (git tag -l v*).'));
    return;
  }

  logLine('');
  logLine(
    style.dim(
      `       ${'tag'.padEnd(10)} ${'flat'.padStart(6)} ${'stable'.padStart(6)} ${'adv'.padStart(5)} ${'int'.padStart(4)}`,
    ),
  );
  for (const row of displayRows.items) {
    logLine(
      `       ${row.tag.padEnd(10)} ${String(row.rollup.rootFlat).padStart(6)} ${String(row.rollup.stable).padStart(6)} ${String(row.rollup.advanced).padStart(5)} ${String(row.rollup.internal).padStart(4)} ${style.dim(`(${row.cache})`)}`,
    );
  }
  logListTruncation(displayRows.hiddenCount);

  const first = displayRows.items[0]!;
  const last = displayRows.items[displayRows.items.length - 1]!;
  const delta = last.rollup.rootFlat - first.rollup.rootFlat;
  const pct = first.rollup.rootFlat ? ((delta / first.rollup.rootFlat) * 100).toFixed(1) : '0.0';
  logLine('');
  if (delta === 0) {
    logLine(`       ${style.dim(`Δ ${first.tag} → ${last.tag}: flat unchanged`)}`);
  } else if (delta > 0) {
    logLine(`       ${style.warn(`Δ ${first.tag} → ${last.tag}: +${delta} flat (+${pct}%)`)}`);
  } else {
    logLine(`       ${style.ok(`Δ ${first.tag} → ${last.tag}: ${delta} flat (${pct}%)`)}`);
  }

  if (input.verbose) {
    const categories = Object.entries(last.rollup.byCategory).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
    const limited = limitList(categories, listLimit);
    logLine('');
    logLine(boldDim('       Categories (latest tag)'));
    for (const [cat, count] of limited.items) {
      logLine(`       ${padLabel(cat, 14)} ${count ?? 0}`);
    }
    logListTruncation(limited.hiddenCount);
  }

  const insights = computeTrendInsights(input.rows);
  if (insights) printInsightsBlock(insights.lines);
}
