import type { InventorySnapshot, TierCounts } from '../../types/inventory/snapshot.js';
import { SNAPSHOT_VERSION, TOOL_VERSION } from '../../shared/constants/cache.js';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Tier rollup shape required on every cached snapshot (including legacy rebuild detection). */
export function isValidTierCounts(value: unknown): value is TierCounts {
  if (!value || typeof value !== 'object') return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.stable === 'number' &&
    typeof t.advanced === 'number' &&
    typeof t.internal === 'number' &&
    typeof t.unclassified === 'number' &&
    isPlainObject(t.custom)
  );
}

export function isValidSummary(value: unknown): value is InventorySnapshot['summary'] {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  const root = s.root;
  if (!isValidTierCounts(root)) return false;
  const r = root as TierCounts & Record<string, unknown>;
  if (typeof r.flat !== 'number' || typeof r.namespace !== 'number') return false;
  if (!isPlainObject(r.byTsKind) || !isPlainObject(r.bySymbolKind) || !isPlainObject(r.byCategory)) {
    return false;
  }
  if (!Array.isArray(s.subpaths)) return false;
  for (const item of s.subpaths) {
    if (!item || typeof item !== 'object') return false;
    const sp = item as Record<string, unknown>;
    if (typeof sp.npmSubpath !== 'string' || typeof sp.sourceEntry !== 'string') return false;
    if (typeof sp.flat !== 'number' || typeof sp.namespace !== 'number') return false;
    if (!isValidTierCounts(sp.byTier)) return false;
  }
  return true;
}

export function isValidSnapshot(value: unknown): value is InventorySnapshot {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return (
    s.version === SNAPSHOT_VERSION &&
    s.toolVersion === TOOL_VERSION &&
    typeof s.sha === 'string' &&
    typeof s.refLabel === 'string' &&
    typeof s.generatedAt === 'string' &&
    isValidSummary(s.summary) &&
    Array.isArray(s.symbols) &&
    Array.isArray(s.namespaces) &&
    Array.isArray(s.edges)
  );
}

export function isFullSnapshot(snapshot: InventorySnapshot): boolean {
  return snapshot.scanDepth !== 'light';
}

export function isTimelineSnapshot(snapshot: InventorySnapshot): boolean {
  return snapshot.scanDepth === 'light';
}

export function snapshotMatchesSha(sha: string, snapshot: InventorySnapshot): boolean {
  return snapshot.sha === sha;
}
