import chalk from 'chalk';

import { logLine } from '../report.js';

export function printDoctorReport(input: {
  healthy: boolean;
  ok: string[];
  warnings: string[];
  hints: string[];
  verbose?: boolean;
}): void {
  const { healthy, ok, warnings, hints, verbose } = input;
  const hintLimit = verbose ? hints.length : 3;

  logLine('');
  for (const line of ok) logLine(`       ${chalk.green('✓')} ${line}`);
  for (const line of warnings) logLine(`       ${chalk.yellow('!')} ${line}`);
  for (const line of hints.slice(0, hintLimit)) logLine(`       ${chalk.dim('·')} ${line}`);
  if (!verbose && hints.length > hintLimit) {
    logLine(`       ${chalk.dim(`…and ${hints.length - hintLimit} more hints (use -v)`)}`);
  }
  if (healthy && !warnings.length) {
    logLine('');
    logLine(`       ${chalk.green('✓')} environment looks healthy`);
  }
}
