import { VERBOSE_INVENTORY_ROW_PREFIX } from '../../shared/constants/inventory.js';
import { boldDim, style, tierStyle } from '../../runtime/style.js';
import type { SnapshotResult } from '../../cache/index.js';
import type { SourceRef } from '../../git/index.js';
import type { InventorySnapshot, SubpathRollup } from '../../inventory/index.js';
import { sumSdkTierCounts } from '../../inventory/index.js';
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
  cacheLabel,
  inventoryCacheDirDisplay,
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
    cache: `${cacheLabel(cache)} ${style.dim(`· ${inventoryCacheDirDisplay(snapshot.sha)}`)}`,
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
  printTierRollupLines(r);

  printSdkWideTiers(sumSdkTierCounts(snapshot));
  printPublishedSubpathRollups(snapshot.summary.subpaths);

  const listLimit = resolveListLimit(input.listView);
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
}

export function printVerboseInventory(snapshot: InventorySnapshot, listView?: ListViewOptions): void {
  if (!canEmitVerboseReport()) return;
  const listLimit = resolveListLimit(listView);
  const flat = limitList(
    [...snapshot.symbols].sort((a, b) => a.name.localeCompare(b.name)),
    listLimit,
  );

  logLine('');
  logLine(boldDim('       Symbols (root flat)'));
  if (flat.items.length === 0) {
    logSectionEmpty('No root flat exports.');
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
    [...snapshot.namespaces].sort((a, b) => a.name.localeCompare(b.name)),
    listLimit,
  );
  logListSection(
    'Namespaces (root)',
    namespaces.items,
    'No root namespace exports.',
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
