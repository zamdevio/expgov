import type { ExportCategory } from '../types/inventory/snapshot.js';
import type { InventorySnapshot } from '../types/inventory/snapshot.js';
import type { GraphInsights, InsightLine } from '../types/insights/index.js';
import { topModule, trimInsightLines } from './common.js';

function edgeCountByModule(snapshot: InventorySnapshot): Map<string, number> {
  const counts = new Map<string, number>();
  for (const edge of snapshot.edges) {
    counts.set(edge.toModule, (counts.get(edge.toModule) ?? 0) + 1);
  }
  return counts;
}

function fanOutByTarget(
  snapshot: InventorySnapshot,
): { targetSubpath: string; moduleCount: number } | undefined {
  const modulesByTarget = new Map<string, Set<string>>();
  for (const edge of snapshot.edges) {
    let modules = modulesByTarget.get(edge.targetSubpath);
    if (!modules) {
      modules = new Set();
      modulesByTarget.set(edge.targetSubpath, modules);
    }
    modules.add(edge.toModule);
  }

  let best: { targetSubpath: string; moduleCount: number } | undefined;
  for (const [targetSubpath, modules] of modulesByTarget) {
    const moduleCount = modules.size;
    if (!best || moduleCount > best.moduleCount) {
      best = { targetSubpath, moduleCount };
    }
  }
  return best;
}

function formatCategoryMix(
  byCategory: Partial<Record<ExportCategory, number>>,
  total: number,
): string | undefined {
  if (total <= 0) return undefined;
  const parts = Object.entries(byCategory)
    .filter(([, count]) => (count ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, 3)
    .map(([category, count]) => `${category} ${Math.round(((count ?? 0) / total) * 100)}%`);
  return parts.length ? parts.join(' · ') : undefined;
}

export function computeGraphInsights(snapshot: InventorySnapshot): GraphInsights {
  if (snapshot.edges.length === 0) return { lines: [] };

  const lines: InsightLine[] = [];
  const densest = topModule(edgeCountByModule(snapshot));
  if (densest) {
    lines.push({
      key: 'densest-module',
      text: `densest module: ${densest.path} (${densest.count} edges)`,
    });
  }

  const fanOut = fanOutByTarget(snapshot);
  if (fanOut && fanOut.moduleCount > 1) {
    const label = fanOut.targetSubpath === '.' ? 'root' : fanOut.targetSubpath;
    lines.push({
      key: 'fan-out',
      text: `fan-out: ${label} → ${fanOut.moduleCount} modules`,
    });
  }

  const categoryMix = formatCategoryMix(snapshot.summary.root.byCategory, snapshot.summary.root.flat);
  if (categoryMix) {
    lines.push({
      key: 'category-mix',
      text: `symbol mix: ${categoryMix}`,
    });
  }

  const namespaceEdges = snapshot.edges.filter((edge) => edge.kind === 'namespace-reexport').length;
  const flatEdges = snapshot.edges.length - namespaceEdges;
  if (namespaceEdges > 0 && flatEdges > 0) {
    lines.push({
      key: 'edge-mix',
      text: `re-exports: ${flatEdges} flat · ${namespaceEdges} namespace`,
    });
  }

  const subpathCount = new Set(snapshot.edges.map((edge) => edge.targetSubpath)).size;
  if (subpathCount > 1) {
    lines.push({
      key: 'target-subpaths',
      text: `${subpathCount} governance target subpath(s) in graph`,
    });
  }

  return trimInsightLines({
    lines,
    densestModule: densest,
    fanOut,
  });
}
