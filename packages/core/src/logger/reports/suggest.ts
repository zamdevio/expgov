
import { boldDim, style } from '../../runtime/style.js';
import { limitList, resolveListLimit } from '../../shared/listing.js';
import type { ListViewOptions } from '../../types/cli/list.js';

import { logLine, logListTruncation, printMeta } from '../report.js';

function stableExactSnippetLines(names: string[]): string[] {
  if (!names.length) return [];
  return ['      exact: [', ...names.map((name) => `        ${JSON.stringify(name)},`), '      ],'];
}

export function printSuggestReport(input: {
  suggestion: { bucket: 'stable'; names: string[] };
  hints: string[];
  verbose?: boolean;
  ref?: string;
  listView?: ListViewOptions;
}): void {
  const { suggestion, hints } = input;
  const listLimit = resolveListLimit(input.listView);

  if (input.ref) {
    printMeta({ ref: input.ref });
  }

  logLine('');
  if (!suggestion.names.length) {
    logLine(`       ${style.ok('✓')} no unclassified flat exports — tier rules cover the working tree`);
    return;
  }

  logLine(
    `       ${style.warn('!')} ${suggestion.names.length} unclassified flat export(s) — add to tiers.${suggestion.bucket}.exact`,
  );
  logLine('');
  logLine(boldDim('       Suggested names'));
  const names = limitList(suggestion.names, listLimit);
  for (const name of names.items) logLine(`       ${style.accent('·')} ${name}`);
  logListTruncation(names.hiddenCount);

  if (names.items.length) {
    logLine('');
    logLine(boldDim('       Paste into expgov.config.ts'));
    for (const line of stableExactSnippetLines(names.items)) {
      logLine(`       ${style.dim(line)}`);
    }
  }

  if (hints.length) {
    logLine('');
    const limitedHints = limitList(hints, listLimit);
    for (const hint of limitedHints.items) logLine(`       ${style.dim('·')} ${hint}`);
    logListTruncation(limitedHints.hiddenCount);
  }
}
