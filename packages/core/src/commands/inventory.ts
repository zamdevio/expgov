import { getSnapshot } from '../cache/index.js';
import { resolveCacheOptions } from '../cache/resolveOptions.js';
import { formatGitRunStats, resetGitRunStats, resolveSourceRef } from '../git/index.js';
import { tierCountsFooterFields } from '../inventory/index.js';
import { computeInventoryInsights } from '../insights/index.js';
import { printInventoryReport, printVerboseInventory } from '../logger/index.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';
import type { InventoryCliOptions } from '../types/commands/cli.js';

export function runExportsInventory(options: InventoryCliOptions): void {
  resetGitRunStats();
  const timer = beginCommand('inventory');
  const ref = resolveSourceRef(options.ref);
  const result = getSnapshot(ref, resolveCacheOptions({ noCache: options.noCache, force: options.force, profile: 'full' }));
  const root = result.snapshot.summary.root;
  const insights = computeInventoryInsights(result.snapshot);

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
          insights,
        },
      },
    });
    return;
  }

  printInventoryReport({
    ref,
    result,
    gitStats: options.verbose ? formatGitRunStats() : undefined,
    listView: options,
  });
  if (options.verbose) printVerboseInventory(result.snapshot, options);

  finishCommand({
    command: 'inventory',
    timer,
    status: 'ok',
    footer: {
      counts: tierCountsFooterFields(root, { flat: root.flat }),
    },
  });
}
