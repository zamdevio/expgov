import { diffSnapshots } from '../format/diff.js';
import type { InventorySnapshot } from '../types/inventory/snapshot.js';
import type { TierCounts } from '../types/inventory/snapshot.js';
import type { TimelineStepMeta, TimelineStepTierDelta } from '../types/timeline/step.js';

function subpathFlatTotal(summary: InventorySnapshot['summary']): number {
  return summary.subpaths.reduce((total, entry) => total + entry.flat, 0);
}

function tierCountDelta(older: TierCounts, newer: TierCounts): TimelineStepTierDelta {
  const delta: TimelineStepTierDelta = {};
  if (newer.stable !== older.stable) delta.stable = newer.stable - older.stable;
  if (newer.advanced !== older.advanced) delta.advanced = newer.advanced - older.advanced;
  if (newer.internal !== older.internal) delta.internal = newer.internal - older.internal;
  if (newer.unclassified !== older.unclassified) {
    delta.unclassified = newer.unclassified - older.unclassified;
  }

  const customNames = new Set([...Object.keys(older.custom), ...Object.keys(newer.custom)]);
  const custom: Record<string, number> = {};
  for (const name of customNames) {
    const change = (newer.custom[name] ?? 0) - (older.custom[name] ?? 0);
    if (change !== 0) custom[name] = change;
  }
  if (Object.keys(custom).length) delta.custom = custom;

  return delta;
}

function largestModuleEdgeDelta(
  older: InventorySnapshot,
  newer: InventorySnapshot,
): { module: string; delta: number } | undefined {
  if (!older.edges.length && !newer.edges.length) return undefined;

  const countModules = (snapshot: InventorySnapshot): Map<string, number> => {
    const counts = new Map<string, number>();
    for (const edge of snapshot.edges) {
      counts.set(edge.toModule, (counts.get(edge.toModule) ?? 0) + 1);
    }
    return counts;
  };

  const olderCounts = countModules(older);
  const newerCounts = countModules(newer);
  const modules = new Set([...olderCounts.keys(), ...newerCounts.keys()]);
  let best: { module: string; delta: number } | undefined;

  for (const module of modules) {
    const delta = (newerCounts.get(module) ?? 0) - (olderCounts.get(module) ?? 0);
    if (delta === 0) continue;
    if (!best || Math.abs(delta) > Math.abs(best.delta)) {
      best = { module, delta };
    }
  }

  return best;
}

/**
 * Diff one timeline step chronologically (older → newer).
 * Positive deltas mean growth on the newer commit.
 * Attach the result to the newer row when rows are newest-first.
 */
export function computeTimelineStepMeta(
  older: InventorySnapshot,
  newer: InventorySnapshot,
): TimelineStepMeta {
  const diff = diffSnapshots(older, newer);
  const olderRoot = older.summary.root;
  const newerRoot = newer.summary.root;

  return {
    added: diff.added.length,
    removed: diff.removed.length,
    namespaceDelta: newerRoot.namespace - olderRoot.namespace,
    subpathDelta: subpathFlatTotal(newer.summary) - subpathFlatTotal(older.summary),
    tierDelta: tierCountDelta(olderRoot, newerRoot),
    largestModuleChange: largestModuleEdgeDelta(older, newer),
  };
}

export function formatTimelineStepShorthand(meta: TimelineStepMeta): string {
  const parts: string[] = [];
  if (meta.added) parts.push(`+${meta.added}`);
  if (meta.removed) parts.push(`−${meta.removed}`);
  if (meta.namespaceDelta) {
    parts.push(`ns ${meta.namespaceDelta > 0 ? '+' : ''}${meta.namespaceDelta}`);
  }
  if (meta.subpathDelta) {
    parts.push(`sp ${meta.subpathDelta > 0 ? '+' : ''}${meta.subpathDelta}`);
  }

  const tierParts: string[] = [];
  if (meta.tierDelta.stable) {
    tierParts.push(`st ${meta.tierDelta.stable > 0 ? '+' : ''}${meta.tierDelta.stable}`);
  }
  if (meta.tierDelta.advanced) {
    tierParts.push(`adv ${meta.tierDelta.advanced > 0 ? '+' : ''}${meta.tierDelta.advanced}`);
  }
  if (meta.tierDelta.internal) {
    tierParts.push(`int ${meta.tierDelta.internal > 0 ? '+' : ''}${meta.tierDelta.internal}`);
  }
  if (tierParts.length) parts.push(tierParts.join(' '));

  return parts.join(' ');
}

export function hasTimelineStepActivity(meta: TimelineStepMeta): boolean {
  return Boolean(
    meta.added ||
      meta.removed ||
      meta.namespaceDelta ||
      meta.subpathDelta ||
      meta.tierDelta.stable ||
      meta.tierDelta.advanced ||
      meta.tierDelta.internal ||
      meta.tierDelta.unclassified ||
      (meta.tierDelta.custom && Object.keys(meta.tierDelta.custom).length) ||
      meta.largestModuleChange,
  );
}
