import { getSnapshot } from '../cache/index.js';
import { resolveCacheOptions } from '../cache/resolveOptions.js';
import {
  diffSnapshots,
  evaluateDiffFailMode,
  shouldIncludeDiffJsonDetail,
  buildDiffJsonListDetail,
} from '../format/index.js';
import { computeDiffInsights } from '../insights/index.js';
import { parseDiffRange } from '../git/index.js';
import { printDiffReport, printDiffVerbose, printDiffCacheDetail } from '../logger/index.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';
import { toFilterOptions } from '../shared/filters.js';
import type { DiffCliOptions } from '../types/commands/cli.js';

export function runDiff(options: DiffCliOptions): number {
  const timer = beginCommand('diff');
  const { left, right, rangeLabel } = parseDiffRange(options.range);
  const cacheOpts = resolveCacheOptions({ noCache: options.noCache, force: options.force });

  const leftResult = getSnapshot(left, cacheOpts);
  const rightResult = getSnapshot(right, cacheOpts);
  const diff = diffSnapshots(leftResult.snapshot, rightResult.snapshot);
  const insights = computeDiffInsights(leftResult.snapshot, rightResult.snapshot, diff);
  const { passed, issues } = evaluateDiffFailMode(diff, {
    failOnRemoved: options.failOnRemoved,
    failOnTierViolations: options.failOnTierViolations,
  });
  const exitCode = passed ? 0 : 1;
  const status = passed ? 'ok' : 'fail';
  const filters = toFilterOptions(options);

  if (getRunOptions().json) {
    const data: Record<string, unknown> = {
      rangeLabel,
      diff: diff.summaryDelta,
      added: diff.added,
      removed: diff.removed,
      tierViolations: diff.tierViolations,
      insights,
    };
    if (filters) data.filters = filters;
    if (shouldIncludeDiffJsonDetail(options)) {
      Object.assign(
        data,
        buildDiffJsonListDetail(diff, leftResult.snapshot, rightResult.snapshot, options),
      );
    }
    finishCommand({
      command: 'diff',
      timer,
      status,
      exitCode,
      json: {
        kind: 'diff',
        ok: passed,
        issues,
        data,
      },
    });
    return exitCode;
  }

  printDiffReport({ rangeLabel, left: leftResult, right: rightResult, diff, listView: options });

  if (options.verbose) {
    printDiffVerbose({ diff, left: leftResult.snapshot, right: rightResult.snapshot, listView: options });
    printDiffCacheDetail({ left: leftResult, right: rightResult });
  }

  finishCommand({
    command: 'diff',
    timer,
    status,
    exitCode,
    footer: {
      counts: {
        added: diff.added.length,
        removed: diff.removed.length,
        ...(issues.length ? { issues: issues.length } : {}),
      },
    },
  });
  return exitCode;
}
