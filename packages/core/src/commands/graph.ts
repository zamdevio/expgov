import type { GraphEdge, InventoryNamespace, InventorySnapshot } from '../inventory/index.js';
import { getSnapshot } from '../cache/index.js';
import { resolveSourceRef } from '../git/index.js';
import { formatModuleEdgeProvenance } from '../logger/format.js';
import { printGraphReport } from '../logger/index.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';
import { resolveListLimit } from '../shared/listing.js';
import type { GraphCliOptions } from '../types/commands/cli.js';

interface TargetSubpathGroup {
  targetSubpath: string;
  flat: number;
  namespace: number;
  modules: Map<string, number>;
}

interface ModuleGroup {
  module: string;
  edges: number;
  symbols: string[];
  edgeProvenance: string;
}

function moduleEdgeKinds(edges: GraphEdge[], module: string): { hasFlatReexport: boolean; hasNamespaceReexport: boolean } {
  const moduleEdges = edges.filter((edge) => edge.toModule === module);
  return {
    hasFlatReexport: moduleEdges.some((edge) => edge.kind === 'flat-reexport'),
    hasNamespaceReexport: moduleEdges.some((edge) => edge.kind === 'namespace-reexport'),
  };
}

function groupByTargetSubpath(snapshot: InventorySnapshot): TargetSubpathGroup[] {
  const map = new Map<string, TargetSubpathGroup>();

  const touch = (targetSubpath: string): TargetSubpathGroup => {
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

function topModules(edges: GraphEdge[], limit: number): ModuleGroup[] {
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
    .sort((a, b) => b.edges - a.edges)
    .slice(0, limit);
}

function namespaceRows(namespaces: InventoryNamespace[]): { name: string; targetSubpath: string; module: string | null }[] {
  return namespaces
    .map((ns) => ({ name: ns.name, targetSubpath: ns.targetSubpath, module: ns.sourceModule }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function runExportsGraph(options: GraphCliOptions = {}): void {
  const timer = beginCommand('graph');
  const ref = resolveSourceRef(options.ref);
  const { snapshot, cache } = getSnapshot(ref, {
    noCache: options.noCache,
    force: options.force,
    profile: 'full',
  });

  const targetGroups = groupByTargetSubpath(snapshot);
  const listLimit = resolveListLimit(options);
  const top = topModules(snapshot.edges, listLimit);
  const namespaces = namespaceRows(snapshot.namespaces);

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
    namespaces,
    verbose: options.verbose,
    listView: options,
  });

  finishCommand({
    command: 'graph',
    timer,
    status: 'ok',
    footer: {
      counts: {
        edges: snapshot.edges.length,
        symbols: snapshot.symbols.length,
      },
    },
  });
}
