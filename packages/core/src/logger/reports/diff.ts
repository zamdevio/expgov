import { computeDiffInsights } from '../../insights/index.js';
import { boldDim, style } from '../../runtime/style.js';
import type { SnapshotResult } from '../../types/cache/index.js';
import type { InventorySnapshot } from '../../types/inventory/index.js';
import type { DiffResult } from '../../types/format/diff.js';
import { filterSymbols, formatAppliedFiltersMeta, toFilterOptions } from '../../shared/filters.js';
import { limitList, resolveListLimit } from '../../shared/listing.js';
import type { ListViewOptions } from '../../types/cli/list.js';
import type { TierCounts } from '../../types/inventory/snapshot.js';
import { formatDelta, formatSnapshotMetaEndpoint, logLine, logListTruncation, padLabel, printMeta, cacheLabel, canEmitVerboseReport } from '../report.js';
import { printInsightsBlock } from './insights.js';

function printCustomTierDeltas(left: TierCounts, right: TierCounts, listLimit: number): void {
  const names = new Set([...Object.keys(left.custom ?? {}), ...Object.keys(right.custom ?? {})]);
  const rows = [...names]
    .sort()
    .filter((name) => {
      const lv = (left.custom ?? {})[name] ?? 0;
      const rv = (right.custom ?? {})[name] ?? 0;
      return lv !== 0 || rv !== 0;
    });
  if (!rows.length) return;

  const limited = limitList(rows, listLimit);
  for (const name of limited.items) {
    const lv = (left.custom ?? {})[name] ?? 0;
    const rv = (right.custom ?? {})[name] ?? 0;
    logLine(`       ${padLabel(name)} ${formatDelta(lv, rv)}`);
  }
  logListTruncation(limited.hiddenCount);
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
    filters: formatAppliedFiltersMeta(toFilterOptions(input.listView)),
  });

  logLine('');
  const dl = diff.summaryDelta.left.root;
  const dr = diff.summaryDelta.right.root;
  logLine(`       ${padLabel('root flat')} ${formatDelta(dl.flat, dr.flat)}`);
  logLine(`       ${padLabel('stable')} ${formatDelta(dl.stable, dr.stable)}`);
  logLine(`       ${padLabel('advanced')} ${formatDelta(dl.advanced, dr.advanced)}`);
  logLine(`       ${padLabel('internal')} ${formatDelta(dl.internal, dr.internal)}`);
  printCustomTierDeltas(dl, dr, listLimit);

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
    const violations = limitList(diff.tierViolations, listLimit);
    logLine(style.bold(style.warn('       Tier violations')));
    for (const v of violations.items) logLine(`       ${style.warn('!')} ${v}`);
    logListTruncation(violations.hiddenCount);
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
  const filters = toFilterOptions(input.listView);
  const listLimit = resolveListLimit(input.listView);

  const detailNames = (names: string[], side: InventorySnapshot): string[] => {
    const matched = names
      .map((name) => side.symbols.find((s) => s.name === name && s.exportKind === 'flat'))
      .filter((sym): sym is NonNullable<typeof sym> => Boolean(sym));
    return filterSymbols(matched, filters, side.namespaces).map((sym) => sym.name);
  };

  if (diff.added.length) {
    const added = limitList(detailNames(diff.added, right), listLimit);
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
    const removed = limitList(detailNames(diff.removed, left), listLimit);
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
