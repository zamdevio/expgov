import { describe, expect, it } from 'vitest';

import { computeInventoryInsights } from '../../insights/inventory.js';
import { computeValidateInsights } from '../../insights/validate.js';
import { SNAPSHOT_VERSION, TOOL_VERSION } from '../../shared/constants/cache.js';
import type { InventorySnapshot } from '../../types/inventory/snapshot.js';
import { emptyTierCounts } from '../../inventory/tierCounts.js';

function minimalSnapshot(overrides: Partial<InventorySnapshot> = {}): InventorySnapshot {
  return {
    version: SNAPSHOT_VERSION,
    toolVersion: TOOL_VERSION,
    sha: '__worktree__',
    refLabel: 'working tree',
    generatedAt: new Date().toISOString(),
    barrel: 'packages/core/src/index.ts',
    summary: {
      root: { flat: 0, namespace: 0, ...emptyTierCounts(), byTsKind: { value: 0, type: 0 }, bySymbolKind: {}, byCategory: {} },
      subpaths: [],
    },
    symbols: [],
    namespaces: [],
    edges: [],
    ...overrides,
  };
}

describe('computeInventoryInsights', () => {
  it('reports largest module by edge count', () => {
    const snapshot = minimalSnapshot({
      symbols: [
        { name: 'a', tsKind: 'value', exportKind: 'flat', tier: 'stable', category: 'other', targetSubpath: '.', symbolKind: 'function', sourceModule: 'src/a.ts', subpath: '.' },
        { name: 'b', tsKind: 'value', exportKind: 'flat', tier: 'stable', category: 'other', targetSubpath: '.', symbolKind: 'function', sourceModule: 'src/b.ts', subpath: '.' },
        { name: 'c', tsKind: 'value', exportKind: 'flat', tier: 'stable', category: 'other', targetSubpath: '.', symbolKind: 'function', sourceModule: 'src/big.ts', subpath: '.' },
      ],
      edges: [
        { kind: 'flat-reexport', from: '.', symbol: 'a', toModule: 'src/a.ts', targetSubpath: '.' },
        { kind: 'flat-reexport', from: '.', symbol: 'b', toModule: 'src/b.ts', targetSubpath: '.' },
        { kind: 'flat-reexport', from: '.', symbol: 'c', toModule: 'src/big.ts', targetSubpath: '.' },
        { kind: 'flat-reexport', from: '.', symbol: 'c2', toModule: 'src/big.ts', targetSubpath: '.' },
      ],
      summary: {
        root: { flat: 3, namespace: 0, stable: 3, advanced: 0, internal: 0, unclassified: 0, custom: {}, byTsKind: { value: 3, type: 0 }, bySymbolKind: {}, byCategory: {} },
        subpaths: [],
      },
    });

    const insights = computeInventoryInsights(snapshot);
    expect(insights.largestModule?.path).toBe('src/big.ts');
    expect(insights.lines.some((l) => l.key === 'largest-module')).toBe(true);
  });

  it('hides median when fewer than three modules', () => {
    const snapshot = minimalSnapshot({
      symbols: [
        { name: 'a', tsKind: 'value', exportKind: 'flat', tier: 'stable', category: 'other', targetSubpath: '.', symbolKind: 'function', sourceModule: 'src/a.ts', subpath: '.' },
        { name: 'b', tsKind: 'value', exportKind: 'flat', tier: 'stable', category: 'other', targetSubpath: '.', symbolKind: 'function', sourceModule: 'src/b.ts', subpath: '.' },
      ],
    });
    expect(computeInventoryInsights(snapshot).medianExportsPerModule).toBeUndefined();
  });

  it('flags root unclassified exports', () => {
    const snapshot = minimalSnapshot({
      summary: {
        root: { flat: 1, namespace: 0, stable: 0, advanced: 0, internal: 0, unclassified: 1, custom: {}, byTsKind: { value: 1, type: 0 }, bySymbolKind: {}, byCategory: {} },
        subpaths: [],
      },
    });
    expect(computeInventoryInsights(snapshot).lines.some((l) => l.key === 'root-unclassified')).toBe(true);
  });
});

describe('computeValidateInsights', () => {
  it('returns hot spot on failure', () => {
    const snapshot = minimalSnapshot({
      symbols: [
        { name: 'X', tsKind: 'value', exportKind: 'flat', tier: 'unclassified', category: 'other', targetSubpath: '.', symbolKind: 'unknown', sourceModule: 'src/hot.ts', subpath: '.' },
        { name: 'Y', tsKind: 'value', exportKind: 'flat', tier: 'unclassified', category: 'other', targetSubpath: '.', symbolKind: 'unknown', sourceModule: 'src/hot.ts', subpath: '.' },
      ],
    });
    const insights = computeValidateInsights(snapshot, { passed: false });
    expect(insights?.hottestUnclassifiedModule?.path).toBe('src/hot.ts');
    expect(insights?.lines.some((l) => l.key === 'unclassified-samples')).toBe(true);
  });

  it('returns null on clean pass without verbose', () => {
    const snapshot = minimalSnapshot({
      summary: {
        root: { flat: 1, namespace: 0, stable: 1, advanced: 0, internal: 0, unclassified: 0, custom: {}, byTsKind: { value: 1, type: 0 }, bySymbolKind: {}, byCategory: {} },
        subpaths: [],
      },
    });
    expect(computeValidateInsights(snapshot, { passed: true })).toBeNull();
  });

  it('reports internal flats on pass with verbose', () => {
    const insights = computeValidateInsights(minimalSnapshot(), {
      passed: true,
      verbose: true,
      internalFlatCount: 2,
    });
    expect(insights?.lines.some((l) => l.key === 'internal-on-root')).toBe(true);
  });
});
