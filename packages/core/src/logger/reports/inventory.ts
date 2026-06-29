import chalk from 'chalk';

import type { SnapshotResult } from '../../cache/index.js';
import type { SourceRef } from '../../git/index.js';
import type { InventorySnapshot, SubpathRollup, TierCounts } from '../../inventory/index.js';
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
  tierColor,
  canEmitVerboseReport,
} from '../report.js';

const VERBOSE_INVENTORY_ROW_PREFIX = '       · ';

function formatSubpathRollupLine(sp: SubpathRollup): string {
  const tierParts = [
    sp.byTier.stable ? `stable ${sp.byTier.stable}` : '',
    sp.byTier.advanced ? `adv ${sp.byTier.advanced}` : '',
    sp.byTier.internal ? `int ${sp.byTier.internal}` : '',
    sp.byTier.unclassified ? `uncls ${sp.byTier.unclassified}` : '',
  ].filter(Boolean);
  const tiers = tierParts.length ? chalk.dim(` · ${tierParts.join(' · ')}`) : '';
  return `       ${chalk.dim('·')} ${sp.npmSubpath.padEnd(32)} flat ${String(sp.flat).padStart(4)}  ns ${String(sp.namespace).padStart(3)}${tiers}`;
}

export function printSdkWideTiers(tiers: TierCounts): void {
  logLine('');
  logLine(chalk.bold.dim('       SDK-wide tiers (root + published subpaths)'));
  logLine(`       ${padLabel('stable')} ${tierColor('stable', tiers.stable)}`);
  logLine(`       ${padLabel('advanced')} ${tierColor('advanced', tiers.advanced)}`);
  logLine(`       ${padLabel('internal')} ${tierColor('internal', tiers.internal)}`);
  logLine(`       ${padLabel('unclassified')} ${tierColor('unclassified', tiers.unclassified)}`);
}

export function printPublishedSubpathRollups(subpaths: SubpathRollup[], title = 'Published subpaths (rollup)'): void {
  if (!subpaths.length) return;
  logLine('');
  logLine(chalk.bold.dim(`       ${title}`));
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
    barrel: chalk.dim(barrelPath),
    cache: `${cacheLabel(cache)} ${chalk.dim(`· ${inventoryCacheDirDisplay(snapshot.sha)}`)}`,
    generated: chalk.dim(new Date(snapshot.generatedAt).toISOString()),
    commit: snapshot.git?.commitDate ? chalk.dim(snapshot.git.commitDate) : undefined,
    edges: chalk.dim(String(snapshot.edges.length)),
    subpaths: chalk.dim(String(snapshot.summary.subpaths.length)),
    git: input.gitStats ? chalk.dim(input.gitStats) : undefined,
  });

  logLine('');
  logLine(chalk.bold.dim('       Root barrel tiers'));
  const r = snapshot.summary.root;
  logLine(`       ${padLabel('root flat')} ${chalk.white(String(r.flat))}`);
  logLine(`       ${padLabel('namespace')} ${chalk.white(String(r.namespace))}`);
  logLine(`       ${padLabel('stable')} ${tierColor('stable', r.stable)}`);
  logLine(`       ${padLabel('advanced')} ${tierColor('advanced', r.advanced)}`);
  logLine(`       ${padLabel('internal')} ${tierColor('internal', r.internal)}`);
  logLine(`       ${padLabel('unclassified')} ${tierColor('unclassified', r.unclassified)}`);

  printSdkWideTiers(sumSdkTierCounts(snapshot));
  printPublishedSubpathRollups(snapshot.summary.subpaths);

  const listLimit = resolveListLimit(input.listView);
  const topCategories = limitList(
    Object.entries(r.byCategory ?? {}).sort((a, b) => b[1] - a[1]),
    listLimit,
  );
  if (topCategories.items.length) {
    logLine('');
    logLine(chalk.bold.dim('       Top categories'));
    for (const [cat, count] of topCategories.items) {
      logLine(`       ${padLabel(cat, 14)} ${chalk.white(String(count))}`);
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
  logLine(chalk.bold.dim('       Symbols (root flat)'));
  if (flat.items.length === 0) {
    logSectionEmpty('No root flat exports.');
  } else {
    logLine(chalk.dim(`${VERBOSE_INVENTORY_ROW_PREFIX}${formatVerboseInventoryHeader()}`));
    for (const sym of flat.items) {
      const tierPlain = formatInventoryTier(sym.tier);
      const tier =
        sym.tier === 'stable'
          ? chalk.green(tierPlain)
          : sym.tier === 'advanced'
            ? chalk.yellow(tierPlain)
            : sym.tier === 'internal'
              ? chalk.magenta(tierPlain)
              : chalk.red(tierPlain);
      const category = chalk.cyan(formatInventoryCategory(sym.category));
      const symbolKind = chalk.white(formatInventorySymbolKind(sym.symbolKind));
      const provenanceLabel = sym.tierProvenance?.kind === 'tag'
        ? chalk.cyan(formatTierProvenanceLabel(sym.tierProvenance))
        : chalk.dim(formatTierProvenanceLabel(sym.tierProvenance));
      logLine(
        `${VERBOSE_INVENTORY_ROW_PREFIX}${formatInventoryName(sym.name)} ${tier} ${category} ${symbolKind} ${chalk.dim(sym.targetSubpath)} ${chalk.dim('[')}${provenanceLabel}${chalk.dim(']')}`,
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
      const src = chalk.dim(formatNamespaceSourceLabel(ns.sourceModule));
      logLine(
        `       ${chalk.dim('·')} ${ns.name.padEnd(20)} ${src} ${chalk.dim('·')} ${chalk.dim(ns.targetSubpath)}`,
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
