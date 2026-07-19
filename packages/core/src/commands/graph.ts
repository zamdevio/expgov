import type { GraphEdge, InventorySnapshot } from '../types/inventory/index.js';
import { getSnapshot } from '../cache/index.js';
import { resolveCacheOptions } from '../cache/resolveOptions.js';
import {
  buildGraphJsonListDetail,
  shouldIncludeGraphJsonDetail,
} from '../format/index.js';
import { computeGraphAnalytics } from '../graph/analytics.js';
import { resolveSourceRef } from '../git/index.js';
import { formatModuleEdgeProvenance } from '../logger/format.js';
import { printGraphReport } from '../logger/index.js';
import { computeGraphInsights } from '../insights/index.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';
import { filterSnapshotView, toFilterOptions } from '../shared/filters.js';
import type { GraphCliOptions } from '../types/commands/cli.js';
import type {
  GraphModuleGroup,
  GraphTargetSubpathGroup,
} from '../types/commands/graph.js';

function moduleEdgeKinds(edges: GraphEdge[], module: string): { hasFlatReexport: boolean; hasNamespaceReexport: boolean } {
  const moduleEdges = edges.filter((edge) => edge.toModule === module);
  return {
    hasFlatReexport: moduleEdges.some((edge) => edge.kind === 'flat-reexport'),
    hasNamespaceReexport: moduleEdges.some((edge) => edge.kind === 'namespace-reexport'),
  };
}

function groupByTargetSubpath(snapshot: InventorySnapshot): GraphTargetSubpathGroup[] {
  const map = new Map<string, GraphTargetSubpathGroup>();

  const touch = (targetSubpath: string): GraphTargetSubpathGroup => {
    let group = map.get(targetSubpath);
    if (!group) {
      group = { targetSubpath, flat: 0, namespace: 0, modules: new Map() };
      map.set(targetSubpath, group);
    }
    return group;
  };

  for (const edge of snapshot.edges) {
    const group = touch(edge.targetSubpath);
    if (edge.kind === 'namespace-reexport') group.namespace += 1;
    else group.flat += 1;
    group.modules.set(edge.toModule, (group.modules.get(edge.toModule) ?? 0) + 1);
  }

  return [...map.values()].sort((a, b) => b.flat + b.namespace - (a.flat + a.namespace));
}

function topModules(edges: GraphEdge[]): GraphModuleGroup[] {
  const map = new Map<string, { edges: number; symbols: string[] }>();
  for (const edge of edges) {
    const prev = map.get(edge.toModule) ?? { edges: 0, symbols: [] };
    prev.edges += 1;
    if (prev.symbols.length < 5) prev.symbols.push(edge.symbol);
    map.set(edge.toModule, prev);
  }
  return [...map.entries()]
    .map(([module, data]) => ({
      module,
      ...data,
      edgeProvenance: formatModuleEdgeProvenance(moduleEdgeKinds(edges, module)),
    }))
    .sort((a, b) => b.edges - a.edges);
}

export function runGraph(options: GraphCliOptions = {}): void {
  const timer = beginCommand('graph');
  const ref = resolveSourceRef(options.ref);
  const { snapshot, cache } = getSnapshot(
    ref,
    resolveCacheOptions({ noCache: options.noCache, force: options.force, profile: 'full' }),
  );
  // Filter the view before computing analytics or limiting lists.
  const filters = toFilterOptions(options);
  const view = filterSnapshotView(snapshot, filters);

  const targetGroups = groupByTargetSubpath(view);
  const top = topModules(view.edges);
  const analytics = computeGraphAnalytics(view);
  const insights = computeGraphInsights(view);

  if (getRunOptions().json) {
    const data: Record<string, unknown> = {
      ref: ref.label,
      edgeCount: view.edges.length,
      targetGroups: targetGroups.map((g) => ({
        targetSubpath: g.targetSubpath,
        flat: g.flat,
        namespace: g.namespace,
      })),
      analytics,
      insights,
    };
    if (filters) data.filters = filters;
    if (shouldIncludeGraphJsonDetail(options)) {
      const detail = buildGraphJsonListDetail(view.edges, options);
      data.top = detail.top;
      data.edges = detail.edges;
      data.edgesHidden = detail.edgesHidden;
      data.listGuidance = detail.listGuidance;
      if (detail.namesOnly) data.namesOnly = true;
    }
    finishCommand({
      command: 'graph',
      timer,
      status: 'ok',
      json: {
        kind: 'graph',
        ok: true,
        data,
      },
    });
    return;
  }

  printGraphReport({
    ref,
    snapshot: view,
    cache,
    targetGroups,
    topModules: top,
    analytics,
    verbose: options.verbose,
    listView: options,
    insights,
  });

  finishCommand({
    command: 'graph',
    timer,
    status: 'ok',
    footer: {
      counts: {
        edges: view.edges.length,
        symbols: view.symbols.length,
        namespaces: view.namespaces.length,
      },
    },
  });
}
