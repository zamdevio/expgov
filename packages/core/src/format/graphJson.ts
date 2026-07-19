import { buildJsonListGuidance, limitList, resolveListLimit } from '../shared/listing.js';
import type { JsonListGuidance } from '../shared/listing.js';
import type { ListViewOptions } from '../types/cli/list.js';
import type { GraphEdge } from '../types/inventory/index.js';

/** Lean edge row for `graph --json` detail (`-v` / `-F`). */
export type GraphJsonEdge = {
  kind: GraphEdge['kind'];
  from: string;
  symbol: string;
  toModule: string;
  targetSubpath: string;
};

export type GraphJsonListDetail = {
  /** Same cap as human lists (`Infinity` / `-F` → `null` after JSON.stringify). */
  top: number;
  edges: GraphJsonEdge[];
  edgesHidden: number;
  listGuidance: JsonListGuidance;
  notes: string[];
};

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
  const notes: string[] = [];
  if (listGuidance.note) notes.push(listGuidance.note);

  return {
    top,
    edges: limited.items,
    edgesHidden: limited.hiddenCount,
    listGuidance,
    notes,
  };
}
