import { canPrintPrimary } from '../../runtime/policy.js';
import { style } from '../../runtime/style.js';
import type { InsightLine } from '../../types/insights/index.js';
import { getRunOptions } from '../../runtime/runOptions.js';
import { logLine } from '../report.js';

export function printInsightsBlock(lines: InsightLine[]): void {
  if (!lines.length || !canPrintPrimary(getRunOptions())) return;

  logLine('');
  logLine(style.dim('       Insights'));
  for (const line of lines) {
    logLine(`       ${style.dim('◇')} ${line.text}`);
  }
}
