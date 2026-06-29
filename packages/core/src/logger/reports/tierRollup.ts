import { boldDim } from '../../runtime/style.js';
import type { TierCounts } from '../../inventory/types.js';
import { logLine, padLabel, tierColor } from '../report.js';

/** Print built-in + custom tier count rows (inventory root / SDK-wide sections). */
export function printTierRollupLines(tiers: TierCounts): void {
  logLine(`       ${padLabel('stable')} ${tierColor('stable', tiers.stable)}`);
  logLine(`       ${padLabel('advanced')} ${tierColor('advanced', tiers.advanced)}`);
  logLine(`       ${padLabel('internal')} ${tierColor('internal', tiers.internal)}`);
  logLine(`       ${padLabel('unclassified')} ${tierColor('unclassified', tiers.unclassified)}`);
  for (const [name, count] of Object.entries(tiers.custom).sort(([a], [b]) => a.localeCompare(b))) {
    if (count > 0) logLine(`       ${padLabel(name)} ${tierColor(name, count)}`);
  }
}

export function printSdkWideTiers(tiers: TierCounts): void {
  logLine('');
  logLine(boldDim('       SDK-wide tiers (root + published subpaths)'));
  printTierRollupLines(tiers);
}
