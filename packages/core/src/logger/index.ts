import chalk from 'chalk';
import path from 'node:path';

import type { CacheStatus, SnapshotResult } from '../cache/index.js';
import { ExportError } from '../errors/index.js';
import type { DiffResult } from '../format/index.js';
import { gitRevParse, shortSha, type SourceRef } from '../git/index.js';
import type { InventorySnapshot, SubpathRollup, TierCounts } from '../inventory/index.js';
import { sumSdkTierCounts } from '../inventory/index.js';
import { cacheDirForSha, getRepoRoot, getRootIndexRepoPath } from '../paths.js';
import { WORKTREE_CACHE_KEY } from '../shared/constants/cache.js';
import { emitLog } from '../runtime/emitter.js';
import { getRunOptions } from '../runtime/runOptions.js';
import { canPrintPrimary, canPrintVerbose } from '../runtime/policy.js';
import {
  formatListTruncationHint,
  limitList,
  resolveListLimit,
} from '../shared/listing.js';
import type { ListViewOptions } from '../types/cli/list.js';
import {
  compactCoreSourcePath,
  formatInventoryCategory,
  formatInventoryName,
  formatInventorySymbolKind,
  formatInventoryTier,
  formatSubject,
  formatVerboseInventoryHeader,
} from './format.js';

export type { CommandStatus } from '../runtime/types.js';

function canEmitReport(): boolean {
  return canPrintPrimary(getRunOptions());
}

function canEmitVerboseReport(): boolean {
  return canPrintVerbose(getRunOptions()) && !getRunOptions().quiet;
}

function logListTruncation(hiddenCount: number): void {
  const hint = formatListTruncationHint(hiddenCount);
  if (!hint) return;
  logLine(`       ${chalk.dim(hint)}`);
}

function logLine(message: string): void {
  if (!canEmitReport()) return;
  emitLog({ type: 'report', command: '', body: message });
}

function padLabel(label: string, width = 10): string {
  return chalk.dim(label.padEnd(width));
}

function formatDelta(before: number, after: number): string {
  const delta = after - before;
  if (delta === 0) return chalk.dim(`${before} → ${after}`);
  if (delta > 0) return `${chalk.dim(String(before))} ${chalk.dim('→')} ${chalk.yellow(String(after))} ${chalk.yellow(`(+${delta})`)}`;
  return `${chalk.dim(String(before))} ${chalk.dim('→')} ${chalk.green(String(after))} ${chalk.green(`(${delta})`)}`;
}

function inventoryCacheDirDisplay(sha: string): string {
  return `${path.relative(getRepoRoot(), cacheDirForSha(sha)).replace(/\\/g, '/')}/`;
}

function cacheLabel(status: CacheStatus): string {
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

function snapshotShaLabel(snapshot: InventorySnapshot): string {
  if (snapshot.sha === WORKTREE_CACHE_KEY) {
    return `HEAD ${shortSha(gitRevParse('HEAD'))}`;
  }
  return shortSha(snapshot.sha);
}

function refLine(ref: SourceRef, snapshot: InventorySnapshot): string {
  if (ref.kind === 'worktree') {
    return `working tree ${chalk.dim(`(${snapshotShaLabel(snapshot)})`)}`;
  }
  return `${ref.label} ${chalk.dim(`(${shortSha(ref.sha)})`)}`;
}

function tierColor(tier: string, value: number): string {
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

export function printInventoryReport(input: {
  ref: SourceRef;
  result: SnapshotResult;
  gitStats?: string;
  listView?: ListViewOptions;
}): void {
  const { ref, result } = input;
  const { snapshot, cache, barrelPath } = result;

  printMeta({
    ref: refLine(ref, snapshot),
    barrel: chalk.dim(barrelPath),
    cache: `${cacheLabel(cache)} ${chalk.dim(`· ${inventoryCacheDirDisplay(snapshot.sha)}`)}`,
    generated: chalk.dim(new Date(snapshot.generatedAt).toISOString()),
    commit: snapshot.git?.commitDate ? chalk.dim(snapshot.git.commitDate) : undefined,
    edges: chalk.dim(String(snapshot.edges.length)),
    subpaths: chalk.dim(String(snapshot.summary.subpaths.length)),
    git: input.gitStats ? chalk.dim(input.gitStats) : undefined,
  });

  logLine('');
  logLine(chalk.bold.dim('       Root barrel tiers'));
  const r = snapshot.summary.root;
  logLine(`       ${padLabel('root flat')} ${chalk.white(String(r.flat))}`);
  logLine(`       ${padLabel('namespace')} ${chalk.white(String(r.namespace))}`);
  logLine(`       ${padLabel('stable')} ${tierColor('stable', r.stable)}`);
  logLine(`       ${padLabel('advanced')} ${tierColor('advanced', r.advanced)}`);
  logLine(`       ${padLabel('internal')} ${tierColor('internal', r.internal)}`);
  logLine(`       ${padLabel('unclassified')} ${tierColor('unclassified', r.unclassified)}`);

  printSdkWideTiers(sumSdkTierCounts(snapshot));
  printPublishedSubpathRollups(snapshot.summary.subpaths);

  const listLimit = resolveListLimit(input.listView);
  const topCategories = limitList(
    Object.entries(r.byCategory ?? {}).sort((a, b) => b[1] - a[1]),
    listLimit,
  );
  if (topCategories.items.length) {
    logLine('');
    logLine(chalk.bold.dim('       Top categories'));
    for (const [cat, count] of topCategories.items) {
      logLine(`       ${padLabel(cat, 14)} ${chalk.white(String(count))}`);
    }
    logListTruncation(topCategories.hiddenCount);
  }
}

const VERBOSE_INVENTORY_ROW_PREFIX = '       · ';

function formatSubpathRollupLine(sp: SubpathRollup): string {
  const tierParts = [
    sp.byTier.stable ? `stable ${sp.byTier.stable}` : '',
    sp.byTier.advanced ? `adv ${sp.byTier.advanced}` : '',
    sp.byTier.internal ? `int ${sp.byTier.internal}` : '',
    sp.byTier.unclassified ? `uncls ${sp.byTier.unclassified}` : '',
  ].filter(Boolean);
  const tiers = tierParts.length ? chalk.dim(` · ${tierParts.join(' · ')}`) : '';
  return `       ${chalk.dim('·')} ${sp.npmSubpath.padEnd(32)} flat ${String(sp.flat).padStart(4)}  ns ${String(sp.namespace).padStart(3)}${tiers}`;
}

function printSdkWideTiers(tiers: TierCounts): void {
  logLine('');
  logLine(chalk.bold.dim('       SDK-wide tiers (root + published subpaths)'));
  logLine(`       ${padLabel('stable')} ${tierColor('stable', tiers.stable)}`);
  logLine(`       ${padLabel('advanced')} ${tierColor('advanced', tiers.advanced)}`);
  logLine(`       ${padLabel('internal')} ${tierColor('internal', tiers.internal)}`);
  logLine(`       ${padLabel('unclassified')} ${tierColor('unclassified', tiers.unclassified)}`);
}

function printPublishedSubpathRollups(subpaths: SubpathRollup[], title = 'Published subpaths (rollup)'): void {
  if (!subpaths.length) return;
  logLine('');
  logLine(chalk.bold.dim(`       ${title}`));
  for (const sp of subpaths) logLine(formatSubpathRollupLine(sp));
}

export function printVerboseInventory(snapshot: InventorySnapshot, listView?: ListViewOptions): void {
  if (!canEmitVerboseReport()) return;
  const listLimit = resolveListLimit(listView);
  const flat = limitList(
    [...snapshot.symbols].sort((a, b) => a.name.localeCompare(b.name)),
    listLimit,
  );

  logLine('');
  logLine(chalk.bold.dim('       Symbols (root flat)'));
  logLine(chalk.dim(`${VERBOSE_INVENTORY_ROW_PREFIX}${formatVerboseInventoryHeader()}`));
  for (const sym of flat.items) {
    const tierPlain = formatInventoryTier(sym.tier);
    const tier =
      sym.tier === 'stable'
        ? chalk.green(tierPlain)
        : sym.tier === 'advanced'
          ? chalk.yellow(tierPlain)
          : sym.tier === 'internal'
            ? chalk.magenta(tierPlain)
            : chalk.red(tierPlain);
    const category = chalk.cyan(formatInventoryCategory(sym.category));
    const symbolKind = chalk.white(formatInventorySymbolKind(sym.symbolKind));
    const tierSource = sym.tierSource === 'tag' ? chalk.cyan('tag') : chalk.dim('fallback');
    logLine(
      `${VERBOSE_INVENTORY_ROW_PREFIX}${formatInventoryName(sym.name)} ${tier} ${category} ${symbolKind} ${chalk.dim(sym.targetSubpath)} ${chalk.dim('[')}${tierSource}${chalk.dim(']')}`,
    );
  }
  logListTruncation( flat.hiddenCount);

  if (snapshot.namespaces.length) {
    logLine('');
    logLine(chalk.bold.dim('       Namespaces (root)'));
    const namespaces = limitList(
      [...snapshot.namespaces].sort((a, b) => a.name.localeCompare(b.name)),
      listLimit,
    );
    for (const ns of namespaces.items) {
      const src = chalk.dim(compactCoreSourcePath(ns.sourceModule));
      logLine(
        `       ${chalk.dim('·')} ${ns.name.padEnd(20)} ${chalk.dim('→')} ${src} ${chalk.dim('·')} ${chalk.dim(ns.targetSubpath)}`,
      );
    }
    logListTruncation( namespaces.hiddenCount);
  }

  if (snapshot.summary.subpaths.length) {
    const subpaths = limitList(snapshot.summary.subpaths, listLimit);
    printPublishedSubpathRollups(subpaths.items);
    logListTruncation( subpaths.hiddenCount);
  }
}

export function printDiffReport(input: {
  rangeLabel: string;
  left: SnapshotResult;
  right: SnapshotResult;
  diff: DiffResult;
  listView?: ListViewOptions;
}): void {
  const { rangeLabel, left, right, diff } = input;
  const listLimit = resolveListLimit(input.listView);

  printMeta({
    range: rangeLabel,
    from: `${left.snapshot.refLabel} ${chalk.dim(`(${snapshotShaLabel(left.snapshot)})`)}`,
    to: `${right.snapshot.refLabel} ${chalk.dim(`(${snapshotShaLabel(right.snapshot)})`)}`,
    cache: `${cacheLabel(left.cache)} / ${cacheLabel(right.cache)}`,
  });

  logLine('');
  const dl = diff.summaryDelta.left.root;
  const dr = diff.summaryDelta.right.root;
  logLine(`       ${padLabel('root flat')} ${formatDelta(dl.flat, dr.flat)}`);
  logLine(`       ${padLabel('stable')} ${formatDelta(dl.stable, dr.stable)}`);
  logLine(`       ${padLabel('advanced')} ${formatDelta(dl.advanced, dr.advanced)}`);
  logLine(`       ${padLabel('internal')} ${formatDelta(dl.internal, dr.internal)}`);

  logLine('');
  if (diff.added.length) {
    const added = limitList(diff.added, listLimit);
    logLine(chalk.green.bold('       Added'));
    for (const name of added.items) logLine(`       ${chalk.green('+')} ${name}`);
    logListTruncation( added.hiddenCount);
    logLine('');
  }

  if (diff.removed.length) {
    const removed = limitList(diff.removed, listLimit);
    logLine(chalk.red.bold('       Removed'));
    for (const name of removed.items) logLine(`       ${chalk.red('-')} ${name}`);
    logListTruncation( removed.hiddenCount);
    logLine('');
  }

  if (!diff.added.length && !diff.removed.length) {
    logLine(chalk.dim('       No flat export additions or removals.'));
    logLine('');
  }

  if (diff.tierViolations.length) {
    logLine(chalk.yellow.bold('       Tier violations'));
    for (const v of diff.tierViolations) logLine(`       ${chalk.yellow('!')} ${v}`);
  } else {
    logLine(`       ${chalk.green('✓')} ${chalk.dim('No tier violations')}`);
  }
}

export function printDiffVerbose(input: {
  diff: DiffResult;
  left: InventorySnapshot;
  right: InventorySnapshot;
  listView?: ListViewOptions;
}): void {
  if (!canEmitVerboseReport()) return;
  const { diff, left, right } = input;
  const listLimit = resolveListLimit(input.listView);
  if (diff.added.length) {
    const added = limitList(diff.added, listLimit);
    logLine('');
    logLine(chalk.bold.dim('       Added detail'));
    for (const name of added.items) {
      const sym = right.symbols.find((s) => s.name === name);
      if (sym) {
        logLine(
          `       ${chalk.dim('·')} ${name} → ${sym.tier} · ${sym.category} · ${sym.symbolKind} → ${sym.targetSubpath}`,
        );
      }
    }
    logListTruncation( added.hiddenCount);
  }
  if (diff.removed.length) {
    const removed = limitList(diff.removed, listLimit);
    logLine('');
    logLine(chalk.bold.dim('       Removed detail'));
    for (const name of removed.items) {
      const sym = left.symbols.find((s) => s.name === name);
      if (sym) {
        logLine(
          `       ${chalk.dim('·')} ${name} → ${sym.tier} · ${sym.category} · ${sym.symbolKind} → ${sym.targetSubpath}`,
        );
      }
    }
    logListTruncation( removed.hiddenCount);
  }
}

export function printDiffCacheDetail(input: { left: SnapshotResult; right: SnapshotResult }): void {
  if (!canEmitVerboseReport()) return;
  const { left, right } = input;
  logLine('');
  logLine(chalk.bold.dim('       Cache detail'));
  logLine(`       ${padLabel('from')} ${left.snapshot.sha} ${chalk.dim(`(${left.cache})`)}`);
  logLine(`       ${padLabel('to')} ${right.snapshot.sha} ${chalk.dim(`(${right.cache})`)}`);
}

export function printValidateReport(input: {
  passed: boolean;
  violations: string[];
  notes: string[];
  verbose?: boolean;
  advancedFlatSymbols?: string[];
  internalFlatSymbols?: string[];
}): void {
  const { passed, violations, notes, verbose, advancedFlatSymbols = [], internalFlatSymbols = [] } = input;
  const noteLimit = verbose ? notes.length : 5;

  if (!passed) {
    logLine('');
    for (const v of violations) logLine(`       ${chalk.red('✗')} ${v}`);
    if (verbose && notes.length) {
      logLine('');
      logLine(chalk.bold.dim('       Notes'));
      for (const note of notes) logLine(`       ${chalk.dim('·')} ${note}`);
    }
    return;
  }

  logLine('');
  logLine(`       ${chalk.green('✓')} tsconfig paths ⊆ npm exports (wildcard flagged separately)`);
  logLine(`       ${chalk.green('✓')} no unclassified root flat exports`);
  for (const note of notes.slice(0, noteLimit)) logLine(`       ${chalk.dim('·')} ${note}`);
  if (!verbose && notes.length > 5) {
    logLine(`       ${chalk.dim(`…and ${notes.length - 5} more notes (use -v)`)}`);
  }

  if (verbose && internalFlatSymbols.length) {
    logLine('');
    logLine(chalk.bold.dim('       Internal-tier flat on root'));
    for (const name of internalFlatSymbols.sort()) logLine(`       ${chalk.magenta('·')} ${name}`);
  }

  if (verbose && advancedFlatSymbols.length) {
    logLine('');
    logLine(chalk.bold.dim('       Advanced-tier flat on root'));
    for (const name of advancedFlatSymbols.sort()) logLine(`       ${chalk.yellow('·')} ${name}`);
  }
}

export function printDoctorReport(input: {
  healthy: boolean;
  ok: string[];
  warnings: string[];
  hints: string[];
  verbose?: boolean;
}): void {
  const { healthy, ok, warnings, hints, verbose } = input;
  const hintLimit = verbose ? hints.length : 3;

  logLine('');
  for (const line of ok) logLine(`       ${chalk.green('✓')} ${line}`);
  for (const line of warnings) logLine(`       ${chalk.yellow('!')} ${line}`);
  for (const line of hints.slice(0, hintLimit)) logLine(`       ${chalk.dim('·')} ${line}`);
  if (!verbose && hints.length > hintLimit) {
    logLine(`       ${chalk.dim(`…and ${hints.length - hintLimit} more hints (use -v)`)}`);
  }
  if (healthy && !warnings.length) {
    logLine('');
    logLine(`       ${chalk.green('✓')} environment looks healthy`);
  }
}

export function printSuggestReport(input: {
  suggestion: { bucket: 'stable'; names: string[] };
  snippet: string;
  hints: string[];
  verbose?: boolean;
}): void {
  const { suggestion, snippet, hints, verbose } = input;
  const hintLimit = verbose ? hints.length : 3;

  logLine('');
  if (!suggestion.names.length) {
    logLine(`       ${chalk.green('✓')} no unclassified flat exports — tier rules cover the working tree`);
    return;
  }

  logLine(`       ${chalk.yellow('!')} ${suggestion.names.length} unclassified flat export(s) — add to tiers.${suggestion.bucket}.exact`);
  logLine('');
  logLine(chalk.bold.dim('       Suggested names'));
  for (const name of suggestion.names) logLine(`       ${chalk.cyan('·')} ${name}`);

  if (snippet) {
    logLine('');
    logLine(chalk.bold.dim('       Paste into expgov.config.ts'));
    for (const line of snippet.split('\n')) logLine(`       ${chalk.dim(line)}`);
  }

  if (hints.length) {
    logLine('');
    for (const hint of hints.slice(0, hintLimit)) logLine(`       ${chalk.dim('·')} ${hint}`);
    if (!verbose && hints.length > hintLimit) {
      logLine(`       ${chalk.dim(`…and ${hints.length - hintLimit} more hints (use -v)`)}`);
    }
  }
}

export function printTrendReport(input: {
  rows: {
    tag: string;
    sha: string;
    cache: CacheStatus;
    rollup: {
      rootFlat: number;
      stable: number;
      advanced: number;
      internal: number;
      byCategory: Record<string, number | undefined>;
    };
  }[];
  tagLimit: number;
  verbose?: boolean;
  listView?: ListViewOptions;
}): void {
  const listLimit = resolveListLimit(input.listView);
  const displayRows = limitList(input.rows, listLimit);

  printMeta({
    tags: chalk.dim(String(input.rows.length)),
    window: chalk.dim(`last ${input.tagLimit} version tags`),
  });

  if (!displayRows.items.length) {
    logLine('');
    logLine(chalk.dim('       No version tags found (git tag -l v*).'));
    return;
  }

  logLine('');
  logLine(
    chalk.dim(
      `       ${'tag'.padEnd(10)} ${'flat'.padStart(6)} ${'stable'.padStart(6)} ${'adv'.padStart(5)} ${'int'.padStart(4)}`,
    ),
  );
  for (const row of displayRows.items) {
    logLine(
      `       ${row.tag.padEnd(10)} ${String(row.rollup.rootFlat).padStart(6)} ${String(row.rollup.stable).padStart(6)} ${String(row.rollup.advanced).padStart(5)} ${String(row.rollup.internal).padStart(4)} ${chalk.dim(`(${row.cache})`)}`,
    );
  }
  logListTruncation( displayRows.hiddenCount);

  const first = displayRows.items[0]!;
  const last = displayRows.items[displayRows.items.length - 1]!;
  const delta = last.rollup.rootFlat - first.rollup.rootFlat;
  const pct = first.rollup.rootFlat ? ((delta / first.rollup.rootFlat) * 100).toFixed(1) : '0.0';
  logLine('');
  if (delta === 0) {
    logLine(`       ${chalk.dim(`Δ ${first.tag} → ${last.tag}: flat unchanged`)}`);
  } else if (delta > 0) {
    logLine(`       ${chalk.yellow(`Δ ${first.tag} → ${last.tag}: +${delta} flat (+${pct}%)`)}`);
  } else {
    logLine(`       ${chalk.green(`Δ ${first.tag} → ${last.tag}: ${delta} flat (${pct}%)`)}`);
  }

  if (input.verbose) {
    logLine('');
    logLine(chalk.bold.dim('       Categories (latest tag)'));
    for (const [cat, count] of Object.entries(last.rollup.byCategory).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))) {
      logLine(`       ${padLabel(cat, 14)} ${count ?? 0}`);
    }
  }
}

export function printTimelineReport(input: {
  range: { label: string; since: string; until: string };
  top: number;
  rows: {
    date: string;
    sha: string;
    subject: string;
    cache: CacheStatus;
    rollup: { rootFlat: number; stable: number };
    delta: number | null;
  }[];
  verbose?: boolean;
  warmStats?: { warmed: number; totalMs: number };
  gitStats?: string;
}): void {
  const topLabel = Number.isFinite(input.top) ? String(input.top) : 'all';
  printMeta({
    range: input.range.label,
    from: chalk.dim(input.range.since),
    to: chalk.dim(input.range.until),
    top: chalk.dim(topLabel),
    barrel: chalk.dim(`${input.rows.length} commits · ${getRootIndexRepoPath()}`),
    warm: input.warmStats
      ? chalk.dim(`${input.warmStats.warmed}/${input.rows.length} · ${input.warmStats.totalMs}ms`)
      : undefined,
    git: input.gitStats ? chalk.dim(input.gitStats) : undefined,
  });

  if (!input.rows.length) {
    logLine('');
    logLine(chalk.dim('       No commits touching the root barrel in this range.'));
    return;
  }
  logLine(
    chalk.dim(
      '       Δ = flat change vs row above (newest first); — = first row; +N/−N flat exports vs newer barrel edit',
    ),
  );

  logLine('');
  logLine(chalk.dim(`       ${'date'.padEnd(12)} ${'sha'.padEnd(9)} ${'flat'.padStart(5)} ${'Δ'.padStart(5)}  subject`));
  for (const row of input.rows) {
    let deltaStr: string;
    if (row.delta === null) deltaStr = chalk.dim('    —');
    else if (row.delta === 0) deltaStr = chalk.dim('    0');
    else if (row.delta > 0) deltaStr = chalk.yellow(` +${row.delta}`.padStart(4));
    else deltaStr = chalk.green(` ${row.delta}`.padStart(4));

    const subject = formatSubject(row.subject, 48, input.verbose);
    logLine(
      `       ${row.date.padEnd(12)} ${row.sha.slice(0, 7).padEnd(9)} ${String(row.rollup.rootFlat).padStart(5)} ${deltaStr}  ${subject}`,
    );
  }
}

export function printGraphReport(input: {
  ref: SourceRef;
  snapshot: InventorySnapshot;
  cache: CacheStatus;
  targetGroups: { targetSubpath: string; flat: number; namespace: number; modules: Map<string, number> }[];
  topModules: { module: string; edges: number; symbols: string[] }[];
  namespaces: { name: string; targetSubpath: string; module: string | null }[];
  verbose?: boolean;
  listView?: ListViewOptions;
}): void {
  const listLimit = resolveListLimit(input.listView);
  const targetGroups = limitList(input.targetGroups, listLimit);
  const namespaces = limitList(input.namespaces, listLimit);
  const topModules = limitList(input.topModules, listLimit);

  printMeta({
    ref: refLine(input.ref, input.snapshot),
    cache: cacheLabel(input.cache),
    edges: chalk.dim(String(input.snapshot.edges.length)),
    symbols: chalk.dim(String(input.snapshot.symbols.length)),
    subpaths: chalk.dim(String(input.snapshot.summary.subpaths.length)),
  });

  logLine('');
  logLine(chalk.bold.dim('       Root re-export targets (governance map)'));
  logLine(chalk.dim(`       ${'subpath'.padEnd(22)} ${'flat'.padStart(6)} ${'ns'.padStart(4)}`));
  for (const group of targetGroups.items) {
    logLine(
      `       ${group.targetSubpath.padEnd(22)} ${String(group.flat).padStart(6)} ${String(group.namespace).padStart(4)}`,
    );
  }
  logListTruncation( targetGroups.hiddenCount);

  printPublishedSubpathRollups(input.snapshot.summary.subpaths, 'Published npm subpaths');

  logLine('');
  logLine(chalk.bold.dim('       Root namespaces'));
  for (const ns of namespaces.items) {
    const src = compactCoreSourcePath(ns.module);
    logLine(
      `       ${chalk.dim('·')} ${ns.name.padEnd(18)} ${chalk.dim('→')} ${chalk.dim(src)} ${chalk.dim('·')} ${ns.targetSubpath}`,
    );
  }
  logListTruncation( namespaces.hiddenCount);

  logLine('');
  logLine(chalk.bold.dim('       Top source modules (edge count)'));
  for (const mod of topModules.items) {
    logLine(`       ${chalk.dim('·')} ${mod.edges.toString().padStart(4)}  ${mod.module}`);
    if (input.verbose && mod.symbols.length) {
      logLine(`       ${chalk.dim('     e.g.')} ${mod.symbols.join(', ')}`);
    }
  }
  logListTruncation( topModules.hiddenCount);
}

export function printExportError(err: ExportError): void {
  printHeader('error', chalk.red(err.message));
  printMeta({
    code: chalk.red(err.code),
    ...(err.details as Record<string, string | undefined>),
  });
}

export function printUnexpected(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  printHeader('error', chalk.red('Unexpected failure'));
  printMeta({ message });
  if (process.env.EXPORTS_DEBUG) {
    console.error(err);
  }
}
