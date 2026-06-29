import chalk from 'chalk';

import type { SnapshotResult } from '../../cache/index.js';
import type { InventorySnapshot } from '../../inventory/index.js';
import type { DiffResult } from '../../format/diff.js';
import { limitList, resolveListLimit } from '../../shared/listing.js';
import type { ListViewOptions } from '../../types/cli/list.js';
import { formatDelta, logLine, logListTruncation, padLabel, printMeta, snapshotShaLabel, cacheLabel, canEmitVerboseReport } from '../report.js';

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
    from: `${left.snapshot.refLabel} ${chalk.dim(`(${snapshotShaLabel(left.snapshot)})`)}`,
    to: `${right.snapshot.refLabel} ${chalk.dim(`(${snapshotShaLabel(right.snapshot)})`)}`,
    cache: `${cacheLabel(left.cache)} / ${cacheLabel(right.cache)}`,
  });

  logLine('');
  const dl = diff.summaryDelta.left.root;
  const dr = diff.summaryDelta.right.root;
  logLine(`       ${padLabel('root flat')} ${formatDelta(dl.flat, dr.flat)}`);
  logLine(`       ${padLabel('stable')} ${formatDelta(dl.stable, dr.stable)}`);
  logLine(`       ${padLabel('advanced')} ${formatDelta(dl.advanced, dr.advanced)}`);
  logLine(`       ${padLabel('internal')} ${formatDelta(dl.internal, dr.internal)}`);

  logLine('');
  if (diff.added.length) {
    const added = limitList(diff.added, listLimit);
    logLine(chalk.green.bold('       Added'));
    for (const name of added.items) logLine(`       ${chalk.green('+')} ${name}`);
    logListTruncation(added.hiddenCount);
    logLine('');
  }

  if (diff.removed.length) {
    const removed = limitList(diff.removed, listLimit);
    logLine(chalk.red.bold('       Removed'));
    for (const name of removed.items) logLine(`       ${chalk.red('-')} ${name}`);
    logListTruncation(removed.hiddenCount);
    logLine('');
  }

  if (!diff.added.length && !diff.removed.length) {
    logLine(chalk.dim('       No flat export additions or removals.'));
    logLine('');
  }

  if (diff.tierViolations.length) {
    logLine(chalk.yellow.bold('       Tier violations'));
    for (const v of diff.tierViolations) logLine(`       ${chalk.yellow('!')} ${v}`);
  } else {
    logLine(`       ${chalk.green('✓')} ${chalk.dim('No tier violations')}`);
  }
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
    logLine(chalk.bold.dim('       Added detail'));
    for (const name of added.items) {
      const sym = right.symbols.find((s) => s.name === name);
      if (sym) {
        logLine(
          `       ${chalk.dim('·')} ${name} → ${sym.tier} · ${sym.category} · ${sym.symbolKind} → ${sym.targetSubpath}`,
        );
      }
    }
    logListTruncation(added.hiddenCount);
  }
  if (diff.removed.length) {
    const removed = limitList(diff.removed, listLimit);
    logLine('');
    logLine(chalk.bold.dim('       Removed detail'));
    for (const name of removed.items) {
      const sym = left.symbols.find((s) => s.name === name);
      if (sym) {
        logLine(
          `       ${chalk.dim('·')} ${name} → ${sym.tier} · ${sym.category} · ${sym.symbolKind} → ${sym.targetSubpath}`,
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
  logLine(chalk.bold.dim('       Cache detail'));
  logLine(`       ${padLabel('from')} ${left.snapshot.sha} ${chalk.dim(`(${left.cache})`)}`);
  logLine(`       ${padLabel('to')} ${right.snapshot.sha} ${chalk.dim(`(${right.cache})`)}`);
}
