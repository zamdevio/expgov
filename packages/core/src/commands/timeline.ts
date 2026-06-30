import { ExportError } from '../errors/index.js';
import { getSnapshot, trendRollupFromSnapshot } from '../cache/index.js';
import { resolveCacheOptions } from '../cache/resolveOptions.js';
import { formatGitRunStats, listBarrelCommits, resetGitRunStats, shortSha } from '../git/index.js';
import { printTimelineReport } from '../logger/index.js';
import { computeTimelineInsights } from '../insights/index.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';
import { formatTimelineRangeHelp, parseTimelineRange } from '../time/index.js';
import { limitList, resolveListLimit } from '../shared/listing.js';
import type { TimelineCliOptions } from '../types/commands/cli.js';
import { TimelineWarmer } from '../timeline/warmer.js';

export function runExportsTimeline(options: TimelineCliOptions = {}): void {
  resetGitRunStats();
  const timer = beginCommand('timeline');
  const rangeToken = options.range ?? '@4w';
  const listLimit = resolveListLimit(options);
  const range = parseTimelineRange(rangeToken);
  if (!range) {
    throw new ExportError(`Invalid timeline range "${rangeToken}"`, 'invalid_range', {
      details: {
        range: rangeToken,
        suggestion: formatTimelineRangeHelp().join('; '),
      },
    });
  }

  const allCommits = listBarrelCommits({
    sinceIso: range.sinceIso,
    untilIso: range.untilIso,
  });
  const { items: commits, hiddenCount } = limitList(allCommits, listLimit);

  const warmer = new TimelineWarmer(commits.length);
  const rows = commits.map((commit) => {
    const warmT0 = performance.now();
    const { snapshot, cache } = getSnapshot(
      { kind: 'commit', sha: commit.sha, label: shortSha(commit.sha) },
      resolveCacheOptions({
        noCache: options.noCache,
        force: options.force,
        profile: 'timeline',
        git: { commitDate: commit.date },
      }),
    );
    warmer.tick(commit.sha, Math.round(performance.now() - warmT0), cache);
    return {
      date: commit.date.slice(0, 10),
      sha: commit.sha,
      subject: commit.subject,
      cache,
      rollup: trendRollupFromSnapshot(snapshot),
      delta: null as number | null,
    };
  });

  const warmStats = warmer.finish();

  for (let i = 0; i < rows.length; i++) {
    if (i === 0) continue;
    rows[i]!.delta = rows[i]!.rollup.rootFlat - rows[i - 1]!.rollup.rootFlat;
  }

  const insights = computeTimelineInsights(rows);

  if (getRunOptions().json) {
    finishCommand({
      command: 'timeline',
      timer,
      status: 'ok',
      json: {
        kind: 'timeline',
        ok: true,
        data: { range, top: listLimit, rows, warmStats, insights },
      },
    });
    return;
  }

  printTimelineReport({
    range,
    top: listLimit,
    rows,
    hiddenCount,
    verbose: options.verbose,
    warmStats,
    gitStats: formatGitRunStats(),
    insights,
  });

  finishCommand({
    command: 'timeline',
    timer,
    status: 'ok',
    footer: {
      counts: {
        commits: rows.length,
        warmed: warmStats.warmed,
      },
    },
  });
}
