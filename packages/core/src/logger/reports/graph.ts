
import { boldDim, style } from '../../runtime/style.js';

import type { CacheStatus } from '../../types/cache/index.js';
import type { SourceRef } from '../../types/git/index.js';
import type { InventorySnapshot } from '../../types/inventory/index.js';
import { limitList, resolveListLimit } from '../../shared/listing.js';
import type { ListViewOptions } from '../../types/cli/list.js';
import type {
  GraphModuleGroup,
  GraphNamespaceRow,
  GraphTargetSubpathGroup,
} from '../../types/commands/graph.js';
import { formatNamespaceSourceLabel } from '../format.js';
import { computeGraphInsights } from '../../insights/index.js';
import { formatCacheMetaLine, logLine, logListSection, logListTruncation, logSectionEmpty, printMeta, refLine } from '../report.js';
import { printPublishedSubpathRollups } from './inventory.js';
import { printInsightsBlock } from './insights.js';

export function printGraphReport(input: {
  ref: SourceRef;
  snapshot: InventorySnapshot;
  cache: CacheStatus;
  targetGroups: GraphTargetSubpathGroup[];
  topModules: GraphModuleGroup[];
  namespaces: GraphNamespaceRow[];
  verbose?: boolean;
  listView?: ListViewOptions;
  insights?: ReturnType<typeof computeGraphInsights>;
}): void {
  const listLimit = resolveListLimit(input.listView);
  const targetGroups = limitList(input.targetGroups, listLimit);
  const namespaces = limitList(input.namespaces, listLimit);
  const topModules = limitList(input.topModules, listLimit);

  printMeta({
    ref: refLine(input.ref, input.snapshot),
    cache: formatCacheMetaLine(input.cache, input.snapshot.sha),
    edges: style.dim(String(input.snapshot.edges.length)),
    symbols: style.dim(String(input.snapshot.symbols.length)),
    subpaths: style.dim(String(input.snapshot.summary.subpaths.length)),
  });

  logLine('');
  logLine(boldDim('       Root re-export targets (governance map)'));
  logLine(style.dim(`       ${'subpath'.padEnd(22)} ${'flat'.padStart(6)} ${'ns'.padStart(4)}`));
  if (targetGroups.items.length === 0) {
    logSectionEmpty('No re-export target subpaths.');
  } else {
    for (const group of targetGroups.items) {
      logLine(
        `       ${group.targetSubpath.padEnd(22)} ${String(group.flat).padStart(6)} ${String(group.namespace).padStart(4)}`,
      );
    }
    logListTruncation(targetGroups.hiddenCount);
  }

  printPublishedSubpathRollups(input.snapshot.summary.subpaths, 'Published npm subpaths');

  logLine('');
  logListSection(
    'Root namespaces',
    namespaces.items,
    'No root namespace exports.',
    (ns) => {
      const src = style.dim(formatNamespaceSourceLabel(ns.module));
      logLine(
        `       ${style.dim('·')} ${ns.name.padEnd(18)} ${src} ${style.dim('·')} ${ns.targetSubpath}`,
      );
    },
    namespaces.hiddenCount,
  );

  logLine('');
  logListSection(
    'Top source modules (edge count)',
    topModules.items,
    'No source modules in the re-export graph.',
    (mod) => {
      logLine(
        `       ${style.dim('·')} ${mod.edges.toString().padStart(4)}  ${mod.module} ${style.dim(`(${mod.edgeProvenance})`)}`,
      );
      if (input.verbose && mod.symbols.length) {
        logLine(`       ${style.dim('     e.g.')} ${mod.symbols.join(', ')}`);
      }
    },
    topModules.hiddenCount,
  );

  const insights = input.insights ?? computeGraphInsights(input.snapshot);
  if (insights) printInsightsBlock(insights.lines);
}
