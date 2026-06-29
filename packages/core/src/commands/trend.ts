import { getSnapshot, trendRollupFromSnapshot } from '../cache/index.js';
import { resolveCacheOptions } from '../cache/resolveOptions.js';
import { listVersionTags, resolveSourceRef } from '../git/index.js';
import { computeTrendInsights } from '../insights/index.js';
import { printTrendReport } from '../logger/index.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';
import type { TrendCliOptions } from '../types/commands/cli.js';

export function runExportsTrend(options: TrendCliOptions = {}): void {
  const timer = beginCommand('trend');
  const tags = listVersionTags(options.tagLimit ?? 12);

  const rows = tags.map((tag) => {
    const ref = resolveSourceRef(tag);
    const { snapshot, cache } = getSnapshot(
      ref,
      resolveCacheOptions({ noCache: options.noCache, force: options.force }),
    );
    return {
      tag,
      sha: ref.kind === 'commit' ? ref.sha : snapshot.sha,
      cache,
      rollup: trendRollupFromSnapshot(snapshot),
    };
  });

  const insights = computeTrendInsights(rows);

  if (getRunOptions().json) {
    finishCommand({
      command: 'trend',
      timer,
      status: 'ok',
      json: {
        kind: 'trend',
        ok: true,
        data: { tagLimit: options.tagLimit ?? 12, rows, insights },
      },
    });
    return;
  }

  printTrendReport({ rows, tagLimit: options.tagLimit ?? 12, verbose: options.verbose, listView: options });

  const first = rows[0];
  const last = rows[rows.length - 1];
  finishCommand({
    command: 'trend',
    timer,
    status: 'ok',
    footer: {
      counts: {
        tags: rows.length,
        ...(first && last ? { 'Δ flat': last.rollup.rootFlat - first.rollup.rootFlat } : {}),
      },
    },
  });
}
