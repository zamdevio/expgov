import type { DiffResult } from '../types/format/diff.js';
import type { InventorySnapshot } from '../types/inventory/snapshot.js';
import type { DiffInsights, InsightLine } from '../types/insights/index.js';
import { trimInsightLines } from './common.js';

function signedDelta(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function edgeCountByModule(snapshot: InventorySnapshot): Map<string, number> {
  const counts = new Map<string, number>();
  for (const edge of snapshot.edges) {
    counts.set(edge.toModule, (counts.get(edge.toModule) ?? 0) + 1);
  }
  return counts;
}

function largestModuleEdgeDelta(
  left: InventorySnapshot,
  right: InventorySnapshot,
): { path: string; delta: number } | undefined {
  const leftCounts = edgeCountByModule(left);
  const rightCounts = edgeCountByModule(right);
  const modules = new Set([...leftCounts.keys(), ...rightCounts.keys()]);
  let best: { path: string; delta: number } | undefined;

  for (const path of modules) {
    const delta = (rightCounts.get(path) ?? 0) - (leftCounts.get(path) ?? 0);
    if (delta === 0) continue;
    if (!best || Math.abs(delta) > Math.abs(best.delta)) {
      best = { path, delta };
    }
  }

  return best;
}

function tierMovementLines(diff: DiffResult): InsightLine[] {
  const left = diff.summaryDelta.left.root;
  const right = diff.summaryDelta.right.root;
  const movements: Array<[string, number]> = [
    ['stable', right.stable - left.stable],
    ['advanced', right.advanced - left.advanced],
    ['internal', right.internal - left.internal],
    ['unclassified', right.unclassified - left.unclassified],
  ];

  const parts = movements
    .filter(([, delta]) => delta !== 0)
    .map(([tier, delta]) => `${tier} ${signedDelta(delta)}`);

  for (const name of new Set([...Object.keys(left.custom ?? {}), ...Object.keys(right.custom ?? {})])) {
    const delta = (right.custom[name] ?? 0) - (left.custom[name] ?? 0);
    if (delta !== 0) parts.push(`${name} ${signedDelta(delta)}`);
  }

  if (!parts.length) return [];
  return [{ key: 'tier-movement', text: `tier movement: ${parts.join(' · ')}` }];
}

export function computeDiffInsights(
  left: InventorySnapshot,
  right: InventorySnapshot,
  diff: DiffResult,
): DiffInsights {
  const lines: InsightLine[] = [];

  const moduleDelta = largestModuleEdgeDelta(left, right);
  if (moduleDelta) {
    lines.push({
      key: 'largest-module-delta',
      text: `largest module delta: ${signedDelta(moduleDelta.delta)} edges in ${moduleDelta.path}`,
    });
  }

  lines.push(...tierMovementLines(diff));

  const namespaceDelta = right.namespaces.length - left.namespaces.length;
  if (namespaceDelta !== 0) {
    lines.push({
      key: 'namespace-delta',
      text: `namespace exports on root: ${signedDelta(namespaceDelta)}`,
    });
  }

  const newAdvanced = diff.added
    .map((name) => right.symbols.find((sym) => sym.name === name))
    .filter((sym) => sym?.tier === 'advanced')
    .map((sym) => sym!.name)
    .slice(0, 3);
  if (newAdvanced.length) {
    lines.push({
      key: 'new-advanced',
      text: `new advanced: ${newAdvanced.join(', ')}`,
    });
  }

  if (diff.added.length > 3) {
    const sample = diff.added.slice(0, 3);
    const extra = diff.added.length - sample.length;
    lines.push({
      key: 'added-sample',
      text: `added: ${sample.join(', ')} (+${extra} more)`,
    });
  }

  if (diff.removed.length > 3) {
    const sample = diff.removed.slice(0, 3);
    const extra = diff.removed.length - sample.length;
    lines.push({
      key: 'removed-sample',
      text: `removed: ${sample.join(', ')} (+${extra} more)`,
    });
  }

  if (diff.tierViolations.length > 0) {
    lines.push({
      key: 'tier-violations',
      text: `${diff.tierViolations.length} tier violation(s) on right snapshot`,
    });
  }

  const tierMovement: Record<string, number> = {};
  const dl = diff.summaryDelta.left.root;
  const dr = diff.summaryDelta.right.root;
  for (const [tier, lv, rv] of [
    ['stable', dl.stable, dr.stable],
    ['advanced', dl.advanced, dr.advanced],
    ['internal', dl.internal, dr.internal],
    ['unclassified', dl.unclassified, dr.unclassified],
  ] as const) {
    const delta = rv - lv;
    if (delta !== 0) tierMovement[tier] = delta;
  }

  return trimInsightLines({
    lines,
    largestModuleDelta: moduleDelta,
    tierMovement: Object.keys(tierMovement).length ? tierMovement : undefined,
  });
}
