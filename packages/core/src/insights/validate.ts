import type { InventorySnapshot } from '../types/inventory/snapshot.js';
import type { InsightLine, ValidateInsights } from '../types/insights/index.js';
import { countByModule, topModule, trimInsightLines } from './common.js';

function worstUnclassifiedSubpath(
  snapshot: InventorySnapshot,
): { npmSubpath: string; unclassified: number } | undefined {
  let worst: { npmSubpath: string; unclassified: number } | undefined;
  for (const subpath of snapshot.summary.subpaths) {
    if (subpath.byTier.unclassified <= 0) continue;
    if (!worst || subpath.byTier.unclassified > worst.unclassified) {
      worst = { npmSubpath: subpath.npmSubpath, unclassified: subpath.byTier.unclassified };
    }
  }
  return worst;
}

export function computeValidateInsights(
  snapshot: InventorySnapshot,
  input: {
    passed: boolean;
    verbose?: boolean;
    internalFlatCount?: number;
    advancedFlatCount?: number;
  },
): ValidateInsights | null {
  const lines: InsightLine[] = [];
  const unclassifiedFlats = snapshot.symbols.filter(
    (sym) => sym.exportKind === 'flat' && sym.tier === 'unclassified',
  );
  const byModule = countByModule(unclassifiedFlats.map((sym) => sym.sourceModule));
  const hottest = topModule(byModule);
  const worstSubpath = worstUnclassifiedSubpath(snapshot);

  if (!input.passed) {
    if (hottest) {
      lines.push({
        key: 'hottest-unclassified-module',
        text: `hot spot: ${hottest.path} (${hottest.count} unclassified)`,
      });
    }

    if (worstSubpath) {
      lines.push({
        key: 'worst-subpath',
        text: `worst subpath: ${worstSubpath.npmSubpath} (${worstSubpath.unclassified} unclassified)`,
      });
    }

    const topNames = unclassifiedFlats
      .map((sym) => sym.name)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 3);
    if (topNames.length) {
      lines.push({
        key: 'unclassified-samples',
        text: `add tiers.stable.exact or @sdkTier for: ${topNames.join(', ')}`,
      });
    }
  } else if (input.verbose) {
    if ((input.internalFlatCount ?? 0) > 0) {
      lines.push({
        key: 'internal-on-root',
        text: `${input.internalFlatCount} internal-tier flat export(s) on root`,
      });
    }
    if ((input.advancedFlatCount ?? 0) > 0) {
      lines.push({
        key: 'advanced-on-root',
        text: `${input.advancedFlatCount} advanced-tier flat export(s) on root`,
      });
    }
  }

  if (!lines.length) return null;

  return trimInsightLines({
    lines,
    hottestUnclassifiedModule: hottest,
    worstSubpath,
  });
}
