import { canPrintPrimary } from '../../../runtime/policy.js';
import { boldDim, style } from '../../../runtime/style.js';
import { getRunOptions } from '../../../runtime/runOptions.js';
import { TIMELINE_SUMMARY_LABEL_WIDTH } from '../../../shared/constants/timeline.js';
import type { TimelineSummary } from '../../../types/timeline/summary.js';
import { logLine, padLabel } from '../../report.js';

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function formatTierMovement(movement: NonNullable<TimelineSummary['tierMovement']>): string {
  const parts: string[] = [];
  if (movement.stable) parts.push(`stable ${movement.stable > 0 ? '+' : ''}${movement.stable}`);
  if (movement.advanced) parts.push(`adv ${movement.advanced > 0 ? '+' : ''}${movement.advanced}`);
  if (movement.internal) parts.push(`int ${movement.internal > 0 ? '+' : ''}${movement.internal}`);
  if (movement.unclassified) {
    parts.push(`uncls ${movement.unclassified > 0 ? '+' : ''}${movement.unclassified}`);
  }
  return parts.join(' · ');
}

function summaryRows(summary: TimelineSummary): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];
  const growth = summary.apiGrowth;
  rows.push({
    label: 'API growth',
    value: `${signed(growth.delta)} flat (${growth.fromLabel} → ${growth.toLabel})`,
  });

  if (summary.exportChurn) {
    const churn = summary.exportChurn;
    rows.push({
      label: 'Export churn',
      value: `${churn.added} added · ${churn.removed} removed (${churn.total} symbol edits)`,
    });
  }

  if (summary.namespaceNet) {
    rows.push({
      label: 'Namespace net',
      value: `${signed(summary.namespaceNet)} namespaces`,
    });
  }

  if (summary.tierMovement) {
    rows.push({
      label: 'Tier movement',
      value: formatTierMovement(summary.tierMovement),
    });
  }

  if (summary.stableRatio) {
    rows.push({
      label: 'Stable ratio',
      value: `${summary.stableRatio.first}% → ${summary.stableRatio.last}%`,
    });
  }

  if (summary.categoryShift) {
    rows.push({
      label: 'Category shift',
      value: `top ${summary.categoryShift.from} → ${summary.categoryShift.to}`,
    });
  }

  if (summary.largestModuleShift) {
    const shift = summary.largestModuleShift;
    rows.push({
      label: 'Largest module',
      value: `${signed(shift.delta)} edges → ${shift.module} at ${shift.sha.slice(0, 7)} (${shift.date})`,
    });
  }

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

  if (summary.cacheCoverage) {
    const cache = summary.cacheCoverage;
    const parts = [`${cache.hits} hit`];
    if (cache.refreshed) parts.push(`${cache.refreshed} refresh`);
    if (cache.misses) parts.push(`${cache.misses} miss`);
    rows.push({
      label: 'Cache coverage',
      value: `${parts.join(' · ')} (${cache.total} snapshots)`,
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
