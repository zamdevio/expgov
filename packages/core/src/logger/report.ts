import chalk from 'chalk';
import path from 'node:path';

import type { CacheStatus } from '../cache/index.js';
import { gitRevParse, shortSha, type SourceRef } from '../git/index.js';
import type { InventorySnapshot } from '../inventory/index.js';
import { cacheDirForSha, getRepoRoot } from '../paths.js';
import { WORKTREE_CACHE_KEY } from '../shared/constants/cache.js';
import { formatListTruncationHint } from '../shared/listing.js';
import { emitLog } from '../runtime/emitter.js';
import { getRunOptions } from '../runtime/runOptions.js';
import { canPrintPrimary, canPrintVerbose } from '../runtime/policy.js';

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
  logLine(`       ${chalk.dim(hint)}`);
}

export function logSectionEmpty(message: string): void {
  logLine(chalk.dim(`       ${message}`));
}

export function logListSection<T>(
  title: string,
  items: readonly T[],
  emptyMessage: string,
  renderItem: (item: T) => void,
  hiddenCount = 0,
): void {
  logLine(chalk.bold.dim(`       ${title}`));
  if (items.length === 0) {
    logSectionEmpty(emptyMessage);
    return;
  }
  for (const item of items) renderItem(item);
  logListTruncation(hiddenCount);
}

export function padLabel(label: string, width = 10): string {
  return chalk.dim(label.padEnd(width));
}

export function formatDelta(before: number, after: number): string {
  const delta = after - before;
  if (delta === 0) return chalk.dim(`${before} → ${after}`);
  if (delta > 0) {
    return `${chalk.dim(String(before))} ${chalk.dim('→')} ${chalk.yellow(String(after))} ${chalk.yellow(`(+${delta})`)}`;
  }
  return `${chalk.dim(String(before))} ${chalk.dim('→')} ${chalk.green(String(after))} ${chalk.green(`(${delta})`)}`;
}

export function inventoryCacheDirDisplay(sha: string): string {
  return `${path.relative(getRepoRoot(), cacheDirForSha(sha)).replace(/\\/g, '/')}/`;
}

export function cacheLabel(status: CacheStatus): string {
  switch (status) {
    case 'hit':
      return chalk.green('hit');
    case 'miss':
      return chalk.yellow('miss');
    case 'refresh':
      return chalk.cyan('refresh');
    case 'bypass':
      return chalk.dim('bypass');
    default:
      return chalk.dim('n/a');
  }
}

export function snapshotShaLabel(snapshot: InventorySnapshot): string {
  if (snapshot.sha === WORKTREE_CACHE_KEY) {
    return `HEAD ${shortSha(gitRevParse('HEAD'))}`;
  }
  return shortSha(snapshot.sha);
}

export function refLine(ref: SourceRef, snapshot: InventorySnapshot): string {
  if (ref.kind === 'worktree') {
    return `working tree ${chalk.dim(`(${snapshotShaLabel(snapshot)})`)}`;
  }
  return `${ref.label} ${chalk.dim(`(${shortSha(ref.sha)})`)}`;
}

export function tierColor(tier: string, value: number): string {
  const text = String(value).padStart(6, ' ');
  switch (tier) {
    case 'stable':
      return chalk.green(text);
    case 'advanced':
      return chalk.yellow(text);
    case 'internal':
      return chalk.magenta(text);
    case 'unclassified':
      return chalk.red(text);
    default:
      return text;
  }
}

export function printHeader(command: string, subtitle: string): void {
  if (!canEmitReport()) return;
  emitLog({ type: 'header', command, subtitle });
}

export function printMeta(rows: Record<string, string | undefined>): void {
  if (!canEmitReport()) return;
  emitLog({ type: 'meta', rows });
}
