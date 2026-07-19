import { buildJsonListGuidance, limitList, resolveListLimit } from '../shared/listing.js';
import type { ListViewOptions } from '../types/cli/list.js';
import type { GraphJsonEdge, GraphJsonListDetail } from '../types/format/graphJson.js';
import type { GraphEdge } from '../types/inventory/index.js';

export function shouldIncludeGraphJsonDetail(options: {
  verbose?: boolean;
  full?: boolean;
}): boolean {
  return Boolean(options.verbose || options.full);
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

/**
 * Graph JSON edge lists use the same `-T` / `-F` policy as human graph lists.
 */
export function buildGraphJsonListDetail(
  edges: GraphEdge[],
  listView?: ListViewOptions,
): GraphJsonListDetail {
  const top = resolveListLimit(listView);
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
