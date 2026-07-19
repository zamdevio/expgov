import { computeInventoryInsights } from '../../insights/index.js';
import { VERBOSE_INVENTORY_ROW_PREFIX } from '../../shared/constants/inventory.js';
import { boldDim, style, tierStyle } from '../../runtime/style.js';
import type { SnapshotResult } from '../../types/cache/index.js';
import type { SourceRef } from '../../types/git/index.js';
import type { InventorySnapshot, SubpathRollup } from '../../types/inventory/index.js';
import { sumSdkTierCounts } from '../../inventory/index.js';
import {
  filterByTierCategory,
  hasActiveFilters,
  toFilterOptions,
} from '../../shared/filters.js';
import { limitList, resolveListLimit } from '../../shared/listing.js';
import type { ListViewOptions } from '../../types/cli/list.js';
import {
  formatInventoryCategory,
  formatInventoryName,
  formatInventorySymbolKind,
  formatInventoryTier,
  formatNamespaceSourceLabel,
  formatTierProvenanceLabel,
  formatVerboseInventoryHeader,
} from '../format.js';
import {
  formatCacheMetaLine,
  logLine,
  logListSection,
  logListTruncation,
  logSectionEmpty,
  padLabel,
  printMeta,
  refLine,
  canEmitVerboseReport,
} from '../report.js';
import { printSdkWideTiers, printTierRollupLines } from './tierRollup.js';
import { printInsightsBlock } from './insights.js';

function formatSubpathRollupLine(sp: SubpathRollup): string {
  const tierParts = [
    sp.byTier.stable ? `stable ${sp.byTier.stable}` : '',
    sp.byTier.advanced ? `adv ${sp.byTier.advanced}` : '',
    sp.byTier.internal ? `int ${sp.byTier.internal}` : '',
    ...Object.entries(sp.byTier.custom)
      .filter(([, count]) => count > 0)
      .map(([name, count]) => `${name} ${count}`),
    sp.byTier.unclassified ? `uncls ${sp.byTier.unclassified}` : '',
  ].filter(Boolean);
  const tiers = tierParts.length ? style.dim(` · ${tierParts.join(' · ')}`) : '';
  return `       ${style.dim('·')} ${sp.npmSubpath.padEnd(32)} flat ${String(sp.flat).padStart(4)}  ns ${String(sp.namespace).padStart(3)}${tiers}`;
}

export function printPublishedSubpathRollups(subpaths: SubpathRollup[], title = 'Published subpaths (rollup)'): void {
  if (!subpaths.length) return;
  logLine('');
  logLine(boldDim(`       ${title}`));
  for (const sp of subpaths) logLine(formatSubpathRollupLine(sp));
}

export function printInventoryReport(input: {
  ref: SourceRef;
  result: SnapshotResult;
  gitStats?: string;
  listView?: ListViewOptions;
}): void {
  const { ref, result } = input;
  const { snapshot, cache, barrelPath } = result;

  printMeta({
    ref: refLine(ref, snapshot),
    barrel: style.dim(barrelPath),
    cache: formatCacheMetaLine(cache, snapshot.sha),
    generated: style.dim(new Date(snapshot.generatedAt).toISOString()),
    commit: snapshot.git?.commitDate ? style.dim(snapshot.git.commitDate) : undefined,
    edges: style.dim(String(snapshot.edges.length)),
    subpaths: style.dim(String(snapshot.summary.subpaths.length)),
    git: input.gitStats ? style.dim(input.gitStats) : undefined,
  });

  logLine('');
  logLine(boldDim('       Root barrel tiers'));
  const r = snapshot.summary.root;
  logLine(`       ${padLabel('root flat')} ${style.white(String(r.flat))}`);
  logLine(`       ${padLabel('namespace')} ${style.white(String(r.namespace))}`);
  const listLimit = resolveListLimit(input.listView);
  printTierRollupLines(r, listLimit);

  printSdkWideTiers(sumSdkTierCounts(snapshot), listLimit);
  printPublishedSubpathRollups(snapshot.summary.subpaths);

  const topCategories = limitList(
    Object.entries(r.byCategory ?? {}).sort((a, b) => b[1] - a[1]),
    listLimit,
  );
  if (topCategories.items.length) {
    logLine('');
    logLine(boldDim('       Top categories'));
    for (const [cat, count] of topCategories.items) {
      logLine(`       ${padLabel(cat, 14)} ${style.white(String(count))}`);
    }
    logListTruncation(topCategories.hiddenCount);
  }

  printInsightsBlock(computeInventoryInsights(snapshot).lines);
}

export function printVerboseInventory(snapshot: InventorySnapshot, listView?: ListViewOptions): void {
  if (!canEmitVerboseReport()) return;
  const filters = toFilterOptions(listView);
  const listLimit = resolveListLimit(listView);
  const flat = limitList(
    filterByTierCategory(
      [...snapshot.symbols].sort((a, b) => a.name.localeCompare(b.name)),
      filters,
    ),
    listLimit,
  );

  logLine('');
  logLine(boldDim('       Symbols (root flat)'));
  if (flat.items.length === 0) {
    logSectionEmpty(
      hasActiveFilters(filters)
        ? 'No matching root flat exports. Published subpaths are summarized above.'
        : 'No root flat exports.',
    );
  } else {
    logLine(style.dim(`${VERBOSE_INVENTORY_ROW_PREFIX}${formatVerboseInventoryHeader()}`));
    for (const sym of flat.items) {
      const tierPlain = formatInventoryTier(sym.tier);
      const tier = tierStyle(sym.tier)(tierPlain);
      const category = style.accent(formatInventoryCategory(sym.category));
      const symbolKind = style.white(formatInventorySymbolKind(sym.symbolKind));
      const provenanceLabel = sym.tierProvenance?.kind === 'tag'
        ? style.accent(formatTierProvenanceLabel(sym.tierProvenance))
        : style.dim(formatTierProvenanceLabel(sym.tierProvenance));
      logLine(
        `${VERBOSE_INVENTORY_ROW_PREFIX}${formatInventoryName(sym.name)} ${tier} ${category} ${symbolKind} ${style.dim(sym.targetSubpath)} ${style.dim('[')}${provenanceLabel}${style.dim(']')}`,
      );
    }
    logListTruncation(flat.hiddenCount);
  }

  logLine('');
  const namespaces = limitList(
    filterByTierCategory(
      [...snapshot.namespaces].sort((a, b) => a.name.localeCompare(b.name)),
      filters,
    ),
    listLimit,
  );
  logListSection(
    'Namespaces (root)',
    namespaces.items,
    hasActiveFilters(filters)
      ? 'No matching root namespace exports. Published subpaths are summarized above.'
      : 'No root namespace exports.',
    (ns) => {
      const src = style.dim(formatNamespaceSourceLabel(ns.sourceModule));
      logLine(
        `       ${style.dim('·')} ${ns.name.padEnd(20)} ${src} ${style.dim('·')} ${style.dim(ns.targetSubpath)}`,
      );
    },
    namespaces.hiddenCount,
  );

  if (snapshot.summary.subpaths.length) {
    const subpaths = limitList(snapshot.summary.subpaths, listLimit);
    printPublishedSubpathRollups(subpaths.items);
    logListTruncation(subpaths.hiddenCount);
  }
}
