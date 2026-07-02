import type { InventorySnapshot } from '../types/inventory/snapshot.js';

export function timelineRollupFromSnapshot(snapshot: InventorySnapshot): {
  rootFlat: number;
  stable: number;
  namespace: number;
  advanced: number;
  internal: number;
  byCategory: Record<string, number>;
} {
  const r = snapshot.summary.root;
  return {
    rootFlat: r.flat,
    stable: r.stable,
    namespace: r.namespace,
    advanced: r.advanced,
    internal: r.internal,
    byCategory: r.byCategory ?? {},
  };
}
