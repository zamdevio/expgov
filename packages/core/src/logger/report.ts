import path from 'node:path';

import type { CacheStatus } from '../types/cache/index.js';
import { gitRevParse, shortSha } from '../git/index.js';
import type { SourceRef } from '../types/git/ref.js';
import type { InventorySnapshot } from '../types/inventory/index.js';
import { cacheDirForSha, getRepoRoot } from '../context/paths.js';
import { WORKTREE_CACHE_KEY } from '../shared/constants/cache.js';
import { formatListTruncationHint } from '../shared/listing.js';
import { emitLog } from '../runtime/emitter.js';
import { getRunOptions } from '../runtime/runOptions.js';
import { canPrintPrimary, canPrintVerbose } from '../runtime/policy.js';
import { boldDim, cacheStatusStyle, style, tierStyle } from '../runtime/style.js';

export function canEmitReport(): boolean {
  return canPrintPrimary(getRunOptions());
}

export function canEmitVerboseReport(): boolean {
  return canPrintVerbose(getRunOptions()) && !getRunOptions().quiet;
}

export function logLine(message: string): void {
  if (!canEmitReport()) return;
  emitLog({ type: 'report', command: '', body: message });
}

export function logListTruncation(hiddenCount: number): void {
  const hint = formatListTruncationHint(hiddenCount);
  if (!hint) return;
  logLine(`       ${style.dim(hint)}`);
}

export function logSectionEmpty(message: string): void {
  logLine(style.dim(`       ${message}`));
}

export function logListSection<T>(
  title: string,
  items: readonly T[],
  emptyMessage: string,
  renderItem: (item: T) => void,
  hiddenCount = 0,
): void {
  logLine(boldDim(`       ${title}`));
  if (items.length === 0) {
    logSectionEmpty(emptyMessage);
    return;
  }
  for (const item of items) renderItem(item);
  logListTruncation(hiddenCount);
}

export function padLabel(label: string, width = 10): string {
  return style.dim(label.padEnd(width));
}

export function formatDelta(before: number, after: number): string {
  const delta = after - before;
  if (delta === 0) return style.dim(`${before} → ${after}`);
  if (delta > 0) {
    return `${style.dim(String(before))} ${style.dim('→')} ${style.warn(String(after))} ${style.warn(`(+${delta})`)}`;
  }
  return `${style.dim(String(before))} ${style.dim('→')} ${style.ok(String(after))} ${style.ok(`(${delta})`)}`;
}

export function inventoryCacheDirDisplay(sha: string): string {
  return `${path.relative(getRepoRoot(), cacheDirForSha(sha)).replace(/\\/g, '/')}/`;
}

export function cacheLabel(status: CacheStatus): string {
  return cacheStatusStyle(status);
}

export function formatCacheMetaLine(status: CacheStatus, snapshotSha: string): string {
  if (status === 'disabled') {
    return `${cacheLabel(status)} ${style.dim('· config cache.enabled: false')}`;
  }
  if (status === 'bypass') {
    return `${cacheLabel(status)} ${style.dim('· --no-cache')}`;
  }
  return `${cacheLabel(status)} ${style.dim(`· ${inventoryCacheDirDisplay(snapshotSha)}`)}`;
}

export function snapshotShaLabel(snapshot: InventorySnapshot): string {
  if (snapshot.sha === WORKTREE_CACHE_KEY) {
    return `HEAD ${shortSha(gitRevParse('HEAD'))}`;
  }
  return shortSha(snapshot.sha);
}

export function refLine(ref: SourceRef, snapshot: InventorySnapshot): string {
  if (ref.kind === 'worktree') {
    return `working tree ${style.dim(`(${snapshotShaLabel(snapshot)})`)}`;
  }
  return `${ref.label} ${style.dim(`(${shortSha(ref.sha)})`)}`;
}

export function tierColor(tier: string, value: number): string {
  const text = String(value).padStart(6, ' ');
  return tierStyle(tier)(text);
}

export function printHeader(command: string, subtitle: string): void {
  if (!canEmitReport()) return;
  emitLog({ type: 'header', command, subtitle });
}

export function printMeta(rows: Record<string, string | undefined>): void {
  if (!canEmitReport()) return;
  emitLog({ type: 'meta', rows });
}
