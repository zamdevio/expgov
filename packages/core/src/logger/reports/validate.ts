import { computeValidateInsights } from '../../insights/index.js';
import { limitList, resolveListLimit } from '../../shared/listing.js';
import type { ListViewOptions } from '../../types/cli/list.js';
import { boldDim, style } from '../../runtime/style.js';

import { logLine, logListTruncation, printMeta } from '../report.js';
import { printInsightsBlock } from './insights.js';

export function printValidateReport(input: {
  passed: boolean;
  violations: string[];
  notes: string[];
  verbose?: boolean;
  advancedFlatSymbols?: string[];
  internalFlatSymbols?: string[];
  insights?: ReturnType<typeof computeValidateInsights>;
  listView?: ListViewOptions;
  ref?: string;
}): void {
  const {
    passed,
    violations,
    notes,
    verbose,
    advancedFlatSymbols = [],
    internalFlatSymbols = [],
    insights,
    listView,
  } = input;
  const listLimit = resolveListLimit(listView);

  if (input.ref) {
    printMeta({ ref: input.ref });
  }

  if (!passed) {
    logLine('');
    const limitedViolations = limitList(violations, listLimit);
    for (const v of limitedViolations.items) logLine(`       ${style.err('✗')} ${v}`);
    logListTruncation(limitedViolations.hiddenCount);

    if (verbose && notes.length) {
      logLine('');
      logLine(boldDim('       Notes'));
      for (const note of notes) logLine(`       ${style.dim('·')} ${note}`);
    }
    if (insights) printInsightsBlock(insights.lines);
    return;
  }

  logLine('');
  logLine(`       ${style.ok('✓')} tsconfig paths ⊆ npm exports (wildcard flagged separately)`);
  logLine(`       ${style.ok('✓')} no unclassified root flat exports`);

  const limitedNotes = verbose ? { items: notes, hiddenCount: 0 } : limitList(notes, listLimit);
  for (const note of limitedNotes.items) logLine(`       ${style.dim('·')} ${note}`);
  logListTruncation(limitedNotes.hiddenCount);

  if (verbose && internalFlatSymbols.length) {
    const limited = limitList([...internalFlatSymbols].sort(), listLimit);
    logLine('');
    logLine(boldDim('       Internal-tier flat on root'));
    for (const name of limited.items) logLine(`       ${style.magenta('·')} ${name}`);
    logListTruncation(limited.hiddenCount);
  }

  if (verbose && advancedFlatSymbols.length) {
    const limited = limitList([...advancedFlatSymbols].sort(), listLimit);
    logLine('');
    logLine(boldDim('       Advanced-tier flat on root'));
    for (const name of limited.items) logLine(`       ${style.warn('·')} ${name}`);
    logListTruncation(limited.hiddenCount);
  }

  if (insights) printInsightsBlock(insights.lines);
}
