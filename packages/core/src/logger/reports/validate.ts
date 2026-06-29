
import { boldDim, style } from '../../runtime/style.js';

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
    for (const v of violations) logLine(`       ${style.err('✗')} ${v}`);
    if (verbose && notes.length) {
      logLine('');
      logLine(boldDim('       Notes'));
      for (const note of notes) logLine(`       ${style.dim('·')} ${note}`);
    }
    return;
  }

  logLine('');
  logLine(`       ${style.ok('✓')} tsconfig paths ⊆ npm exports (wildcard flagged separately)`);
  logLine(`       ${style.ok('✓')} no unclassified root flat exports`);
  for (const note of notes.slice(0, noteLimit)) logLine(`       ${style.dim('·')} ${note}`);
  if (!verbose && notes.length > 5) {
    logLine(`       ${style.dim(`…and ${notes.length - 5} more notes (use -v)`)}`);
  }

  if (verbose && internalFlatSymbols.length) {
    logLine('');
    logLine(boldDim('       Internal-tier flat on root'));
    for (const name of internalFlatSymbols.sort()) logLine(`       ${style.magenta('·')} ${name}`);
  }

  if (verbose && advancedFlatSymbols.length) {
    logLine('');
    logLine(boldDim('       Advanced-tier flat on root'));
    for (const name of advancedFlatSymbols.sort()) logLine(`       ${style.warn('·')} ${name}`);
  }
}
