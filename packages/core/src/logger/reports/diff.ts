import { computeDiffInsights } from '../../insights/index.js';
import { boldDim, style } from '../../runtime/style.js';
import type { SnapshotResult } from '../../types/cache/index.js';
import type { InventorySnapshot } from '../../types/inventory/index.js';
import type { DiffResult } from '../../types/format/diff.js';
import { limitList, resolveListLimit } from '../../shared/listing.js';
import type { ListViewOptions } from '../../types/cli/list.js';
import type { TierCounts } from '../../types/inventory/snapshot.js';
import { formatDelta, formatSnapshotMetaEndpoint, logLine, logListTruncation, padLabel, printMeta, cacheLabel, canEmitVerboseReport } from '../report.js';
import { printInsightsBlock } from './insights.js';

function printCustomTierDeltas(left: TierCounts, right: TierCounts): void {
  const names = new Set([...Object.keys(left.custom), ...Object.keys(right.custom)]);
  for (const name of [...names].sort()) {
    const lv = left.custom[name] ?? 0;
    const rv = right.custom[name] ?? 0;
    if (lv === 0 && rv === 0) continue;
    logLine(`       ${padLabel(name)} ${formatDelta(lv, rv)}`);
  }
}

export function printDiffReport(input: {
  rangeLabel: string;
  left: SnapshotResult;
  right: SnapshotResult;
  diff: DiffResult;
  listView?: ListViewOptions;
}): void {
  const { rangeLabel, left, right, diff } = input;
  const listLimit = resolveListLimit(input.listView);

  printMeta({
    range: rangeLabel,
    from: formatSnapshotMetaEndpoint(left.snapshot),
    to: formatSnapshotMetaEndpoint(right.snapshot),
    cache: `${cacheLabel(left.cache)} / ${cacheLabel(right.cache)}`,
  });

  logLine('');
  const dl = diff.summaryDelta.left.root;
  const dr = diff.summaryDelta.right.root;
  logLine(`       ${padLabel('root flat')} ${formatDelta(dl.flat, dr.flat)}`);
  logLine(`       ${padLabel('stable')} ${formatDelta(dl.stable, dr.stable)}`);
  logLine(`       ${padLabel('advanced')} ${formatDelta(dl.advanced, dr.advanced)}`);
  logLine(`       ${padLabel('internal')} ${formatDelta(dl.internal, dr.internal)}`);
  printCustomTierDeltas(dl, dr);

  logLine('');
  if (diff.added.length) {
    const added = limitList(diff.added, listLimit);
    logLine(style.bold(style.ok('       Added')));
    for (const name of added.items) logLine(`       ${style.ok('+')} ${name}`);
    logListTruncation(added.hiddenCount);
    logLine('');
  }

  if (diff.removed.length) {
    const removed = limitList(diff.removed, listLimit);
    logLine(style.bold(style.err('       Removed')));
    for (const name of removed.items) logLine(`       ${style.err('-')} ${name}`);
    logListTruncation(removed.hiddenCount);
    logLine('');
  }

  if (!diff.added.length && !diff.removed.length) {
    logLine(style.dim('       No flat export additions or removals.'));
    logLine('');
  }

  if (diff.tierViolations.length) {
    logLine(style.bold(style.warn('       Tier violations')));
    for (const v of diff.tierViolations) logLine(`       ${style.warn('!')} ${v}`);
  } else {
    logLine(`       ${style.ok('✓')} ${style.dim('No tier violations')}`);
  }

  printInsightsBlock(computeDiffInsights(left.snapshot, right.snapshot, diff).lines);
}

export function printDiffVerbose(input: {
  diff: DiffResult;
  left: InventorySnapshot;
  right: InventorySnapshot;
  listView?: ListViewOptions;
}): void {
  if (!canEmitVerboseReport()) return;
  const { diff, left, right } = input;
  const listLimit = resolveListLimit(input.listView);
  if (diff.added.length) {
    const added = limitList(diff.added, listLimit);
    logLine('');
    logLine(boldDim('       Added detail'));
    for (const name of added.items) {
      const sym = right.symbols.find((s) => s.name === name);
      if (sym) {
        logLine(
          `       ${style.dim('·')} ${name} → ${sym.tier} · ${sym.category} · ${sym.symbolKind} → ${sym.targetSubpath}`,
        );
      }
    }
    logListTruncation(added.hiddenCount);
  }
  if (diff.removed.length) {
    const removed = limitList(diff.removed, listLimit);
    logLine('');
    logLine(boldDim('       Removed detail'));
    for (const name of removed.items) {
      const sym = left.symbols.find((s) => s.name === name);
      if (sym) {
        logLine(
          `       ${style.dim('·')} ${name} → ${sym.tier} · ${sym.category} · ${sym.symbolKind} → ${sym.targetSubpath}`,
        );
      }
    }
    logListTruncation(removed.hiddenCount);
  }
}

export function printDiffCacheDetail(input: { left: SnapshotResult; right: SnapshotResult }): void {
  if (!canEmitVerboseReport()) return;
  const { left, right } = input;
  logLine('');
  logLine(boldDim('       Cache detail'));
  logLine(`       ${padLabel('from')} ${left.snapshot.sha} ${style.dim(`(${left.cache})`)}`);
  logLine(`       ${padLabel('to')} ${right.snapshot.sha} ${style.dim(`(${right.cache})`)}`);
}
