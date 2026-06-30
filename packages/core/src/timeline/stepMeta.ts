import { diffSnapshots } from '../format/diff.js';
import type { InventorySnapshot } from '../types/inventory/snapshot.js';
import type { TierCounts } from '../types/inventory/snapshot.js';
import type { TimelineStepMeta, TimelineStepTierDelta } from '../types/timeline/step.js';

function subpathFlatTotal(summary: InventorySnapshot['summary']): number {
  return summary.subpaths.reduce((total, entry) => total + entry.flat, 0);
}

function tierCountDelta(left: TierCounts, right: TierCounts): TimelineStepTierDelta {
  const delta: TimelineStepTierDelta = {};
  if (right.stable !== left.stable) delta.stable = right.stable - left.stable;
  if (right.advanced !== left.advanced) delta.advanced = right.advanced - left.advanced;
  if (right.internal !== left.internal) delta.internal = right.internal - left.internal;
  if (right.unclassified !== left.unclassified) delta.unclassified = right.unclassified - left.unclassified;

  const customNames = new Set([...Object.keys(left.custom), ...Object.keys(right.custom)]);
  const custom: Record<string, number> = {};
  for (const name of customNames) {
    const change = (right.custom[name] ?? 0) - (left.custom[name] ?? 0);
    if (change !== 0) custom[name] = change;
  }
  if (Object.keys(custom).length) delta.custom = custom;

  return delta;
}

function largestModuleEdgeDelta(
  left: InventorySnapshot,
  right: InventorySnapshot,
): { module: string; delta: number } | undefined {
  if (!left.edges.length && !right.edges.length) return undefined;

  const countModules = (snapshot: InventorySnapshot): Map<string, number> => {
    const counts = new Map<string, number>();
    for (const edge of snapshot.edges) {
      counts.set(edge.toModule, (counts.get(edge.toModule) ?? 0) + 1);
    }
    return counts;
  };

  const leftCounts = countModules(left);
  const rightCounts = countModules(right);
  const modules = new Set([...leftCounts.keys(), ...rightCounts.keys()]);
  let best: { module: string; delta: number } | undefined;

  for (const module of modules) {
    const delta = (rightCounts.get(module) ?? 0) - (leftCounts.get(module) ?? 0);
    if (delta === 0) continue;
    if (!best || Math.abs(delta) > Math.abs(best.delta)) {
      best = { module, delta };
    }
  }

  return best;
}

/** Diff newer → older commit pair (timeline rows are newest-first). */
export function computeTimelineStepMeta(
  newer: InventorySnapshot,
  older: InventorySnapshot,
): TimelineStepMeta {
  const diff = diffSnapshots(newer, older);
  const leftRoot = newer.summary.root;
  const rightRoot = older.summary.root;

  return {
    added: diff.added.length,
    removed: diff.removed.length,
    namespaceDelta: rightRoot.namespace - leftRoot.namespace,
    subpathDelta: subpathFlatTotal(older.summary) - subpathFlatTotal(newer.summary),
    tierDelta: tierCountDelta(leftRoot, rightRoot),
    largestModuleChange: largestModuleEdgeDelta(newer, older),
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
  if (meta.tierDelta.stable) tierParts.push(`st ${meta.tierDelta.stable > 0 ? '+' : ''}${meta.tierDelta.stable}`);
  if (meta.tierDelta.advanced) tierParts.push(`adv ${meta.tierDelta.advanced > 0 ? '+' : ''}${meta.tierDelta.advanced}`);
  if (meta.tierDelta.internal) tierParts.push(`int ${meta.tierDelta.internal > 0 ? '+' : ''}${meta.tierDelta.internal}`);
  if (tierParts.length) parts.push(tierParts.join(' '));

  return parts.join(' ');
}

export function hasTimelineStepActivity(meta: TimelineStepMeta): boolean {
  if (meta.added || meta.removed || meta.namespaceDelta || meta.subpathDelta) return true;
  const tier = meta.tierDelta;
  if (tier.stable || tier.advanced || tier.internal || tier.unclassified) return true;
  if (tier.custom && Object.keys(tier.custom).length) return true;
  return Boolean(meta.largestModuleChange);
}
