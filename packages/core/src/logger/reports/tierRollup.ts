import { limitList } from '../../shared/listing.js';
import { boldDim } from '../../runtime/style.js';
import type { TierCounts } from '../../types/inventory/snapshot.js';
import { logLine, logListTruncation, padLabel, tierColor } from '../report.js';

function customTierRows(tiers: TierCounts): { name: string; count: number }[] {
  return Object.entries(tiers.custom)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => ({ name, count }));
}

/** Print built-in tier counts + custom tier rows (custom rows respect list limit). */
export function printTierRollupLines(tiers: TierCounts, listLimit: number): void {
  logLine(`       ${padLabel('stable')} ${tierColor('stable', tiers.stable)}`);
  logLine(`       ${padLabel('advanced')} ${tierColor('advanced', tiers.advanced)}`);
  logLine(`       ${padLabel('internal')} ${tierColor('internal', tiers.internal)}`);
  logLine(`       ${padLabel('unclassified')} ${tierColor('unclassified', tiers.unclassified)}`);

  const custom = limitList(customTierRows(tiers), listLimit);
  for (const row of custom.items) {
    logLine(`       ${padLabel(row.name)} ${tierColor(row.name, row.count)}`);
  }
  logListTruncation(custom.hiddenCount);
}

export function printSdkWideTiers(tiers: TierCounts, listLimit: number): void {
  logLine('');
  logLine(boldDim('       SDK-wide tiers (root + published subpaths)'));
  printTierRollupLines(tiers, listLimit);
}
