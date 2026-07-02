import { describe, expect, it } from 'vitest';

import { computeGraphAnalytics, namespaceComposition } from '../../graph/analytics.js';
import { SNAPSHOT_VERSION, TOOL_VERSION } from '../../shared/constants/cache.js';
import type { InventorySnapshot } from '../../types/inventory/snapshot.js';

function minimalSnapshot(overrides: Partial<InventorySnapshot> = {}): InventorySnapshot {
  return {
    version: SNAPSHOT_VERSION,
    toolVersion: TOOL_VERSION,
    sha: 'abc',
    refLabel: 'abc',
    generatedAt: new Date().toISOString(),
    barrel: 'packages/core/src/index.ts',
    summary: {
      root: {
        flat: 0,
        namespace: 0,
        stable: 0,
        advanced: 0,
        internal: 0,
        unclassified: 0,
        custom: {},
        byTsKind: { value: 0, type: 0 },
        bySymbolKind: {},
        byCategory: {},
      },
      subpaths: [],
    },
    symbols: [],
    namespaces: [],
    edges: [],
    ...overrides,
  };
}

describe('namespaceComposition', () => {
  it('sorts namespaces by edge count and rolls up module symbols', () => {
    const snapshot = minimalSnapshot({
      namespaces: [
        {
          name: 'runtime',
          tier: 'stable',
          category: 'shared',
          targetSubpath: '.',
          sourceModule: 'packages/core/src/runtime/index.ts',
        },
        {
          name: 'analysis',
          tier: 'stable',
          category: 'run',
          targetSubpath: './analysis',
          sourceModule: 'packages/core/src/commands/analysis.ts',
        },
      ],
      symbols: [
        {
          name: 'runFoo',
          tsKind: 'value',
          exportKind: 'flat',
          tier: 'stable',
          category: 'run',
          targetSubpath: './analysis',
          symbolKind: 'function',
          sourceModule: 'packages/core/src/commands/analysis.ts',
          subpath: '.',
        },
        {
          name: 'runBar',
          tsKind: 'value',
          exportKind: 'flat',
          tier: 'stable',
          category: 'run',
          targetSubpath: './analysis',
          symbolKind: 'function',
          sourceModule: 'packages/core/src/commands/analysis.ts',
          subpath: '.',
        },
      ],
      edges: [
        {
          kind: 'namespace-reexport',
          from: '.',
          symbol: 'runtime',
          toModule: 'packages/core/src/runtime/index.ts',
          targetSubpath: '.',
        },
        {
          kind: 'namespace-reexport',
          from: '.',
          symbol: 'analysis',
          toModule: 'packages/core/src/commands/analysis.ts',
          targetSubpath: './analysis',
        },
        {
          kind: 'flat-reexport',
          from: '.',
          symbol: 'runFoo',
          toModule: 'packages/core/src/commands/analysis.ts',
          targetSubpath: './analysis',
        },
        {
          kind: 'flat-reexport',
          from: '.',
          symbol: 'runBar',
          toModule: 'packages/core/src/commands/analysis.ts',
          targetSubpath: './analysis',
        },
      ],
    });

    const rows = namespaceComposition(snapshot);
    expect(rows[0]?.name).toBe('analysis');
    expect(rows[0]?.edgeCount).toBe(3);
    expect(rows[0]?.flatSymbolCount).toBe(2);
    expect(rows[1]?.name).toBe('runtime');
    expect(rows[1]?.edgeCount).toBe(1);
  });
});

describe('computeGraphAnalytics', () => {
  it('reports density, hottest module, and fan-in', () => {
    const snapshot = minimalSnapshot({
      namespaces: [
        {
          name: 'a',
          tier: 'stable',
          category: 'run',
          targetSubpath: '.',
          sourceModule: 'src/hub.ts',
        },
        {
          name: 'b',
          tier: 'stable',
          category: 'type',
          targetSubpath: '.',
          sourceModule: 'src/hub.ts',
        },
      ],
      edges: [
        { kind: 'flat-reexport', from: '.', symbol: 'x', toModule: 'src/hub.ts', targetSubpath: '.' },
        { kind: 'flat-reexport', from: '.', symbol: 'y', toModule: 'src/hub.ts', targetSubpath: '.' },
        { kind: 'flat-reexport', from: '.', symbol: 'z', toModule: 'src/other.ts', targetSubpath: '.' },
        { kind: 'namespace-reexport', from: '.', symbol: 'a', toModule: 'src/hub.ts', targetSubpath: '.' },
      ],
    });

    const analytics = computeGraphAnalytics(snapshot);
    expect(analytics?.edgeDensity).toBe(2);
    expect(analytics?.hottestModule?.path).toBe('src/hub.ts');
    expect(analytics?.hottestModule?.count).toBe(3);
    expect(analytics?.fanInModules[0]).toEqual({ path: 'src/hub.ts', namespaceCount: 2 });
  });

  it('returns null without edges', () => {
    expect(computeGraphAnalytics(minimalSnapshot())).toBeNull();
  });
});
