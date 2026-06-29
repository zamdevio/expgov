import type { InsightLine, TagPairDelta, TrendInsights } from '../types/insights/index.js';
import { trimInsightLines } from './common.js';

export interface TrendRollupRow {
  tag: string;
  rollup: {
    rootFlat: number;
    stable: number;
    advanced: number;
    internal: number;
  };
}

function stableRatio(rollup: TrendRollupRow['rollup']): number | undefined {
  if (rollup.rootFlat <= 0) return undefined;
  return Math.round((rollup.stable / rollup.rootFlat) * 1000) / 10;
}

function scanConsecutiveDeltas(rows: TrendRollupRow[]): {
  largestJump?: TagPairDelta;
  largestDrop?: TagPairDelta;
} {
  let largestJump: TagPairDelta | undefined;
  let largestDrop: TagPairDelta | undefined;

  for (let i = 1; i < rows.length; i += 1) {
    const prev = rows[i - 1]!;
    const curr = rows[i]!;
    const delta = curr.rollup.rootFlat - prev.rollup.rootFlat;
    if (delta > 0 && (!largestJump || delta > largestJump.delta)) {
      largestJump = { from: prev.tag, to: curr.tag, delta };
    }
    if (delta < 0 && (!largestDrop || delta < largestDrop.delta)) {
      largestDrop = { from: prev.tag, to: curr.tag, delta };
    }
  }

  return { largestJump, largestDrop };
}

export function computeTrendInsights(rows: TrendRollupRow[]): TrendInsights | null {
  if (rows.length < 2) return null;

  const lines: InsightLine[] = [];
  const { largestJump, largestDrop } = scanConsecutiveDeltas(rows);

  if (largestJump) {
    lines.push({
      key: 'largest-jump',
      text: `largest jump: ${largestJump.from}→${largestJump.to} (+${largestJump.delta} flat)`,
    });
  }

  if (largestDrop) {
    lines.push({
      key: 'largest-drop',
      text: `largest drop: ${largestDrop.from}→${largestDrop.to} (${largestDrop.delta} flat)`,
    });
  }

  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  const ratioFirst = stableRatio(first.rollup);
  const ratioLast = stableRatio(last.rollup);
  if (ratioFirst !== undefined && ratioLast !== undefined && ratioFirst !== ratioLast) {
    lines.push({
      key: 'stable-ratio',
      text: `stable %: ${ratioFirst}% → ${ratioLast}%`,
    });
  }

  const netFlat = last.rollup.rootFlat - first.rollup.rootFlat;
  if (netFlat !== 0 && rows.length >= 2) {
    lines.push({
      key: 'window-net',
      text: `net flat over window: ${netFlat > 0 ? `+${netFlat}` : netFlat} (${first.tag}→${last.tag})`,
    });
  }

  if (!lines.length) return null;

  return trimInsightLines({
    lines,
    largestJump,
    largestDrop,
    stableRatioFirst: ratioFirst,
    stableRatioLast: ratioLast,
  });
}
