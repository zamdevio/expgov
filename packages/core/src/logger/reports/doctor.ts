
import { style } from '../../runtime/style.js';
import { limitList, resolveListLimit } from '../../shared/listing.js';
import type { ListViewOptions } from '../../types/cli/list.js';
import { gitRevParse } from '../../git/index.js';

import { formatMetaEndpoint, logLine, logListTruncation, printMeta } from '../report.js';

export function printDoctorReport(input: {
  healthy: boolean;
  ok: string[];
  warnings: string[];
  hints: string[];
  verbose?: boolean;
  listView?: ListViewOptions;
}): void {
  const { healthy, ok, warnings, hints } = input;
  const listLimit = resolveListLimit(input.listView);

  printMeta({ ref: formatMetaEndpoint('HEAD', gitRevParse('HEAD')) });

  logLine('');
  const okLines = limitList(ok, listLimit);
  for (const line of okLines.items) logLine(`       ${style.ok('✓')} ${line}`);
  logListTruncation(okLines.hiddenCount);

  const warningLines = limitList(warnings, listLimit);
  for (const line of warningLines.items) logLine(`       ${style.warn('!')} ${line}`);
  logListTruncation(warningLines.hiddenCount);

  const hintLines = limitList(hints, listLimit);
  for (const line of hintLines.items) logLine(`       ${style.dim('·')} ${line}`);
  logListTruncation(hintLines.hiddenCount);

  if (healthy && !warnings.length) {
    logLine('');
    logLine(`       ${style.ok('✓')} environment looks healthy`);
  }
}
