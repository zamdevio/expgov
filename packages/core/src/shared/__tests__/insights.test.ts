import { describe, expect, it } from 'vitest';

import { computeInventoryInsights } from '../../insights/inventory.js';
import { computeValidateInsights } from '../../insights/validate.js';
import { computeDiffInsights } from '../../insights/diff.js';
import { computeTrendInsights } from '../../insights/trend.js';
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

describe('computeDiffInsights', () => {
  it('reports largest module edge delta and tier movement', () => {
    const left = minimalSnapshot({
      edges: [{ kind: 'flat-reexport', from: '.', symbol: 'a', toModule: 'src/a.ts', targetSubpath: '.' }],
      summary: {
        root: { flat: 1, namespace: 0, stable: 1, advanced: 0, internal: 0, unclassified: 0, custom: {}, byTsKind: { value: 1, type: 0 }, bySymbolKind: {}, byCategory: {} },
        subpaths: [],
      },
    });
    const right = minimalSnapshot({
      edges: [
        { kind: 'flat-reexport', from: '.', symbol: 'a', toModule: 'src/a.ts', targetSubpath: '.' },
        { kind: 'flat-reexport', from: '.', symbol: 'b', toModule: 'src/a.ts', targetSubpath: '.' },
        { kind: 'flat-reexport', from: '.', symbol: 'c', toModule: 'src/a.ts', targetSubpath: '.' },
      ],
      summary: {
        root: { flat: 3, namespace: 0, stable: 2, advanced: 1, internal: 0, unclassified: 0, custom: {}, byTsKind: { value: 3, type: 0 }, bySymbolKind: {}, byCategory: {} },
        subpaths: [],
      },
      symbols: [
        { name: 'a', tsKind: 'value', exportKind: 'flat', tier: 'stable', category: 'other', targetSubpath: '.', symbolKind: 'function', sourceModule: 'src/a.ts', subpath: '.' },
        { name: 'b', tsKind: 'value', exportKind: 'flat', tier: 'stable', category: 'other', targetSubpath: '.', symbolKind: 'function', sourceModule: 'src/a.ts', subpath: '.' },
        { name: 'c', tsKind: 'value', exportKind: 'flat', tier: 'advanced', category: 'other', targetSubpath: '.', symbolKind: 'function', sourceModule: 'src/a.ts', subpath: '.' },
      ],
    });
    const diff = {
      added: ['b', 'c'],
      removed: [],
      summaryDelta: { left: left.summary, right: right.summary },
      tierViolations: [],
    };
    const insights = computeDiffInsights(left, right, diff);
    expect(insights.largestModuleDelta?.path).toBe('src/a.ts');
    expect(insights.largestModuleDelta?.delta).toBe(2);
    expect(insights.lines.some((l) => l.key === 'tier-movement')).toBe(true);
    expect(insights.lines.some((l) => l.key === 'new-advanced')).toBe(true);
  });
});

describe('computeTrendInsights', () => {
  it('reports largest jump and stable ratio shift', () => {
    const rows = [
      { tag: 'v0.1.0', rollup: { rootFlat: 10, stable: 8, advanced: 1, internal: 1 } },
      { tag: 'v0.2.0', rollup: { rootFlat: 24, stable: 20, advanced: 2, internal: 2 } },
      { tag: 'v0.3.0', rollup: { rootFlat: 22, stable: 20, advanced: 1, internal: 1 } },
    ];
    const insights = computeTrendInsights(rows);
    expect(insights?.largestJump?.from).toBe('v0.1.0');
    expect(insights?.largestJump?.delta).toBe(14);
    expect(insights?.largestDrop?.delta).toBe(-2);
    expect(insights?.lines.some((l) => l.key === 'stable-ratio')).toBe(true);
  });

  it('returns null with fewer than two tags', () => {
    expect(computeTrendInsights([{ tag: 'v0.1.0', rollup: { rootFlat: 1, stable: 1, advanced: 0, internal: 0 } }])).toBeNull();
  });
});
