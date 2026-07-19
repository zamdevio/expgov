import { describe, expect, it } from 'vitest';
import {
  filterByTierCategory,
  filterEdgesBySymbolMeta,
  filterNamespaces,
  filterSnapshotView,
  filterSymbols,
  formatAppliedFiltersMeta,
  hasActiveFilters,
  matchesSubpath,
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

function edge(
  symbol: string,
  toModule = 'src/x.ts',
  targetSubpath = '.',
): GraphEdge {
  return {
    kind: 'flat-reexport',
    from: 'src/index.ts',
    symbol,
    toModule,
    targetSubpath,
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
    expect(hasActiveFilters({ namespace: ['Ns'] })).toBe(true);
    expect(hasActiveFilters({ module: ['src/'] })).toBe(true);
    expect(hasActiveFilters({ subpath: ['./types'] })).toBe(true);
  });

  it('matches tier and category (AND across dimensions, OR within)', () => {
    const row = { tier: 'stable', category: 'run' };
    expect(matchesTierCategory(row, { tier: ['stable', 'internal'] })).toBe(true);
    expect(matchesTierCategory(row, { tier: ['internal'] })).toBe(false);
    expect(matchesTierCategory(row, { category: ['run', 'config'] })).toBe(true);
    expect(matchesTierCategory(row, { tier: ['stable'], category: ['config'] })).toBe(false);
  });

  it('matches subpath aliases', () => {
    expect(matchesSubpath('./types', ['types'])).toBe(true);
    expect(matchesSubpath('./types', ['./types'])).toBe(true);
    expect(matchesSubpath('./config', ['types'])).toBe(false);
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

  it('filters by module substring and target subpath', () => {
    const symbols = [
      sym({ name: 'a', tier: 'stable', category: 'run', sourceModule: 'packages/core/src/run.ts', targetSubpath: './commands' }),
      sym({ name: 'b', tier: 'stable', category: 'type', sourceModule: 'packages/core/src/types/x.ts', targetSubpath: './types' }),
    ];
    expect(
      filterSymbols(symbols, { module: ['/types/'] }).map((s) => s.name),
    ).toEqual(['b']);
    expect(
      filterSymbols(symbols, { subpath: ['types'] }).map((s) => s.name),
    ).toEqual(['b']);

    const edges = [
      edge('a', 'packages/core/src/run.ts', '.'),
      edge('b', 'packages/core/src/types/x.ts', '.'),
    ];
    expect(
      filterEdgesBySymbolMeta(edges, symbols, { module: ['types/'] }).map((e) => e.symbol),
    ).toEqual(['b']);
    expect(
      filterEdgesBySymbolMeta(edges, symbols, { subpath: ['./types'] }).map((e) => e.symbol),
    ).toEqual(['b']);
  });

  it('filters namespaces by name and keeps matching module symbols', () => {
    const symbols = [
      sym({ name: 'helper', tier: 'stable', category: 'run', sourceModule: 'src/ns.ts' }),
      sym({ name: 'other', tier: 'stable', category: 'run', sourceModule: 'src/other.ts' }),
    ];
    const snapshot = miniSnapshot(symbols, [
      edge('helper', 'src/ns.ts'),
      edge('other', 'src/other.ts'),
      { kind: 'namespace-reexport', from: 'src/index.ts', symbol: 'NsStable', toModule: 'src/ns.ts', targetSubpath: './ns' },
    ]);
    const view = filterSnapshotView(snapshot, { namespace: ['NsStable'] });
    expect(filterNamespaces(snapshot.namespaces, { namespace: ['NsStable'] }).map((n) => n.name)).toEqual([
      'NsStable',
    ]);
    expect(view.symbols.map((s) => s.name)).toEqual(['helper']);
    expect(view.edges.map((e) => e.symbol).sort()).toEqual(['NsStable', 'helper']);
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
    expect(toFilterOptions({ top: 5, tier: [], category: [], namespace: [], module: [], subpath: [] })).toBeUndefined();
    expect(
      toFilterOptions({
        tier: ['stable'],
        category: ['run'],
        namespace: ['Ns'],
        module: ['src/'],
        subpath: ['./types'],
      }),
    ).toEqual({
      tier: ['stable'],
      category: ['run'],
      namespace: ['Ns'],
      module: ['src/'],
      subpath: ['./types'],
    });
  });

  it('formats applied filters meta and omits empty keys', () => {
    expect(formatAppliedFiltersMeta(undefined)).toBeUndefined();
    expect(formatAppliedFiltersMeta({})).toBeUndefined();
    expect(formatAppliedFiltersMeta({ tier: ['stable'], module: ['commands'] })).toBe(
      'tier=stable · module=commands',
    );
    expect(formatAppliedFiltersMeta({ tier: ['stable', 'advanced'], category: ['run'] })).toBe(
      'tier=stable,advanced · category=run',
    );
  });
});
