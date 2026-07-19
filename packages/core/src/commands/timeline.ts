import { ExportError } from '../errors/index.js';
import { getSnapshot } from '../cache/index.js';
import { resolveCacheOptions } from '../cache/resolveOptions.js';
import {
  formatGitRunStats,
  indexVersionTagsByCommit,
  listBarrelCommits,
  listBarrelCommitsByRef,
  resetGitRunStats,
  shortSha,
  versionTagsForCommit,
} from '../git/index.js';
import { printTimelineReport } from '../logger/index.js';
import { computeTimelineInsights } from '../insights/index.js';
import { beginCommand, finishCommand } from '../runtime/command.js';
import { getRunOptions } from '../runtime/runOptions.js';
import { formatTimelineRangeHelp, parseTimelineRange } from '../time/index.js';
import { buildJsonListGuidance, limitList, resolveListLimit } from '../shared/listing.js';
import type { TimelineCliOptions } from '../types/commands/cli.js';
import type { TimelineRow } from '../types/timeline/row.js';
import { computeTimelineStepMeta } from '../timeline/stepMeta.js';
import { timelineRollupFromSnapshot } from '../timeline/rollup.js';
import { computeTimelineSummary } from '../timeline/summary.js';
import { TimelineWarmer } from '../timeline/warmer.js';

export function runTimeline(options: TimelineCliOptions = {}): void {
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

  const allCommits =
    range.kind === 'time'
      ? listBarrelCommits({
          sinceIso: range.sinceIso,
          untilIso: range.untilIso,
        })
      : listBarrelCommitsByRef({
          leftSha: range.left.sha,
          rightSha: range.right.sha,
        });
  const { items: commits, hiddenCount } = limitList(allCommits, listLimit);
  const tagIndex = indexVersionTagsByCommit();

  const warmer = new TimelineWarmer(commits.length);
  const built: { row: TimelineRow; snapshot: ReturnType<typeof getSnapshot>['snapshot'] }[] = commits.map(
    (commit) => {
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
        snapshot,
        row: {
          date: commit.date.slice(0, 10),
          sha: commit.sha,
          subject: commit.subject,
          cache,
          rollup: timelineRollupFromSnapshot(snapshot),
          delta: null,
          step: null,
          tags: versionTagsForCommit(commit.sha, tagIndex),
        },
      };
    },
  );

  const rows: TimelineRow[] = built.map((entry) => entry.row);

  const warmStats = warmer.finish();

  for (let i = 0; i < rows.length; i++) {
    if (i === 0) {
      rows[i]!.delta = null;
      rows[i]!.step = null;
      continue;
    }
    const newer = built[i - 1]!.snapshot;
    const older = built[i]!.snapshot;
    rows[i]!.delta = rows[i]!.rollup.rootFlat - rows[i - 1]!.rollup.rootFlat;
    rows[i]!.step = computeTimelineStepMeta(newer, older);
  }

  const insights = computeTimelineInsights(rows);
  const summary = computeTimelineSummary(rows, range);

  if (getRunOptions().json) {
    const listGuidance = buildJsonListGuidance([
      { name: 'rows', shown: rows.length, hidden: hiddenCount },
    ]);
    finishCommand({
      command: 'timeline',
      timer,
      status: 'ok',
      json: {
        kind: 'timeline',
        ok: true,
        data: {
          range,
          top: listLimit,
          rows,
          rowsHidden: hiddenCount,
          listGuidance,
          warmStats,
          summary,
          insights,
        },
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
    summary,
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
