import type { TimelineWarmEntry, TimelineWarmStats } from '../../../types/timeline/warm.js';
import { boldDim, style } from '../../../runtime/style.js';
import { cacheLabel, logLine, padLabel } from '../../report.js';

function formatWarmEntry(entry: TimelineWarmEntry): string {
  return `${style.dim('·')} ${style.dim(`${entry.index}/${entry.total}`)}  ${entry.sha}  ${cacheLabel(entry.cache)}  ${style.dim(`${entry.ms}ms`)}`;
}

/** Warm log below timeline meta — matches meta row indent (`       key      value`). */
export function printTimelineWarmSection(
  warmStats: TimelineWarmStats | undefined,
  verbose: boolean | undefined,
): void {
  if (!warmStats || warmStats.warmed === 0) return;

  logLine('');

  if (warmStats.entries.length > 0) {
    logLine(boldDim('       Snapshot warm'));
    const entries = verbose
      ? warmStats.entries
      : [warmStats.entries[warmStats.entries.length - 1]!];
    for (const entry of entries) {
      logLine(`       ${formatWarmEntry(entry)}`);
    }
  }

  const totalLabel =
    warmStats.totalMs > 0
      ? `${warmStats.warmed}/${warmStats.entries[0]?.total ?? warmStats.warmed} · ${warmStats.totalMs}ms total`
      : `${warmStats.warmed}/${warmStats.entries[0]?.total ?? warmStats.warmed}`;

  logLine(`       ${padLabel('warmed')}${style.dim(totalLabel)}`);
}
