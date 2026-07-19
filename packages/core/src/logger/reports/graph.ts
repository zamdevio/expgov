
import { boldDim, style } from '../../runtime/style.js';

import type { CacheStatus } from '../../types/cache/index.js';
import type { SourceRef } from '../../types/git/index.js';
import type { GraphAnalytics } from '../../types/graph/analytics.js';
import type { InventorySnapshot } from '../../types/inventory/index.js';
import { limitList, resolveListLimit } from '../../shared/listing.js';
import type { ListViewOptions } from '../../types/cli/list.js';
import type {
  GraphModuleGroup,
  GraphTargetSubpathGroup,
} from '../../types/commands/graph.js';
import { computeGraphInsights } from '../../insights/index.js';
import { formatAppliedFiltersMeta, toFilterOptions } from '../../shared/filters.js';
import { formatCacheMetaLine, logLine, logListSection, logListTruncation, logSectionEmpty, printMeta, refLine } from '../report.js';
import { printPublishedSubpathRollups } from './inventory.js';
import { printInsightsBlock } from './insights.js';
import {
  formatNamespaceCompositionLine,
  formatNamespacePrimaryLine,
  printGraphSummaryBlock,
} from './graph/summary.js';

export function printGraphReport(input: {
  ref: SourceRef;
  snapshot: InventorySnapshot;
  cache: CacheStatus;
  targetGroups: GraphTargetSubpathGroup[];
  topModules: GraphModuleGroup[];
  analytics: GraphAnalytics | null;
  verbose?: boolean;
  listView?: ListViewOptions;
  insights?: ReturnType<typeof computeGraphInsights>;
}): void {
  const listLimit = resolveListLimit(input.listView);
  const namesOnly = Boolean(input.listView?.namesOnly);
  const namespaces = limitList(input.analytics?.namespaces ?? [], listLimit);
  const targetGroups = limitList(input.targetGroups, listLimit);
  const topModules = limitList(input.topModules, listLimit);

  printMeta({
    ref: refLine(input.ref, input.snapshot),
    cache: formatCacheMetaLine(input.cache, input.snapshot.sha),
    edges: style.dim(String(input.snapshot.edges.length)),
    symbols: style.dim(String(input.snapshot.symbols.length)),
    namespaces: style.dim(String(input.snapshot.namespaces.length)),
    subpaths: style.dim(String(input.snapshot.summary.subpaths.length)),
    filters: formatAppliedFiltersMeta(toFilterOptions(input.listView)),
  });

  logLine('');
  logListSection(
    'Root namespaces',
    namespaces.items,
    'No root namespace exports.',
    (ns) => {
      if (namesOnly) {
        logLine(`       ${style.dim('·')} ${ns.name}`);
        return;
      }
      const primary = formatNamespacePrimaryLine(ns);
      logLine(
        `       ${style.dim('·')} ${primary.name.padEnd(18)} ${primary.sizeLabel.padStart(8)}  ${primary.moduleLabel} ${style.dim('·')} ${primary.targetSubpath}`,
      );
      const composition = formatNamespaceCompositionLine(ns, input.verbose);
      if (composition) {
        logLine(`       ${style.dim('     ')}${style.dim(composition)}`);
      }
    },
    namespaces.hiddenCount,
  );

  if (!namesOnly) {
    logLine('');
    logLine(boldDim('       Re-export targets (governance map)'));
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

    const published = limitList(input.snapshot.summary.subpaths, listLimit);
    printPublishedSubpathRollups(published.items, 'Published npm subpaths', published.hiddenCount);
  }

  logLine('');
  logListSection(
    namesOnly ? 'Source modules' : 'Top source modules (edge count)',
    topModules.items,
    'No source modules in the re-export graph.',
    (mod) => {
      if (namesOnly) {
        logLine(`       ${style.dim('·')} ${mod.module}`);
        return;
      }
      logLine(
        `       ${style.dim('·')} ${mod.edges.toString().padStart(4)}  ${mod.module} ${style.dim(`(${mod.edgeProvenance})`)}`,
      );
      if (input.verbose && mod.symbols.length) {
        logLine(`       ${style.dim('     e.g.')} ${mod.symbols.join(', ')}`);
      }
    },
    topModules.hiddenCount,
  );

  if (!namesOnly) printGraphSummaryBlock(input.analytics);

  const insights = input.insights ?? computeGraphInsights(input.snapshot);
  if (insights && !namesOnly) printInsightsBlock(insights.lines);
}
