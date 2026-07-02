import type { ExportCategory, GraphEdge, InventorySnapshot } from '../types/inventory/snapshot.js';
import type {
  GraphAnalytics,
  GraphFanInModule,
  GraphModuleRef,
  GraphNamespaceComposition,
  GraphNamespaceTierMix,
} from '../types/graph/analytics.js';

function edgeCountByModule(edges: GraphEdge[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const edge of edges) {
    counts.set(edge.toModule, (counts.get(edge.toModule) ?? 0) + 1);
  }
  return counts;
}

function topModule(counts: Map<string, number>): GraphModuleRef | undefined {
  let best: GraphModuleRef | undefined;
  for (const [path, count] of counts) {
    if (!best || count > best.count) best = { path, count };
  }
  return best;
}

function rollTier(mix: GraphNamespaceTierMix, tier: string): void {
  if (tier === 'stable') mix.stable += 1;
  else if (tier === 'advanced') mix.advanced += 1;
  else if (tier === 'internal') mix.internal += 1;
  else mix.unclassified += 1;
}

function topCategories(counts: Map<ExportCategory, number>, limit = 3): GraphNamespaceComposition['topCategories'] {
  return [...counts.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([category, count]) => ({ category, count }));
}

export function namespaceComposition(snapshot: InventorySnapshot): GraphNamespaceComposition[] {
  return snapshot.namespaces
    .map((ns) => {
      const module = ns.sourceModule;
      const moduleEdges = module ? snapshot.edges.filter((edge) => edge.toModule === module) : [];
      const flats = module ? snapshot.symbols.filter((symbol) => symbol.sourceModule === module) : [];
      const byTier: GraphNamespaceTierMix = {
        stable: 0,
        advanced: 0,
        internal: 0,
        unclassified: 0,
      };
      const byCategory = new Map<ExportCategory, number>();

      rollTier(byTier, ns.tier);
      byCategory.set(ns.category, (byCategory.get(ns.category) ?? 0) + 1);

      for (const symbol of flats) {
        rollTier(byTier, symbol.tier);
        byCategory.set(symbol.category, (byCategory.get(symbol.category) ?? 0) + 1);
      }

      return {
        name: ns.name,
        targetSubpath: ns.targetSubpath,
        module,
        tier: ns.tier,
        category: ns.category,
        edgeCount: moduleEdges.length,
        flatSymbolCount: flats.length,
        byTier,
        topCategories: topCategories(byCategory),
      };
    })
    .sort((a, b) => b.edgeCount - a.edgeCount || a.name.localeCompare(b.name));
}

function fanInModules(snapshot: InventorySnapshot): GraphFanInModule[] {
  const namespacesByModule = new Map<string, Set<string>>();
  for (const ns of snapshot.namespaces) {
    if (!ns.sourceModule) continue;
    let names = namespacesByModule.get(ns.sourceModule);
    if (!names) {
      names = new Set();
      namespacesByModule.set(ns.sourceModule, names);
    }
    names.add(ns.name);
  }

  return [...namespacesByModule.entries()]
    .filter(([, names]) => names.size > 1)
    .map(([path, names]) => ({ path, namespaceCount: names.size }))
    .sort((a, b) => b.namespaceCount - a.namespaceCount || a.path.localeCompare(b.path));
}

export function computeGraphAnalytics(snapshot: InventorySnapshot): GraphAnalytics | null {
  if (!snapshot.edges.length) return null;

  const counts = edgeCountByModule(snapshot.edges);
  const uniqueModules = counts.size;
  const namespaceEdgeCount = snapshot.edges.filter((edge) => edge.kind === 'namespace-reexport').length;
  const flatEdgeCount = snapshot.edges.length - namespaceEdgeCount;

  return {
    edgeCount: snapshot.edges.length,
    uniqueModules,
    edgeDensity: uniqueModules ? Math.round((snapshot.edges.length / uniqueModules) * 100) / 100 : 0,
    namespaceCount: snapshot.namespaces.length,
    flatEdgeCount,
    namespaceEdgeCount,
    hottestModule: topModule(counts),
    fanInModules: fanInModules(snapshot),
    namespaces: namespaceComposition(snapshot),
  };
}
