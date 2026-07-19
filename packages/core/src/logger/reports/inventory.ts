import { computeInventoryInsights } from '../../insights/index.js';
import { VERBOSE_INVENTORY_ROW_PREFIX, INVENTORY_TIER_CELL_WIDTH } from '../../shared/constants/inventory.js';
import { boldDim, style, tierStyle } from '../../runtime/style.js';
import type { SnapshotResult } from '../../types/cache/index.js';
import type { SourceRef } from '../../types/git/index.js';
import type { InventorySnapshot, SubpathRollup } from '../../types/inventory/index.js';
import { sumSdkTierCounts } from '../../inventory/index.js';
import {
  filterNamespaces,
  filterSymbols,
  formatAppliedFiltersMeta,
  hasActiveFilters,
  toFilterOptions,
} from '../../shared/filters.js';
import { limitList, resolveListLimit } from '../../shared/listing.js';
import type { ListViewOptions } from '../../types/cli/list.js';
import {
  formatInventoryCategory,
  formatInventoryName,
  formatInventorySymbolKind,
  formatNamespaceSourceLabel,
  formatTierProvenanceKind,
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

export function printPublishedSubpathRollups(
  subpaths: SubpathRollup[],
  title = 'Published subpaths (rollup)',
  hiddenCount = 0,
): void {
  if (!subpaths.length) return;
  logLine('');
  logLine(boldDim(`       ${title}`));
  for (const sp of subpaths) logLine(formatSubpathRollupLine(sp));
  logListTruncation(hiddenCount);
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
    filters: formatAppliedFiltersMeta(toFilterOptions(input.listView)),
  });

  logLine('');
  logLine(boldDim('       Root barrel tiers'));
  const r = snapshot.summary.root;
  logLine(`       ${padLabel('root flat')} ${style.white(String(r.flat))}`);
  logLine(`       ${padLabel('namespace')} ${style.white(String(r.namespace))}`);
  const listLimit = resolveListLimit(input.listView);
  printTierRollupLines(r, listLimit);

  printSdkWideTiers(sumSdkTierCounts(snapshot), listLimit);
  const published = limitList(snapshot.summary.subpaths, listLimit);
  printPublishedSubpathRollups(published.items, 'Published subpaths (rollup)', published.hiddenCount);

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
  if (!canEmitVerboseReport() && !listView?.namesOnly) return;
  const filters = toFilterOptions(listView);
  const listLimit = resolveListLimit(listView);
  const namesOnly = Boolean(listView?.namesOnly);
  const flat = limitList(
    filterSymbols(
      [...snapshot.symbols].sort((a, b) => a.name.localeCompare(b.name)),
      filters,
      snapshot.namespaces,
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
  } else if (namesOnly) {
    for (const sym of flat.items) {
      logLine(`       ${style.dim('·')} ${sym.name}`);
    }
    logListTruncation(flat.hiddenCount);
  } else {
    logLine(style.dim(`${VERBOSE_INVENTORY_ROW_PREFIX}${formatVerboseInventoryHeader()}`));
    for (const sym of flat.items) {
      const kind = formatTierProvenanceKind(sym.tierProvenance?.kind);
      const plain = `${sym.tier}(${kind})`;
      const pad = ' '.repeat(Math.max(0, INVENTORY_TIER_CELL_WIDTH - plain.length));
      const provStyled =
        sym.tierProvenance?.kind === 'tag' ? style.accent(`(${kind})`) : style.dim(`(${kind})`);
      const tier = `${tierStyle(sym.tier)(sym.tier)}${provStyled}${pad}`;
      const category = style.accent(formatInventoryCategory(sym.category));
      const symbolKind = style.white(formatInventorySymbolKind(sym.symbolKind));
      logLine(
        `${VERBOSE_INVENTORY_ROW_PREFIX}${formatInventoryName(sym.name)} ${tier} ${category} ${symbolKind} ${style.dim(sym.targetSubpath)}`,
      );
    }
    logListTruncation(flat.hiddenCount);
  }

  logLine('');
  const namespaces = limitList(
    filterNamespaces(
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
      if (namesOnly) {
        logLine(`       ${style.dim('·')} ${ns.name}`);
        return;
      }
      const src = style.dim(formatNamespaceSourceLabel(ns.sourceModule));
      logLine(
        `       ${style.dim('·')} ${ns.name.padEnd(20)} ${src} ${style.dim('·')} ${style.dim(ns.targetSubpath)}`,
      );
    },
    namespaces.hiddenCount,
  );
}
