import { canPrintPrimary } from '../../../runtime/policy.js';
import { boldDim, style } from '../../../runtime/style.js';
import { getRunOptions } from '../../../runtime/runOptions.js';
import { TIMELINE_SUMMARY_LABEL_WIDTH } from '../../../shared/constants/timeline.js';
import type { TimelineSummary } from '../../../types/timeline/summary.js';
import { logLine, padLabel } from '../../report.js';

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function summaryRows(summary: TimelineSummary): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];
  const growth = summary.apiGrowth;
  rows.push({
    label: 'API growth',
    value: `${signed(growth.delta)} flat (${growth.fromLabel} → ${growth.toLabel})`,
  });

  if (summary.largestExpansion) {
    const peak = summary.largestExpansion;
    rows.push({
      label: 'Largest expansion',
      value: `+${peak.delta} at ${peak.sha.slice(0, 7)} (${peak.date})`,
    });
  }

  if (summary.largestReduction) {
    const peak = summary.largestReduction;
    rows.push({
      label: 'Largest reduction',
      value: `${peak.delta} at ${peak.sha.slice(0, 7)} (${peak.date})`,
    });
  }

  if (summary.avgStepChange !== undefined) {
    const avg = Math.round(summary.avgStepChange * 10) / 10;
    rows.push({
      label: 'Avg step change',
      value: `avg |Δ| ${avg} per barrel edit`,
    });
  }

  if (summary.mostActivePeriod) {
    const period = summary.mostActivePeriod;
    rows.push({
      label: 'Most active period',
      value: `${period.label} (${period.commits} barrel edits)`,
    });
  }

  if (summary.largestRelease) {
    const release = summary.largestRelease;
    rows.push({
      label: 'Largest release',
      value: `${release.fromTag}→${release.toTag} (+${release.delta} flat)`,
    });
  }

  return rows;
}

export function printTimelineSummaryBlock(summary: TimelineSummary | null): void {
  if (!summary || !canPrintPrimary(getRunOptions())) return;

  const rows = summaryRows(summary);
  if (!rows.length) return;

  logLine('');
  logLine(boldDim('       Summary'));
  for (const row of rows) {
    logLine(`       ${padLabel(row.label, TIMELINE_SUMMARY_LABEL_WIDTH)} ${style.dim(row.value)}`);
  }
}
