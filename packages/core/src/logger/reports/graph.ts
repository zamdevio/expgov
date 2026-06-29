import chalk from 'chalk';

import type { CacheStatus } from '../../cache/index.js';
import type { SourceRef } from '../../git/index.js';
import type { InventorySnapshot } from '../../inventory/index.js';
import { limitList, resolveListLimit } from '../../shared/listing.js';
import type { ListViewOptions } from '../../types/cli/list.js';
import { formatNamespaceSourceLabel } from '../format.js';
import { cacheLabel, logLine, logListSection, logListTruncation, logSectionEmpty, printMeta, refLine } from '../report.js';
import { printPublishedSubpathRollups } from './inventory.js';

export function printGraphReport(input: {
  ref: SourceRef;
  snapshot: InventorySnapshot;
  cache: CacheStatus;
  targetGroups: { targetSubpath: string; flat: number; namespace: number; modules: Map<string, number> }[];
  topModules: { module: string; edges: number; symbols: string[]; edgeProvenance: string }[];
  namespaces: { name: string; targetSubpath: string; module: string | null }[];
  verbose?: boolean;
  listView?: ListViewOptions;
}): void {
  const listLimit = resolveListLimit(input.listView);
  const targetGroups = limitList(input.targetGroups, listLimit);
  const namespaces = limitList(input.namespaces, listLimit);
  const topModules = limitList(input.topModules, listLimit);

  printMeta({
    ref: refLine(input.ref, input.snapshot),
    cache: cacheLabel(input.cache),
    edges: chalk.dim(String(input.snapshot.edges.length)),
    symbols: chalk.dim(String(input.snapshot.symbols.length)),
    subpaths: chalk.dim(String(input.snapshot.summary.subpaths.length)),
  });

  logLine('');
  logLine(chalk.bold.dim('       Root re-export targets (governance map)'));
  logLine(chalk.dim(`       ${'subpath'.padEnd(22)} ${'flat'.padStart(6)} ${'ns'.padStart(4)}`));
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
      const src = chalk.dim(formatNamespaceSourceLabel(ns.module));
      logLine(
        `       ${chalk.dim('·')} ${ns.name.padEnd(18)} ${src} ${chalk.dim('·')} ${ns.targetSubpath}`,
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
        `       ${chalk.dim('·')} ${mod.edges.toString().padStart(4)}  ${mod.module} ${chalk.dim(`(${mod.edgeProvenance})`)}`,
      );
      if (input.verbose && mod.symbols.length) {
        logLine(`       ${chalk.dim('     e.g.')} ${mod.symbols.join(', ')}`);
      }
    },
    topModules.hiddenCount,
  );
}
