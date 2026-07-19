import { getSnapshot } from '../cache/index.js';
import { resolveCacheOptions } from '../cache/resolveOptions.js';
import {
  buildInventoryJsonListDetail,
  shouldIncludeInventoryJsonDetail,
} from '../format/index.js';
import { formatGitRunStats, resetGitRunStats, resolveSourceRef } from '../git/index.js';
import { computeInventoryDiagnostics } from '../inventory/diagnostics.js';
import { tierCountsFooterFields } from '../inventory/index.js';
import { createGitReader, createWorktreeReader } from '../inventory/source.js';
import { computeInventoryInsights } from '../insights/index.js';
import {
  printDiagnosticsBlock,
  printInventoryReport,
  printVerboseInventory,
} from '../logger/index.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';
import { toFilterOptions } from '../shared/filters.js';
import type { InventoryCliOptions } from '../types/commands/cli.js';

export function runInventory(options: InventoryCliOptions): void {
  resetGitRunStats();
  const timer = beginCommand('inventory');
  const ref = resolveSourceRef(options.ref);
  const result = getSnapshot(ref, resolveCacheOptions({ noCache: options.noCache, force: options.force, profile: 'full' }));
  const root = result.snapshot.summary.root;
  const insights = computeInventoryInsights(result.snapshot);
  const filters = toFilterOptions(options);
  const reader =
    ref.kind === 'worktree' ? createWorktreeReader() : createGitReader(ref.sha);
  const diagnostics = computeInventoryDiagnostics(result.snapshot, reader);

  if (getRunOptions().json) {
    const data: Record<string, unknown> = {
      ref: ref.label,
      sha: result.snapshot.sha,
      summary: result.snapshot.summary,
      cache: result.cache,
      insights,
    };
    if (filters) data.filters = filters;
    if (shouldIncludeInventoryJsonDetail(options)) {
      const detail = buildInventoryJsonListDetail(result.snapshot, options);
      data.top = detail.top;
      data.symbols = detail.symbols;
      data.namespaces = detail.namespaces;
      data.symbolsHidden = detail.symbolsHidden;
      data.namespacesHidden = detail.namespacesHidden;
      data.listGuidance = detail.listGuidance;
      if (detail.namesOnly) data.namesOnly = true;
    }
    finishCommand({
      command: 'inventory',
      timer,
      status: 'ok',
      json: {
        kind: 'inventory',
        ok: true,
        issues: diagnostics,
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
  if (options.verbose || options.namesOnly) printVerboseInventory(result.snapshot, options);
  printDiagnosticsBlock(diagnostics, options);

  finishCommand({
    command: 'inventory',
    timer,
    status: 'ok',
    footer: {
      counts: {
        ...tierCountsFooterFields(root, { flat: root.flat }),
        ...(diagnostics.length ? { diagnostics: diagnostics.length } : {}),
      },
    },
  });
}
