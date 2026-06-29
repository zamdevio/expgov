import type { InventorySnapshot } from '../../types/inventory/snapshot.js';
import type { SourceRef } from '../../types/git/index.js';
import { getCommitSnapshot } from './commit.js';
import { loadCacheMeta } from './meta.js';
import type { CacheOptions, SnapshotResult } from '../../types/cache/store.js';
import { getWorktreeSnapshot } from './worktree.js';
import { shouldReadCache, shouldWriteCache } from './mode.js';

export function getSnapshot(ref: SourceRef, options: CacheOptions = {}): SnapshotResult {
  if (shouldReadCache(options) || shouldWriteCache(options)) {
    loadCacheMeta();
  }
  if (ref.kind === 'worktree') return getWorktreeSnapshot(options);
  return getCommitSnapshot(ref, options);
}

/** Trend-ready rollup from meta entry or snapshot. */
export function trendRollupFromSnapshot(snapshot: InventorySnapshot): {
  rootFlat: number;
  stable: number;
  advanced: number;
  internal: number;
  byCategory: InventorySnapshot['summary']['root']['byCategory'];
  commitDate?: string;
} {
  const r = snapshot.summary.root;
  return {
    rootFlat: r.flat,
    stable: r.stable,
    advanced: r.advanced,
    internal: r.internal,
    byCategory: r.byCategory,
    commitDate: snapshot.git?.commitDate,
  };
}
