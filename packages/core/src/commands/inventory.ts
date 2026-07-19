import { getSnapshot } from '../cache/index.js';
import { resolveCacheOptions } from '../cache/resolveOptions.js';
import {
  buildInventoryJsonListDetail,
  shouldIncludeInventoryJsonDetail,
} from '../format/index.js';
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
    const data: Record<string, unknown> = {
      ref: ref.label,
      sha: result.snapshot.sha,
      summary: result.snapshot.summary,
      cache: result.cache,
      insights,
    };
    if (shouldIncludeInventoryJsonDetail(options)) {
      const detail = buildInventoryJsonListDetail(result.snapshot, options);
      data.top = detail.top;
      data.symbols = detail.symbols;
      data.namespaces = detail.namespaces;
      data.symbolsHidden = detail.symbolsHidden;
      data.namespacesHidden = detail.namespacesHidden;
      data.listGuidance = detail.listGuidance;
    }
    finishCommand({
      command: 'inventory',
      timer,
      status: 'ok',
      json: {
        kind: 'inventory',
        ok: true,
        data,
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
