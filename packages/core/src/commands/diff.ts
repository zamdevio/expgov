import { getSnapshot } from '../cache/index.js';
import { diffSnapshots } from '../format/index.js';
import { parseDiffRange } from '../git/index.js';
import { printDiffReport, printDiffVerbose, printDiffCacheDetail } from '../logger/index.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';

export interface DiffCliOptions {
  range?: string;
  noCache?: boolean;
  force?: boolean;
  verbose?: boolean;
}

export function runExportsDiff(options: DiffCliOptions): void {
  const timer = beginCommand('diff');
  const { left, right, rangeLabel } = parseDiffRange(options.range);
  const cacheOpts = { noCache: options.noCache, force: options.force };

  const leftResult = getSnapshot(left, cacheOpts);
  const rightResult = getSnapshot(right, cacheOpts);
  const diff = diffSnapshots(leftResult.snapshot, rightResult.snapshot);

  if (getRunOptions().json) {
    finishCommand({
      command: 'diff',
      timer,
      status: 'ok',
      json: {
        kind: 'diff',
        ok: true,
        data: { rangeLabel, diff: diff.summaryDelta, added: diff.added, removed: diff.removed },
      },
    });
    return;
  }

  printDiffReport({ rangeLabel, left: leftResult, right: rightResult, diff });

  if (options.verbose) {
    printDiffVerbose({ diff, left: leftResult.snapshot, right: rightResult.snapshot });
    printDiffCacheDetail({ left: leftResult, right: rightResult });
  }

  finishCommand({
    command: 'diff',
    timer,
    status: 'ok',
    footer: {
      counts: {
        added: diff.added.length,
        removed: diff.removed.length,
      },
    },
  });
}
