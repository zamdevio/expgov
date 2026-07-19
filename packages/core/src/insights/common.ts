import type { ModuleRef } from '../types/insights/index.js';
import { MAX_INSIGHT_LINES } from '../shared/constants/insights.js';

export function medianOf(values: number[]): number | undefined {
  if (values.length < 3) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1]! + sorted[mid]!) / 2;
}

export function countByModule(
  modules: Array<string | null | undefined>,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const modulePath of modules) {
    if (!modulePath) continue;
    counts.set(modulePath, (counts.get(modulePath) ?? 0) + 1);
  }
  return counts;
}

export function topModule(counts: Map<string, number>): ModuleRef | undefined {
  let best: ModuleRef | undefined;
  for (const [path, count] of counts) {
    if (!best || count > best.count) best = { path, count };
  }
  return best;
}

export function trimInsightLines<T extends { lines: { key: string; text: string }[] }>(
  insights: T,
): T {
  return { ...insights, lines: insights.lines.slice(0, MAX_INSIGHT_LINES) };
}
