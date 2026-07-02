import type { GraphEdge, InventorySnapshot } from '../types/inventory/index.js';
import { getSnapshot } from '../cache/index.js';
import { resolveCacheOptions } from '../cache/resolveOptions.js';
import { computeGraphAnalytics } from '../graph/analytics.js';
import { resolveSourceRef } from '../git/index.js';
import { formatModuleEdgeProvenance } from '../logger/format.js';
import { printGraphReport } from '../logger/index.js';
import { computeGraphInsights } from '../insights/index.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';
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

export function runExportsGraph(options: GraphCliOptions = {}): void {
  const timer = beginCommand('graph');
  const ref = resolveSourceRef(options.ref);
  const { snapshot, cache } = getSnapshot(
    ref,
    resolveCacheOptions({ noCache: options.noCache, force: options.force, profile: 'full' }),
  );

  const targetGroups = groupByTargetSubpath(snapshot);
  const top = topModules(snapshot.edges);
  const analytics = computeGraphAnalytics(snapshot);
  const insights = computeGraphInsights(snapshot);

  if (getRunOptions().json) {
    finishCommand({
      command: 'graph',
      timer,
      status: 'ok',
      json: {
        kind: 'graph',
        ok: true,
        data: {
          ref: ref.label,
          edgeCount: snapshot.edges.length,
          targetGroups: targetGroups.map((g) => ({
            targetSubpath: g.targetSubpath,
            flat: g.flat,
            namespace: g.namespace,
          })),
          analytics,
          insights,
        },
      },
    });
    return;
  }

  printGraphReport({
    ref,
    snapshot,
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
        edges: snapshot.edges.length,
        symbols: snapshot.symbols.length,
        namespaces: snapshot.namespaces.length,
      },
    },
  });
}
