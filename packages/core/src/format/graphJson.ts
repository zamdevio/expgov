import { buildJsonListGuidance, limitList, resolveListLimit } from '../shared/listing.js';
import type { ListViewOptions } from '../types/cli/list.js';
import type { GraphJsonEdge, GraphJsonListDetail } from '../types/format/graphJson.js';
import type { GraphEdge } from '../types/inventory/index.js';

export function shouldIncludeGraphJsonDetail(options: {
  verbose?: boolean;
  full?: boolean;
  namesOnly?: boolean;
}): boolean {
  return Boolean(options.verbose || options.full || options.namesOnly);
}

function mapEdge(edge: GraphEdge): GraphJsonEdge {
  return {
    kind: edge.kind,
    from: edge.from,
    symbol: edge.symbol,
    toModule: edge.toModule,
    targetSubpath: edge.targetSubpath,
  };
}

/** Stable sort for agent-friendly edge listings. */
export function toGraphJsonEdges(edges: GraphEdge[]): GraphJsonEdge[] {
  return edges
    .slice()
    .sort((a, b) => {
      const byModule = a.toModule.localeCompare(b.toModule);
      if (byModule !== 0) return byModule;
      const bySymbol = a.symbol.localeCompare(b.symbol);
      if (bySymbol !== 0) return bySymbol;
      return a.kind.localeCompare(b.kind);
    })
    .map(mapEdge);
}

/** Unique sorted symbol names from edges (for `--names-only`). */
export function toGraphJsonEdgeNames(edges: GraphEdge[]): string[] {
  return [...new Set(edges.map((e) => e.symbol))].sort((a, b) => a.localeCompare(b));
}

/**
 * Graph JSON edge lists use the same `-T` / `-F` policy as human graph lists.
 * `--names-only` emits unique sorted symbol names instead of lean edge objects.
 */
export function buildGraphJsonListDetail(
  edges: GraphEdge[],
  listView?: ListViewOptions,
): GraphJsonListDetail {
  const top = resolveListLimit(listView);
  const namesOnly = Boolean(listView?.namesOnly);

  if (namesOnly) {
    const limited = limitList(toGraphJsonEdgeNames(edges), top);
    return {
      top,
      namesOnly: true,
      edges: limited.items,
      edgesHidden: limited.hiddenCount,
      listGuidance: buildJsonListGuidance([
        { name: 'edges', shown: limited.items.length, hidden: limited.hiddenCount },
      ]),
    };
  }

  const limited = limitList(toGraphJsonEdges(edges), top);
  const listGuidance = buildJsonListGuidance([
    { name: 'edges', shown: limited.items.length, hidden: limited.hiddenCount },
  ]);

  return {
    top,
    edges: limited.items,
    edgesHidden: limited.hiddenCount,
    listGuidance,
  };
}
