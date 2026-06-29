import chalk from 'chalk';

import { logLine } from '../report.js';

export function printValidateReport(input: {
  passed: boolean;
  violations: string[];
  notes: string[];
  verbose?: boolean;
  advancedFlatSymbols?: string[];
  internalFlatSymbols?: string[];
}): void {
  const { passed, violations, notes, verbose, advancedFlatSymbols = [], internalFlatSymbols = [] } = input;
  const noteLimit = verbose ? notes.length : 5;

  if (!passed) {
    logLine('');
    for (const v of violations) logLine(`       ${chalk.red('✗')} ${v}`);
    if (verbose && notes.length) {
      logLine('');
      logLine(chalk.bold.dim('       Notes'));
      for (const note of notes) logLine(`       ${chalk.dim('·')} ${note}`);
    }
    return;
  }

  logLine('');
  logLine(`       ${chalk.green('✓')} tsconfig paths ⊆ npm exports (wildcard flagged separately)`);
  logLine(`       ${chalk.green('✓')} no unclassified root flat exports`);
  for (const note of notes.slice(0, noteLimit)) logLine(`       ${chalk.dim('·')} ${note}`);
  if (!verbose && notes.length > 5) {
    logLine(`       ${chalk.dim(`…and ${notes.length - 5} more notes (use -v)`)}`);
  }

  if (verbose && internalFlatSymbols.length) {
    logLine('');
    logLine(chalk.bold.dim('       Internal-tier flat on root'));
    for (const name of internalFlatSymbols.sort()) logLine(`       ${chalk.magenta('·')} ${name}`);
  }

  if (verbose && advancedFlatSymbols.length) {
    logLine('');
    logLine(chalk.bold.dim('       Advanced-tier flat on root'));
    for (const name of advancedFlatSymbols.sort()) logLine(`       ${chalk.yellow('·')} ${name}`);
  }
}
