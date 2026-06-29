import chalk from 'chalk';

import { logLine } from '../report.js';

export function printSuggestReport(input: {
  suggestion: { bucket: 'stable'; names: string[] };
  snippet: string;
  hints: string[];
  verbose?: boolean;
}): void {
  const { suggestion, snippet, hints, verbose } = input;
  const hintLimit = verbose ? hints.length : 3;

  logLine('');
  if (!suggestion.names.length) {
    logLine(`       ${chalk.green('✓')} no unclassified flat exports — tier rules cover the working tree`);
    return;
  }

  logLine(`       ${chalk.yellow('!')} ${suggestion.names.length} unclassified flat export(s) — add to tiers.${suggestion.bucket}.exact`);
  logLine('');
  logLine(chalk.bold.dim('       Suggested names'));
  for (const name of suggestion.names) logLine(`       ${chalk.cyan('·')} ${name}`);

  if (snippet) {
    logLine('');
    logLine(chalk.bold.dim('       Paste into expgov.config.ts'));
    for (const line of snippet.split('\n')) logLine(`       ${chalk.dim(line)}`);
  }

  if (hints.length) {
    logLine('');
    for (const hint of hints.slice(0, hintLimit)) logLine(`       ${chalk.dim('·')} ${hint}`);
    if (!verbose && hints.length > hintLimit) {
      logLine(`       ${chalk.dim(`…and ${hints.length - hintLimit} more hints (use -v)`)}`);
    }
  }
}
