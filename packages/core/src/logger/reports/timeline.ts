import chalk from 'chalk';

import type { CacheStatus } from '../../cache/index.js';
import { getRootIndexRepoPath } from '../../paths.js';
import { formatSubject } from '../format.js';
import { logLine, printMeta } from '../report.js';

export function printTimelineReport(input: {
  range: { label: string; since: string; until: string };
  top: number;
  rows: {
    date: string;
    sha: string;
    subject: string;
    cache: CacheStatus;
    rollup: { rootFlat: number; stable: number };
    delta: number | null;
  }[];
  verbose?: boolean;
  warmStats?: { warmed: number; totalMs: number };
  gitStats?: string;
}): void {
  const topLabel = Number.isFinite(input.top) ? String(input.top) : 'all';
  printMeta({
    range: input.range.label,
    from: chalk.dim(input.range.since),
    to: chalk.dim(input.range.until),
    top: chalk.dim(topLabel),
    barrel: chalk.dim(`${input.rows.length} commits · ${getRootIndexRepoPath()}`),
    warm: input.warmStats
      ? chalk.dim(`${input.warmStats.warmed}/${input.rows.length} · ${input.warmStats.totalMs}ms`)
      : undefined,
    git: input.gitStats ? chalk.dim(input.gitStats) : undefined,
  });

  if (!input.rows.length) {
    logLine('');
    logLine(chalk.dim('       No commits touching the root barrel in this range.'));
    return;
  }
  logLine(
    chalk.dim(
      '       Δ = flat change vs row above (newest first); — = first row; +N/−N flat exports vs newer barrel edit',
    ),
  );

  logLine('');
  logLine(chalk.dim(`       ${'date'.padEnd(12)} ${'sha'.padEnd(9)} ${'flat'.padStart(5)} ${'Δ'.padStart(5)}  subject`));
  for (const row of input.rows) {
    let deltaStr: string;
    if (row.delta === null) deltaStr = chalk.dim('    —');
    else if (row.delta === 0) deltaStr = chalk.dim('    0');
    else if (row.delta > 0) deltaStr = chalk.yellow(` +${row.delta}`.padStart(4));
    else deltaStr = chalk.green(` ${row.delta}`.padStart(4));

    const subject = formatSubject(row.subject, 48, input.verbose);
    logLine(
      `       ${row.date.padEnd(12)} ${row.sha.slice(0, 7).padEnd(9)} ${String(row.rollup.rootFlat).padStart(5)} ${deltaStr}  ${subject}`,
    );
  }
}
