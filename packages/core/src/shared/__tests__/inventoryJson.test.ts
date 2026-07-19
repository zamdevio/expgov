import { describe, expect, it } from 'vitest';
import {
  buildInventoryJsonListDetail,
  shouldIncludeInventoryJsonDetail,
  toInventoryJsonNamespaces,
  toInventoryJsonSymbols,
} from '../../format/inventoryJson.js';
import type { InventoryNamespace, InventorySymbol } from '../../types/inventory/index.js';

function flatSym(partial: Partial<InventorySymbol> & Pick<InventorySymbol, 'name'>): InventorySymbol {
  return {
    tsKind: 'value',
    exportKind: 'flat',
    tier: 'stable',
    category: 'other',
    targetSubpath: './math',
    symbolKind: 'function',
    sourceModule: 'src/math.ts',
    subpath: '.',
    ...partial,
  };
}

describe('inventoryJson detail helpers', () => {
  it('includes detail for -v or -F only', () => {
    expect(shouldIncludeInventoryJsonDetail({})).toBe(false);
    expect(shouldIncludeInventoryJsonDetail({ verbose: true })).toBe(true);
    expect(shouldIncludeInventoryJsonDetail({ full: true })).toBe(true);
    expect(shouldIncludeInventoryJsonDetail({ verbose: true, full: true })).toBe(true);
  });

  it('maps root flat symbols and skips namespaces in symbols[]', () => {
    const symbols = [
      flatSym({ name: 'zeta', sourceModule: null }),
      flatSym({ name: 'alpha', tier: 'internal', category: 'run', symbolKind: 'const' }),
      {
        ...flatSym({ name: 'Ns' }),
        exportKind: 'namespace' as const,
        symbolKind: 'namespace' as const,
      },
    ];

    expect(toInventoryJsonSymbols(symbols)).toEqual([
      {
        name: 'alpha',
        tier: 'internal',
        category: 'run',
        symbolKind: 'const',
        targetSubpath: './math',
        module: 'src/math.ts',
      },
      {
        name: 'zeta',
        tier: 'stable',
        category: 'other',
        symbolKind: 'function',
        targetSubpath: './math',
      },
    ]);
  });

  it('maps namespaces with empty module when source is null', () => {
    const namespaces: InventoryNamespace[] = [
      {
        name: 'Beta',
        tier: 'stable',
        category: 'other',
        targetSubpath: './beta',
        sourceModule: 'src/beta.ts',
      },
      {
        name: 'Alpha',
        tier: 'advanced',
        category: 'namespace-mirror',
        targetSubpath: './alpha',
        sourceModule: null,
      },
    ];

    expect(toInventoryJsonNamespaces(namespaces)).toEqual([
      {
        name: 'Alpha',
        targetSubpath: './alpha',
        module: '',
        tier: 'advanced',
      },
      {
        name: 'Beta',
        targetSubpath: './beta',
        module: 'src/beta.ts',
        tier: 'stable',
      },
    ]);
  });

  it('applies the same -T/-F list policy as human verbose lists', () => {
    const symbols = Array.from({ length: 15 }, (_, i) =>
      flatSym({ name: `sym${String(i).padStart(2, '0')}` }),
    );
    const namespaces: InventoryNamespace[] = Array.from({ length: 12 }, (_, i) => ({
      name: `Ns${String(i).padStart(2, '0')}`,
      tier: 'stable',
      category: 'other',
      targetSubpath: `./ns${i}`,
      sourceModule: `src/ns${i}.ts`,
    }));

    const truncated = buildInventoryJsonListDetail({ symbols, namespaces }, { top: 5 });
    expect(truncated.top).toBe(5);
    expect(truncated.symbols).toHaveLength(5);
    expect(truncated.namespaces).toHaveLength(5);
    expect(truncated.symbolsHidden).toBe(10);
    expect(truncated.namespacesHidden).toBe(7);
    expect(truncated.symbols[0]?.name).toBe('sym00');
    expect(truncated.listGuidance.truncated).toBe(true);
    expect(truncated.listGuidance.note).toContain('-F/--full');

    const full = buildInventoryJsonListDetail({ symbols, namespaces }, { full: true });
    expect(full.top).toBe(Infinity);
    expect(full.symbols).toHaveLength(15);
    expect(full.namespaces).toHaveLength(12);
    expect(full.symbolsHidden).toBe(0);
    expect(full.namespacesHidden).toBe(0);
    expect(full.listGuidance).toEqual({ truncated: false });
  });
});
