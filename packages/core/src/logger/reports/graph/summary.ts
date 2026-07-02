import { canPrintPrimary } from '../../../runtime/policy.js';
import { boldDim, style } from '../../../runtime/style.js';
import { getRunOptions } from '../../../runtime/runOptions.js';
import { GRAPH_SUMMARY_LABEL_WIDTH } from '../../../shared/constants/graph.js';
import type { GraphAnalytics } from '../../../types/graph/analytics.js';
import { compactCoreSourcePath } from '../../format.js';
import { logLine, padLabel } from '../../report.js';

function summaryRows(analytics: GraphAnalytics): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];

  rows.push({
    label: 'Edge density',
    value: `${analytics.edgeDensity} edges/module (${analytics.edgeCount} edges · ${analytics.uniqueModules} modules)`,
  });

  if (analytics.hottestModule) {
    const hot = analytics.hottestModule;
    rows.push({
      label: 'Hottest module',
      value: `${compactCoreSourcePath(hot.path)} (${hot.count} edges)`,
    });
  }

  if (analytics.namespaceCount > 0) {
    rows.push({
      label: 'Namespaces',
      value: `${analytics.namespaceCount} root namespace export(s)`,
    });
  }

  if (analytics.flatEdgeCount > 0 || analytics.namespaceEdgeCount > 0) {
    rows.push({
      label: 'Re-export mix',
      value: `${analytics.flatEdgeCount} flat · ${analytics.namespaceEdgeCount} namespace`,
    });
  }

  const fanIn = analytics.fanInModules[0];
  if (fanIn) {
    rows.push({
      label: 'Fan-in module',
      value: `${compactCoreSourcePath(fanIn.path)} (${fanIn.namespaceCount} namespaces)`,
    });
  }

  return rows;
}

export function printGraphSummaryBlock(analytics: GraphAnalytics | null): void {
  if (!analytics || !canPrintPrimary(getRunOptions())) return;

  const rows = summaryRows(analytics);
  if (!rows.length) return;

  logLine('');
  logLine(boldDim('       Summary'));
  for (const row of rows) {
    logLine(`       ${padLabel(row.label, GRAPH_SUMMARY_LABEL_WIDTH)} ${style.dim(row.value)}`);
  }
}

function formatTierMix(byTier: GraphAnalytics['namespaces'][0]['byTier']): string {
  const parts: string[] = [];
  if (byTier.stable) parts.push(`stable ${byTier.stable}`);
  if (byTier.advanced) parts.push(`adv ${byTier.advanced}`);
  if (byTier.internal) parts.push(`int ${byTier.internal}`);
  if (byTier.unclassified) parts.push(`uncls ${byTier.unclassified}`);
  return parts.join(' · ');
}

function formatCategoryMix(topCategories: GraphAnalytics['namespaces'][0]['topCategories']): string {
  return topCategories.map((entry) => `${entry.category} ${entry.count}`).join(' · ');
}

export function formatNamespaceCompositionLine(
  ns: GraphAnalytics['namespaces'][0],
  verbose?: boolean,
): string | undefined {
  const tierMix = formatTierMix(ns.byTier);
  const categoryMix = formatCategoryMix(ns.topCategories);
  if (!tierMix && !categoryMix) return undefined;
  if (verbose || !categoryMix) return tierMix || categoryMix;
  return `${tierMix} · ${categoryMix}`;
}

export function formatNamespacePrimaryLine(ns: GraphAnalytics['namespaces'][0]): {
  name: string;
  sizeLabel: string;
  moduleLabel: string;
  targetSubpath: string;
} {
  return {
    name: ns.name,
    sizeLabel: ns.edgeCount ? `${ns.edgeCount} edges` : '0 edges',
    moduleLabel: ns.module ? compactCoreSourcePath(ns.module) : '(source unresolved)',
    targetSubpath: ns.targetSubpath,
  };
}
