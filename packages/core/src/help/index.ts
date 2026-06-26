import chalk from 'chalk';

import { tryGetProjectContext } from '../context/index.js';
import { getRunOptions } from '../runtime/runOptions.js';
import { canPrintTip } from '../runtime/policy.js';
import { BRAND, style } from '../runtime/style.js';
import { formatTimelineRangeHelp } from '../time/index.js';

function cmd(name: string, args = ''): string {
  return `  ${style.accent(`expgov ${name}`)} ${style.dim(args)}`;
}

function section(title: string, lines: string[]): void {
  console.log(`\n${chalk.bold(title)}`);
  for (const line of lines) console.log(line);
}

export type HelpTopic =
  | 'all'
  | 'init'
  | 'inventory'
  | 'diff'
  | 'validate'
  | 'trend'
  | 'timeline'
  | 'graph'
  | 'help';

export function printHelp(topic: HelpTopic = 'all'): void {
  const run = getRunOptions();
  if (run.json || run.silent) return;

  const ctx = tryGetProjectContext();
  const packageName = ctx?.packageName ?? '<package>';
  const rootBarrel = ctx?.rootIndexRepoPath ?? '<root-barrel>';
  console.log(`\n${BRAND()}  ${chalk.bold(`maintainer tools for ${packageName} export surface`)}`);

  if (topic === 'all' || topic === 'init') {
    section('init — scaffold expgov.config.ts', [
      cmd('init', '[flags]'),
      '',
      `  ${chalk.dim('Creates')} ${chalk.white('expgov.config.ts')} with safe defaults (detects monorepo vs single-package layout).`,
      `  ${chalk.dim('Skips')} when config exists unless ${chalk.white('--force')}.`,
      '',
      `  ${chalk.bold('Flags')}`,
      `    -y, --yes       write without prompts (CI / non-TTY)`,
      `    -f, --force     overwrite existing expgov.config.ts`,
      `    -r, --rich      commented tiers.stable.exact examples`,
      `    -h, --help      show this section`,
    ]);
  }

  if (topic === 'all' || topic === 'inventory') {
    section('inventory — summarize root barrel exports', [
      cmd('inventory', '[ref] [flags]'),
      '',
      `  ${chalk.dim('Prints')} root flat count, namespace count, tier and category breakdown.`,
      `  ${chalk.dim('Default ref')} working tree (includes uncommitted edits).`,
      '',
      `  ${chalk.bold('Refs')}`,
      `    ${chalk.dim('(omit)')}     working tree`,
      `    HEAD         committed HEAD`,
      `    v0.1.4       tag`,
      `    d60df9e      short commit SHA (git must resolve uniquely)`,
      '',
      `  ${chalk.bold('Flags')}`,
      `    -v, --verbose   symbol table: tier, category, symbolKind, targetSubpath; subpath rollups`,
      `    -f, --force     rebuild snapshot and overwrite .exports/cache/ for this run`,
      `    --no-cache      build fresh but skip reading/writing .exports/cache/ (status: bypass)`,
      `    -h, --help      show this section`,
      '',
      `  ${chalk.bold('Output')}`,
      `    ${chalk.dim('root flat')}   count of flat exports on ${rootBarrel}`,
      `    ${chalk.dim('stable/advanced/internal')}   governance tiers (see expgov tier config)`,
      `    ${chalk.dim('cache')}   hit/miss against .exports/cache/<sha>/inventory.full.json`,
    ]);
  }

  if (topic === 'all' || topic === 'diff') {
    section('diff — compare export surfaces between refs', [
      cmd('diff', '[ref|A..B] [flags]'),
      '',
      `  ${chalk.dim('Default')} HEAD → working tree.`,
      '',
      `  ${chalk.bold('Forms')}`,
      `    ${chalk.dim('(omit)')}           HEAD → working tree`,
      `    v0.1.4               v0.1.4 → working tree`,
      `    v0.1.3..v0.1.4       tag range (two commits)`,
      `    a6caa74..HEAD        SHA or tag .. SHA or tag`,
      '',
      `  ${chalk.bold('Flags')}`,
      `    -v, --verbose   category, symbolKind, targetSubpath for each added/removed symbol`,
      `    -f, --force     rebuild snapshots and overwrite cache for both refs`,
      `    --no-cache      build fresh without reading or writing cache`,
      `    -h, --help      show this section`,
      '',
      `  ${chalk.bold('Output')}`,
      `    ${chalk.dim('Added/Removed')}   flat export names only (namespaces not listed here)`,
      `    ${chalk.dim('Tier violations')}   internal/advanced symbols promoted against policy`,
    ]);
  }

  if (topic === 'all' || topic === 'validate') {
    section('validate — governance checks on working tree', [
      cmd('validate', '[flags]'),
      '',
      `  ${chalk.dim('Exits')} 0 when checks pass, 1 when they fail.`,
      '',
      `  ${chalk.bold('Flags')}`,
      `    -v, --verbose   all notes, path parity gaps, tier flat leaks`,
      `    --since=<ref>   reserved for future delta validation`,
      `    -h, --help      show this section`,
      '',
      `  ${chalk.bold('Output')}`,
      `    ${chalk.dim('✓/✗ lines')}   tsconfig ↔ npm exports parity, unclassified root flats`,
      `    ${chalk.dim('notes')}   policy gaps (internal/advanced still flat on root, etc.)`,
    ]);
  }

  if (topic === 'all' || topic === 'trend') {
    section('trend — export counts across release tags', [
      cmd('trend', '[flags]'),
      '',
      `  ${chalk.dim('Prints')} root flat / stable / advanced / internal per \`v*\` tag.`,
      `  ${chalk.dim('Warms')} cache for each tag when missing.`,
      '',
      `  ${chalk.bold('Flags')}`,
      `    --tags=<n>      last N version tags (default 12)`,
      `    -v, --verbose   category breakdown on latest tag`,
      `    -f, --force     rebuild every tag snapshot and overwrite cache`,
      `    --no-cache      build fresh without reading or writing cache`,
      `    -h, --help      show this section`,
      '',
      `  ${chalk.bold('Output')}`,
      `    ${chalk.dim('flat/stable/adv/int')}   per-tag root export counts; Δ footer compares first vs last tag in window`,
    ]);
  }

  if (topic === 'all' || topic === 'timeline') {
    section('timeline — commits that changed the root export barrel', [
      cmd('timeline', '[range] [flags]'),
      '',
      `  ${chalk.dim('Default range')} @4w (last 4 weeks, UTC).`,
      `  ${chalk.dim('Scope')} git log on ${chalk.white(rootBarrel)} only — not every repo commit.`,
      `  ${chalk.dim('Example')} @3m has ~330 repo commits but only commits that edit the root barrel appear.`,
      '',
      `  ${chalk.bold('Range formats')}`,
      ...formatTimelineRangeHelp().map((line) => `    ${chalk.dim(line)}`),
      '',
      `  ${chalk.bold('Output')}`,
      `    ${chalk.dim('flat')}   root flat export count at that commit`,
      `    ${chalk.dim('Δ')}      change in flat vs the row above (newest commit first; — on first row)`,
      `    ${chalk.dim('       ')} +N = N more flat exports than the newer barrel edit above; -N = N fewer`,
      `    ${chalk.dim('       ')} only steps between consecutive barrel edits, not every repo commit`,
      '',
      `  ${chalk.bold('Flags')}`,
      `    --limit=<n>     max commits (default 20; 0 = no limit)`,
      `    -v, --verbose   full subjects; per-commit warm timing on stderr`,
      `    -f, --force     rebuild every commit snapshot and overwrite cache`,
      `    --no-cache      build fresh without reading or writing cache`,
      `    -h, --help      show this section`,
    ]);
  }

  if (topic === 'all' || topic === 'graph') {
    section('graph — re-export map (target subpaths + modules)', [
      cmd('graph', '[ref] [flags]'),
      '',
      `  ${chalk.dim('Prints')} governance groups from snapshot edges[] and root namespaces.`,
      `  ${chalk.dim('Default ref')} working tree.`,
      '',
      `  ${chalk.bold('Flags')}`,
      `    -v, --verbose   all subpath groups, sample symbols per module`,
      `    -f, --force     rebuild snapshot and overwrite cache`,
      `    --no-cache      build fresh without reading or writing cache`,
      `    -h, --help      show this section`,
      '',
      `  ${chalk.bold('Output')}`,
      `    ${chalk.dim('By target subpath')}   governance grouping (flat + namespace counts per npm subpath)`,
      `    ${chalk.dim('Root namespaces')}   export * as name → source file → target subpath`,
    ]);
  }

  if (topic === 'all' || topic === 'help') {
    section('help', [cmd('help'), '', `  ${chalk.dim('Prints')} full usage.`]);
  }

  if (topic === 'all') {
    section('global', [
      `  ${chalk.bold('Commands')} init, inventory, diff, validate, trend, timeline, graph, help`,
      `  ${chalk.bold('Global flags')}`,
      `    -j, --json      machine-readable JSON envelope (stdout)`,
      `    -q, --quiet     suppress info logs and tips; keep primary command output`,
      `    -s, --silent    suppress all human output except errors and --json`,
      `    -C, --cwd       project root`,
      `    --config        path to expgov.config.ts`,
      `    --no-color      disable color output`,
      `  ${chalk.bold('Cache')}   ${chalk.dim('.exports/cache/')} per-sha: inventory.full.json, timeline.summary.json`,
      `  ${chalk.bold('Config')}  ${chalk.dim('expgov.config.ts')}`,
      `  ${chalk.bold('Output')}  each command section above documents key columns and labels`,
      `  ${chalk.bold('Debug')}   EXPORTS_DEBUG=1 for unexpected error stacks`,
      '',
      `  ${chalk.dim('Resolving a ref warms')} ${chalk.dim('.exports/cache/')} ${chalk.dim('(gitignored). Nothing is committed to the repo.')}`,
    ]);
  }

  console.log('');
}

export function printHelpHint(command?: string): void {
  if (!canPrintTip(getRunOptions())) return;
  const hint = command
    ? `Run ${chalk.cyan(`expgov ${command} --help`)} for command-specific usage.`
    : `Run ${chalk.cyan('expgov --help')} for full usage.`;
  console.log(`${BRAND()}  ${chalk.dim('hint')}  ${hint}\n`);
}
