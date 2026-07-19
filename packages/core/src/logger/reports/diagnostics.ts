import { DIAGNOSTIC_SAMPLE_LIMIT } from '../../shared/constants/issues.js';
import { limitList, resolveListLimit } from '../../shared/listing.js';
import type { ListViewOptions } from '../../types/cli/list.js';
import { canPrintPrimary } from '../../runtime/policy.js';
import { style } from '../../runtime/style.js';
import type { Issue } from '../../types/json/envelope.js';
import { getRunOptions } from '../../runtime/runOptions.js';
import { logLine, logListTruncation } from '../report.js';

function formatDiagnosticSamples(samples: string[]): string {
  if (samples.length <= DIAGNOSTIC_SAMPLE_LIMIT) return samples.join(', ');
  const shown = samples.slice(0, DIAGNOSTIC_SAMPLE_LIMIT).join(', ');
  return `${shown} (+${samples.length - DIAGNOSTIC_SAMPLE_LIMIT} more)`;
}

export function printDiagnosticsBlock(issues: Issue[], listView?: ListViewOptions): void {
  if (!issues.length || !canPrintPrimary(getRunOptions())) return;

  const limited = limitList(issues, resolveListLimit(listView));

  logLine('');
  logLine(style.dim('       Diagnostics'));
  for (const issue of limited.items) {
    const path = issue.path ? style.dim(issue.path) : style.dim('(no path)');
    logLine(`       ${path} ${style.dim('·')} ${issue.message}`);
    if (issue.samples?.length) {
      logLine(`              ${style.dim(formatDiagnosticSamples(issue.samples))}`);
    }
  }
  logListTruncation(limited.hiddenCount);
}
