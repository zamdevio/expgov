import { getSnapshot } from '../cache/index.js';
import { formatGitRunStats, resetGitRunStats, resolveSourceRef } from '../git/index.js';
import { printInventoryReport, printVerboseInventory } from '../logger/index.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';

export interface InventoryCliOptions {
  ref?: string;
  verbose?: boolean;
  noCache?: boolean;
  force?: boolean;
}

export function runExportsInventory(options: InventoryCliOptions): void {
  resetGitRunStats();
  const timer = beginCommand('inventory');
  const ref = resolveSourceRef(options.ref);
  const result = getSnapshot(ref, { noCache: options.noCache, force: options.force, profile: 'full' });
  const root = result.snapshot.summary.root;

  if (getRunOptions().json) {
    finishCommand({
      command: 'inventory',
      timer,
      status: 'ok',
      json: {
        kind: 'inventory',
        ok: true,
        data: {
          ref: ref.label,
          sha: result.snapshot.sha,
          summary: result.snapshot.summary,
          cache: result.cache,
        },
      },
    });
    return;
  }

  printInventoryReport({
    ref,
    result,
    gitStats: options.verbose ? formatGitRunStats() : undefined,
  });
  if (options.verbose) printVerboseInventory(result.snapshot);

  finishCommand({
    command: 'inventory',
    timer,
    status: 'ok',
    footer: {
      counts: {
        flat: root.flat,
        stable: root.stable,
        unclassified: root.unclassified,
      },
    },
  });
}
