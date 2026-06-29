import type { InventorySnapshot } from '../types/inventory/snapshot.js';
import type { InsightLine, InventoryInsights } from '../types/insights/index.js';
import { countByModule, medianOf, topModule, trimInsightLines } from './common.js';

function edgeCountByModule(snapshot: InventorySnapshot): Map<string, number> {
  const counts = new Map<string, number>();
  for (const edge of snapshot.edges) {
    counts.set(edge.toModule, (counts.get(edge.toModule) ?? 0) + 1);
  }
  return counts;
}

function symbolCountByModule(snapshot: InventorySnapshot): Map<string, number> {
  return countByModule(snapshot.symbols.map((sym) => sym.sourceModule));
}

export function computeInventoryInsights(snapshot: InventorySnapshot): InventoryInsights {
  const lines: InsightLine[] = [];
  const edgeCounts = edgeCountByModule(snapshot);
  const symbolCounts = symbolCountByModule(snapshot);

  const largestByEdges = topModule(edgeCounts);
  if (largestByEdges) {
    const symbolCount = symbolCounts.get(largestByEdges.path) ?? 0;
    lines.push({
      key: 'largest-module',
      text: `largest module: ${largestByEdges.path} (${largestByEdges.count} edges, ${symbolCount} flats)`,
    });
  }

  const moduleExportCounts = [...symbolCounts.values()];
  const trackedModuleCount = symbolCounts.size;
  const median = medianOf(moduleExportCounts);
  if (median !== undefined && trackedModuleCount >= 3) {
    lines.push({
      key: 'median-exports-per-module',
      text: `median ${median} flat export(s)/module (${trackedModuleCount} modules)`,
    });
  }

  const rootUnclassified = snapshot.summary.root.unclassified;
  if (rootUnclassified > 0) {
    lines.push({
      key: 'root-unclassified',
      text: `${rootUnclassified} unclassified flat export(s) on root — run expgov validate`,
    });
  }

  const namespaceCount = snapshot.namespaces.length;
  if (namespaceCount > 0) {
    lines.push({
      key: 'namespace-exports',
      text: `${namespaceCount} namespace export(s) on root barrel`,
    });
  }

  const sdkUnclassified = snapshot.summary.subpaths.reduce(
    (sum, sp) => sum + sp.byTier.unclassified,
    snapshot.summary.root.unclassified,
  );
  if (sdkUnclassified > 0 && rootUnclassified === 0) {
    lines.push({
      key: 'subpath-unclassified',
      text: `${sdkUnclassified} unclassified export(s) across subpaths`,
    });
  }

  return trimInsightLines({
    lines,
    largestModule: largestByEdges
      ? { path: largestByEdges.path, count: largestByEdges.count }
      : undefined,
    medianExportsPerModule: median,
    trackedModuleCount: trackedModuleCount || undefined,
    rootNamespaceExports: namespaceCount || undefined,
  });
}
