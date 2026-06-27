/** Default row cap for list-oriented command output. */
export const DEFAULT_LIST_TOP = 10;

export type ListViewOptions = {
  top?: number;
  full?: boolean;
};

/** Resolve max visible rows; `full` removes the cap. */
export function resolveListLimit(options?: ListViewOptions): number {
  if (options?.full) return Infinity;
  if (options?.top !== undefined && Number.isFinite(options.top) && options.top >= 0) {
    return options.top;
  }
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

export function formatListTruncationHint(command: string, hiddenCount: number): string {
  if (hiddenCount <= 0) return '';
  return `…and ${hiddenCount} more (expgov ${command} --full)`;
}
