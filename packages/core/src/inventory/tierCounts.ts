import type { InventorySnapshot, TierCounts } from '../types/inventory/snapshot.js';

export function emptyTierCounts(): TierCounts {
  return { stable: 0, advanced: 0, internal: 0, unclassified: 0, custom: {} };
}

function mergeCustomTierCounts(into: TierCounts, from: TierCounts): void {
  for (const [name, count] of Object.entries(from.custom ?? {})) {
    if (count <= 0) continue;
    into.custom[name] = (into.custom[name] ?? 0) + count;
  }
}

/** SDK-wide tier totals (root barrel + published subpaths). */
export function sumSdkTierCounts(snapshot: Pick<InventorySnapshot, 'summary'>): TierCounts {
  const totals = emptyTierCounts();
  const root = snapshot.summary.root;

  totals.stable = root.stable;
  totals.advanced = root.advanced;
  totals.internal = root.internal;
  totals.unclassified = root.unclassified;
  mergeCustomTierCounts(totals, root);

  for (const subpath of snapshot.summary.subpaths) {
    totals.stable += subpath.byTier.stable;
    totals.advanced += subpath.byTier.advanced;
    totals.internal += subpath.byTier.internal;
    totals.unclassified += subpath.byTier.unclassified;
    mergeCustomTierCounts(totals, subpath.byTier);
  }

  return totals;
}

/** Footer / summary key=value map including custom tier buckets. */
export function tierCountsFooterFields(
  tiers: TierCounts,
  extra?: Record<string, string | number>,
): Record<string, string | number> {
  const counts: Record<string, string | number> = { ...extra };
  if (tiers.stable > 0) counts.stable = tiers.stable;
  if (tiers.advanced > 0) counts.advanced = tiers.advanced;
  if (tiers.internal > 0) counts.internal = tiers.internal;
  if (tiers.unclassified > 0) counts.unclassified = tiers.unclassified;
  for (const [name, count] of Object.entries(tiers.custom).sort(([a], [b]) => a.localeCompare(b))) {
    if (count > 0) counts[name] = count;
  }
  return counts;
}

/** Human-readable tier rollup for validate notes and similar. */
export function formatTierCountsNote(tiers: TierCounts, label = 'sdk-wide tiers'): string {
  const parts = [
    `stable=${tiers.stable}`,
    `advanced=${tiers.advanced}`,
    `internal=${tiers.internal}`,
    `unclassified=${tiers.unclassified}`,
    ...Object.entries(tiers.custom)
      .filter(([, count]) => count > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, count]) => `${name}=${count}`),
  ];
  return `${label}: ${parts.join(' ')}`;
}

export function customTierNames(tiers: TierCounts): string[] {
  return Object.entries(tiers.custom)
    .filter(([, count]) => count > 0)
    .map(([name]) => name)
    .sort();
}
