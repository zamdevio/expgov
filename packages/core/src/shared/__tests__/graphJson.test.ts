import { describe, expect, it } from 'vitest';
import {
  buildGraphJsonListDetail,
  shouldIncludeGraphJsonDetail,
  toGraphJsonEdges,
} from '../../format/graphJson.js';
import type { GraphEdge } from '../../types/inventory/index.js';

function edge(partial: Partial<GraphEdge> & Pick<GraphEdge, 'symbol' | 'toModule'>): GraphEdge {
  return {
    kind: 'flat-reexport',
    from: 'packages/core/src/index.ts',
    targetSubpath: './commands',
    ...partial,
  };
}

describe('graphJson detail helpers', () => {
  it('includes detail for -v, -F, or --names-only', () => {
    expect(shouldIncludeGraphJsonDetail({})).toBe(false);
    expect(shouldIncludeGraphJsonDetail({ verbose: true })).toBe(true);
    expect(shouldIncludeGraphJsonDetail({ full: true })).toBe(true);
    expect(shouldIncludeGraphJsonDetail({ namesOnly: true })).toBe(true);
  });

  it('sorts edges by module then symbol', () => {
    const edges = toGraphJsonEdges([
      edge({ symbol: 'zeta', toModule: 'b.ts' }),
      edge({ symbol: 'alpha', toModule: 'a.ts' }),
      edge({ symbol: 'beta', toModule: 'a.ts', kind: 'namespace-reexport' }),
    ]);
    expect(edges.map((e) => `${e.toModule}:${e.symbol}`)).toEqual([
      'a.ts:alpha',
      'a.ts:beta',
      'b.ts:zeta',
    ]);
  });

  it('applies the same -T/-F list policy and listGuidance', () => {
    const edges = Array.from({ length: 15 }, (_, i) =>
      edge({ symbol: `sym${String(i).padStart(2, '0')}`, toModule: 'mod.ts' }),
    );

    const truncated = buildGraphJsonListDetail(edges, { top: 5 });
    expect(truncated.top).toBe(5);
    expect(truncated.edges).toHaveLength(5);
    expect(truncated.edgesHidden).toBe(10);
    expect(truncated.listGuidance.truncated).toBe(true);
    expect(truncated.listGuidance.note).toContain('edges: 10 more hidden (showing 5 of 15)');

    const full = buildGraphJsonListDetail(edges, { full: true });
    expect(full.top).toBe(Infinity);
    expect(full.edges).toHaveLength(15);
    expect(full.edgesHidden).toBe(0);
    expect(full.listGuidance).toEqual({ truncated: false });
  });

  it('emits unique sorted symbol names with --names-only', () => {
    const edges = [
      edge({ symbol: 'zeta', toModule: 'b.ts' }),
      edge({ symbol: 'alpha', toModule: 'a.ts' }),
      edge({ symbol: 'alpha', toModule: 'c.ts' }),
    ];
    const detail = buildGraphJsonListDetail(edges, { namesOnly: true, full: true });
    expect(detail.namesOnly).toBe(true);
    expect(detail.edges).toEqual(['alpha', 'zeta']);
  });
});
