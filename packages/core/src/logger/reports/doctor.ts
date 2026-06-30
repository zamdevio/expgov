
import { style } from '../../runtime/style.js';

import { logLine, printMeta, formatMetaEndpoint } from '../report.js';
import { gitRevParse } from '../../git/index.js';

export function printDoctorReport(input: {
  healthy: boolean;
  ok: string[];
  warnings: string[];
  hints: string[];
  verbose?: boolean;
}): void {
  const { healthy, ok, warnings, hints, verbose } = input;
  const hintLimit = verbose ? hints.length : 3;

  printMeta({ ref: formatMetaEndpoint('HEAD', gitRevParse('HEAD')) });

  logLine('');
  for (const line of ok) logLine(`       ${style.ok('✓')} ${line}`);
  for (const line of warnings) logLine(`       ${style.warn('!')} ${line}`);
  for (const line of hints.slice(0, hintLimit)) logLine(`       ${style.dim('·')} ${line}`);
  if (!verbose && hints.length > hintLimit) {
    logLine(`       ${style.dim(`…and ${hints.length - hintLimit} more hints (use -v)`)}`);
  }
  if (healthy && !warnings.length) {
    logLine('');
    logLine(`       ${style.ok('✓')} environment looks healthy`);
  }
}
