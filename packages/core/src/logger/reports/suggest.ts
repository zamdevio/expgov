
import { boldDim, style } from '../../runtime/style.js';

import { logLine, printMeta } from '../report.js';

export function printSuggestReport(input: {
  suggestion: { bucket: 'stable'; names: string[] };
  snippet: string;
  hints: string[];
  verbose?: boolean;
  ref?: string;
}): void {
  const { suggestion, snippet, hints, verbose } = input;
  const hintLimit = verbose ? hints.length : 3;

  if (input.ref) {
    printMeta({ ref: input.ref });
  }

  logLine('');
  if (!suggestion.names.length) {
    logLine(`       ${style.ok('✓')} no unclassified flat exports — tier rules cover the working tree`);
    return;
  }

  logLine(`       ${style.warn('!')} ${suggestion.names.length} unclassified flat export(s) — add to tiers.${suggestion.bucket}.exact`);
  logLine('');
  logLine(boldDim('       Suggested names'));
  for (const name of suggestion.names) logLine(`       ${style.accent('·')} ${name}`);

  if (snippet) {
    logLine('');
    logLine(boldDim('       Paste into expgov.config.ts'));
    for (const line of snippet.split('\n')) logLine(`       ${style.dim(line)}`);
  }

  if (hints.length) {
    logLine('');
    for (const hint of hints.slice(0, hintLimit)) logLine(`       ${style.dim('·')} ${hint}`);
    if (!verbose && hints.length > hintLimit) {
      logLine(`       ${style.dim(`…and ${hints.length - hintLimit} more hints (use -v)`)}`);
    }
  }
}
