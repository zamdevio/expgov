import { DEFAULT_LIST_TOP, MIN_LIST_TOP } from './constants/list.js';
import type { ListViewOptions } from '../types/cli/list.js';

function parseTopValue(top: number | string | undefined): number | undefined {
  if (top === undefined) return undefined;
  const n = typeof top === 'number' ? top : Number.parseInt(String(top), 10);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(MIN_LIST_TOP, n);
}

/** Resolve max visible rows; `full` removes the cap. */
export function resolveListLimit(options?: ListViewOptions): number {
  if (options?.full) return Infinity;
  const top = parseTopValue(options?.top);
  if (top !== undefined) return top;
  return DEFAULT_LIST_TOP;
}

export function limitList<T>(items: T[], limit: number): { items: T[]; hiddenCount: number } {
  if (!Number.isFinite(limit)) {
    return { items, hiddenCount: 0 };
  }
  if (items.length <= limit) {
    return { items, hiddenCount: 0 };
  }
  return { items: items.slice(0, limit), hiddenCount: items.length - limit };
}

export function formatListTruncationHint(hiddenCount: number): string {
  if (hiddenCount <= 0) return '';
  return `…and ${hiddenCount} more (use -F/--full or -T/--top <n>)`;
}
