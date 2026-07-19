import { describe, expect, it } from 'vitest';
import {
  filterByTierCategory,
  filterEdgesBySymbolMeta,
  filterSnapshotView,
  hasActiveFilters,
  matchesTierCategory,
  toFilterOptions,
} from '../filters.js';
import { SNAPSHOT_VERSION, TOOL_VERSION } from '../constants/cache.js';
import { emptyTierCounts } from '../../inventory/tierCounts.js';
import type { GraphEdge, InventorySnapshot, InventorySymbol } from '../../types/inventory/index.js';

function sym(
  partial: Partial<InventorySymbol> & Pick<InventorySymbol, 'name' | 'tier' | 'category'>,
): InventorySymbol {
  return {
    tsKind: 'value',
    exportKind: 'flat',
    targetSubpath: '.',
    symbolKind: 'function',
    sourceModule: 'src/x.ts',
    subpath: '.',
    ...partial,
  };
}

function edge(symbol: string, toModule = 'src/x.ts'): GraphEdge {
  return {
    kind: 'flat-reexport',
    from: 'src/index.ts',
    symbol,
    toModule,
    targetSubpath: '.',
  };
}

function miniSnapshot(symbols: InventorySymbol[], edges: GraphEdge[] = []): InventorySnapshot {
  return {
    version: SNAPSHOT_VERSION,
    toolVersion: TOOL_VERSION,
    sha: 'abc',
    refLabel: 'test',
    generatedAt: '2026-01-01T00:00:00.000Z',
    barrel: 'src/index.ts',
    symbols,
    namespaces: [
      {
        name: 'NsStable',
        tier: 'stable',
        category: 'run',
        targetSubpath: './ns',
        sourceModule: 'src/ns.ts',
      },
      {
        name: 'NsInternal',
        tier: 'internal',
        category: 'config',
        targetSubpath: './ns2',
        sourceModule: 'src/ns2.ts',
      },
    ],
    edges,
    summary: {
      root: {
        flat: symbols.length,
        namespace: 2,
        ...emptyTierCounts(),
        byTsKind: { value: symbols.length, type: 0 },
        bySymbolKind: {},
        byCategory: {},
      },
      subpaths: [],
    },
  };
}

describe('shared filters', () => {
  it('detects active filters', () => {
    expect(hasActiveFilters(undefined)).toBe(false);
    expect(hasActiveFilters({ tier: [] })).toBe(false);
    expect(hasActiveFilters({ tier: ['stable'] })).toBe(true);
    expect(hasActiveFilters({ category: ['run'] })).toBe(true);
  });

  it('matches tier and category (AND across dimensions, OR within)', () => {
    const row = { tier: 'stable', category: 'run' };
    expect(matchesTierCategory(row, { tier: ['stable', 'internal'] })).toBe(true);
    expect(matchesTierCategory(row, { tier: ['internal'] })).toBe(false);
    expect(matchesTierCategory(row, { category: ['run', 'config'] })).toBe(true);
    expect(matchesTierCategory(row, { tier: ['stable'], category: ['config'] })).toBe(false);
  });

  it('filters symbols and edges via symbol join', () => {
    const symbols = [
      sym({ name: 'a', tier: 'stable', category: 'run' }),
      sym({ name: 'b', tier: 'internal', category: 'config' }),
    ];
    expect(filterByTierCategory(symbols, { tier: ['stable'] }).map((s) => s.name)).toEqual(['a']);

    const edges = [edge('a'), edge('b'), edge('missing')];
    expect(
      filterEdgesBySymbolMeta(edges, symbols, { category: ['run'] }).map((e) => e.symbol),
    ).toEqual(['a']);
  });

  it('builds a filtered snapshot view without mutating the original', () => {
    const symbols = [
      sym({ name: 'a', tier: 'stable', category: 'run' }),
      sym({ name: 'b', tier: 'internal', category: 'config' }),
    ];
    const snapshot = miniSnapshot(symbols, [edge('a'), edge('b')]);
    const view = filterSnapshotView(snapshot, { tier: ['stable'] });
    expect(view.symbols.map((s) => s.name)).toEqual(['a']);
    expect(view.namespaces.map((n) => n.name)).toEqual(['NsStable']);
    expect(view.edges.map((e) => e.symbol)).toEqual(['a']);
    expect(snapshot.symbols).toHaveLength(2);
  });

  it('normalizes list-view filter fields', () => {
    expect(toFilterOptions({ top: 5, tier: [], category: [] })).toBeUndefined();
    expect(toFilterOptions({ tier: ['stable'], category: ['run'] })).toEqual({
      tier: ['stable'],
      category: ['run'],
    });
  });
});
