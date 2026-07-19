

import { tryGetProjectContext } from '../context/index.js';
import { DEFAULT_CACHE_DIR } from '../shared/constants/cache.js';
import { getRunOptions } from '../runtime/runOptions.js';
import { canPrintTip } from '../runtime/policy.js';
import { BRAND, style } from '../runtime/style.js';
import { formatGitCommitRangeHelp } from '../git/index.js';
import { formatTimelineRangeHelp } from '../time/index.js';
import type { HelpTopic } from '../types/help/topic.js';

function cmd(name: string, args = ''): string {
  return `  ${style.accent(`expgov ${name}`)} ${style.dim(args)}`;
}

function section(title: string, lines: string[]): void {
  console.log(`\n${style.bold(title)}`);
  for (const line of lines) console.log(line);
}

export function printHelp(topic: HelpTopic = 'all'): void {
  const run = getRunOptions();
  if (run.json || run.silent) return;

  const ctx = tryGetProjectContext();
  const packageName = ctx?.packageName ?? '<package>';
  const rootBarrel = ctx?.rootIndexRepoPath ?? '<root-barrel>';
  console.log(`\n${BRAND()}  ${style.bold(`maintainer tools for ${packageName} export surface`)}`);

  if (topic === 'all' || topic === 'init') {
    section('init — scaffold expgov.config.ts', [
      cmd('init', '[flags]'),
      '',
      `  ${style.dim('Creates')} ${style.white('expgov.config.ts')} with safe defaults (detects monorepo vs single-package layout).`,
      `  ${style.dim('Skips')} when config exists unless ${style.white('--force')}.`,
      '',
      `  ${style.bold('Flags')}`,
      `    -y, --yes       write without prompts (CI / non-TTY)`,
      `    -f, --force     overwrite existing expgov.config.ts`,
      `    -r, --rich      commented cache + tier examples (stable, internal, advanced)`,
      `    -h, --help      show this section`,
    ]);
  }

  if (topic === 'all' || topic === 'inventory') {
    section('inventory — summarize root barrel exports', [
      cmd('inventory', '[ref] [flags]'),
      '',
      `  ${style.dim('Prints')} root flat count, namespace count, tier and category breakdown.`,
      `  ${style.dim('Default ref')} working tree (includes uncommitted edits).`,
      '',
      `  ${style.bold('Refs')}`,
      `    ${style.dim('(omit)')}     working tree`,
      `    HEAD         committed HEAD`,
      `    v0.1.4       tag`,
      `    d60df9e      short commit SHA (git must resolve uniquely)`,
      '',
      `  ${style.bold('Flags')}`,
      `    -v, --verbose   symbol table: tier (+ provenance), category, symbolKind, targetSubpath; subpath rollups`,
      `    -f, --force     rebuild snapshot and overwrite ${DEFAULT_CACHE_DIR}/ for this run`,
      `    --no-cache      build fresh but skip reading/writing ${DEFAULT_CACHE_DIR}/ (status: bypass)`,
      `    -h, --help      show this section`,
      '',
      `  ${style.bold('Output')}`,
      `    ${style.dim('root flat')}   count of flat exports on ${rootBarrel}`,
      `    ${style.dim('stable/advanced/internal')}   governance tiers (see expgov tier config)`,
      `    ${style.dim('cache')}   hit · miss · refresh · bypass (--no-cache) · disabled (config)`,
    ]);
  }

  if (topic === 'all' || topic === 'diff') {
    section('diff — compare export surfaces between refs', [
      cmd('diff', '[ref|A..B] [flags]'),
      '',
      `  ${style.dim('Default')} HEAD → working tree.`,
      '',
      `  ${style.bold('Forms')}`,
      `    ${style.dim('(omit)')}           HEAD → working tree`,
      `    v0.1.4               v0.1.4 → working tree`,
      `    v0.1.3..v0.1.4       two commits (older..newer; order matters)`,
      ...formatGitCommitRangeHelp().map((line) => `    ${style.dim(line)}`),
      `    ${style.dim('Note')}   single ref compares that commit to the working tree, not HEAD`,
      '',
      `  ${style.bold('Flags')}`,
      `    -v, --verbose   category, symbolKind, targetSubpath for each added/removed symbol`,
      `    -f, --force     rebuild snapshots and overwrite cache for both refs`,
      `    --no-cache      build fresh without reading or writing cache`,
      `    -h, --help      show this section`,
      '',
      `  ${style.bold('Output')}`,
      `    ${style.dim('Added/Removed')}   flat export names only (namespaces not listed here)`,
      `    ${style.dim('Tier violations')}   internal/advanced symbols promoted against policy`,
    ]);
  }

  if (topic === 'all' || topic === 'validate') {
    section('validate — governance checks on working tree', [
      cmd('validate', '[flags]'),
      '',
      `  ${style.dim('Exits')} 0 when checks pass, 1 when they fail.`,
      '',
      `  ${style.bold('Flags')}`,
      `    -v, --verbose   all notes, path parity gaps, tier flat leaks`,
      `    --since=<ref>   fail if flat exports were removed since ref (overrides git.compatBaseline)`,
      `    -h, --help      show this section`,
      '',
      `  ${style.bold('Output')}`,
      `    ${style.dim('✓/✗ lines')}   tsconfig ↔ npm exports parity, unclassified root flats`,
      `    ${style.dim('notes')}   policy gaps (internal/advanced still flat on root, etc.)`,
    ]);
  }

  if (topic === 'all' || topic === 'doctor') {
    section('doctor — config discovery and cache hygiene', [
      cmd('doctor', '[flags]'),
      '',
      `  ${style.dim('Read-only')} setup checks — config paths, cache gitignore, tsconfig/npm drift hints.`,
      `  ${style.dim('Exits')} 0 when healthy, 1 when actionable warnings remain.`,
      '',
      `  ${style.bold('Flags')}`,
      `    -v, --verbose   extra hints (parity detail, cache snapshot count)`,
      `    -h, --help      show this section`,
      '',
      `  ${style.bold('Checks')}`,
      `    ${style.dim('config')}   package name, barrel, tsconfig, core package.json`,
      `    ${style.dim('cache')}   ${DEFAULT_CACHE_DIR}/ gitignored when present`,
      `    ${style.dim('drift')}   tsconfig ↔ npm exports parity (hints only — use validate for enforcement)`,
    ]);
  }

  if (topic === 'all' || topic === 'suggest') {
    section('suggest — tier allowlist suggestions (dry-run)', [
      cmd('suggest', '[flags]'),
      '',
      `  ${style.dim('Read-only')} — lists unclassified flat exports and prints names to add to tiers.stable.exact.`,
      `  ${style.dim('Does not')} edit expgov.config.ts.`,
      `  ${style.dim('Exits')} 0 when nothing to suggest, 1 when unclassified exports remain.`,
      '',
      `  ${style.bold('Flags')}`,
      `    -v, --verbose   subpath unclassified detail`,
      `    -h, --help      show this section`,
      '',
      `  ${style.bold('Workflow')}`,
      `    ${style.dim('1')} expgov suggest   copy suggested names into tier config`,
      `    ${style.dim('2')} expgov validate  confirm governance passes`,
    ]);
  }

  if (topic === 'all' || topic === 'trend') {
    section('trend — export counts across release tags', [
      cmd('trend', '[flags]'),
      '',
      `  ${style.dim('Prints')} root flat / stable / advanced / internal per \`v*\` tag.`,
      `  ${style.dim('Warms')} cache for each tag when missing.`,
      '',
      `  ${style.bold('Flags')}`,
      `    --tags=<n>      last N version tags (default 12)`,
      `    -v, --verbose   category breakdown on latest tag`,
      `    -f, --force     rebuild every tag snapshot and overwrite cache`,
      `    --no-cache      build fresh without reading or writing cache`,
      `    -h, --help      show this section`,
      '',
      `  ${style.bold('Output')}`,
      `    ${style.dim('flat/stable/adv/int')}   per-tag root export counts; Δ footer compares first vs last tag in window`,
    ]);
  }

  if (topic === 'all' || topic === 'timeline') {
    section('timeline — commits that changed the root export barrel', [
      cmd('timeline', '[range] [flags]'),
      '',
      `  ${style.dim('Default range')} @4w (last 4 weeks, UTC).`,
      `  ${style.dim('Scope')} only commits that edited ${style.white(rootBarrel)} — not every repo commit in the window.`,
      `  ${style.dim('Example')} @3m may cover hundreds of repo commits but the table lists barrel edits only.`,
      '',
      `  ${style.bold('Git ref ranges')} ${style.dim('(same grammar as diff)')}`,
      `    ${style.dim('Single ref')} HEAD~20  →  HEAD~20..HEAD`,
      `    ${style.dim('Two refs')}   older..newer  — left is exclusive, right is the endpoint; order matters`,
      `    ${style.dim('HEAD~N')}     the commit N parents back from HEAD (not “last N commits”)`,
      `    ${style.dim('Filter')}     git log left..right on the barrel path; rows = commits that touched the barrel`,
      `    ${style.dim('Example')}   HEAD~30..HEAD~1  — barrel history between those anchors, excluding tip`,
      `    ${style.dim('Reversed')}   newer..older is usually empty; use older..newer`,
      '',
      `  ${style.bold('Range formats')}`,
      ...formatTimelineRangeHelp().map((line) => `    ${style.dim(line)}`),
      '',
      `  ${style.bold('Output')}`,
      `    ${style.dim('flat')}   root flat export count at that commit`,
      `    ${style.dim('Δ')}      change in flat vs the row above (newest commit first; — on first row)`,
      `    ${style.dim('       ')} +N = N more flat exports than the newer barrel edit above; -N = N fewer`,
      `    ${style.dim('       ')} only steps between consecutive barrel edits, not every repo commit`,
      '',
      `  ${style.bold('Flags')}`,
      `    -T, --top <n>   max commits to show (default 10, min 1); -F/--full for all in range`,
      `    -v, --verbose   full subjects; all per-commit snapshot warm lines (default: latest only)`,
      `    -f, --force     rebuild every commit snapshot and overwrite cache`,
      `    --no-cache      build fresh without reading or writing cache`,
      `    -h, --help      show this section`,
    ]);
  }

  if (topic === 'all' || topic === 'graph') {
    section('graph — re-export map (target subpaths + modules)', [
      cmd('graph', '[ref] [flags]'),
      '',
      `  ${style.dim('Prints')} governance groups from snapshot edges[] and root namespaces.`,
      `  ${style.dim('Default ref')} working tree.`,
      '',
      `  ${style.bold('Flags')}`,
      `    -v, --verbose   all subpath groups, sample symbols per module`,
      `    -f, --force     rebuild snapshot and overwrite cache`,
      `    --no-cache      build fresh without reading or writing cache`,
      `    -h, --help      show this section`,
      '',
      `  ${style.bold('Output')}`,
      `    ${style.dim('By target subpath')}   governance grouping (flat + namespace counts per npm subpath)`,
      `    ${style.dim('Root namespaces')}   export * as name → source file → target subpath`,
    ]);
  }

  if (topic === 'all' || topic === 'version') {
    section('version — CLI and SDK versions', [
      cmd('version', '[flags]'),
      '',
      `  ${style.dim('Prints')} current CLI and @expgov/core SDK semver lines.`,
      `  ${style.dim('Alias')} ${style.white('expgov -V')} when no subcommand is present.`,
      '',
      `  ${style.bold('Flags')}`,
      `    --check         fetch latest from npm registry; show upgrade hint when newer`,
      `    --reset         clear cached update check (~/.expgov/state/version.json)`,
      `    ${style.dim('Env')} ${style.white('EXPGOV_NO_UPDATE_CHECK=1')} skips registry fetch on --check`,
    ]);
  }

  if (topic === 'all' || topic === 'help') {
    section('help', [cmd('help'), '', `  ${style.dim('Prints')} full usage.`]);
  }

  if (topic === 'all') {
    section('global', [
      `  ${style.bold('Commands')} init, inventory, diff, validate, doctor, suggest, trend, timeline, graph, version, help`,
      `  ${style.bold('Global flags')}`,
      `    -j, --json      machine-readable JSON envelope (stdout)`,
      `    -q, --quiet     suppress info logs and tips; keep primary command output`,
      `    -s, --silent    suppress all human output except errors and --json`,
      `    -C, --cwd       project root`,
      `    -c, --config    path to expgov.config.ts`,
      `    -ncl, --no-color disable color output (also NO_COLOR env, non-TTY)`,
      `    -T, --top <n>   max list rows (default 10, min 1); -F/--full for no cap`,
      `    -F, --full          show all list rows (no truncation)`,
      `  ${style.bold('Cache')}   ${style.dim(`${DEFAULT_CACHE_DIR}/`)} per-sha: inventory.full.json, timeline.summary.json`,
      `  ${style.bold('Config')}  ${style.dim('expgov.config.ts')}`,
      `  ${style.bold('Output')}  each command section above documents key columns and labels`,
      `  ${style.bold('Debug')}   EXPORTS_DEBUG=1 for unexpected error stacks`,
      '',
      `  ${style.dim('Resolving a ref warms')} ${style.dim(`${DEFAULT_CACHE_DIR}/`)} ${style.dim('(gitignored). Nothing is committed to the repo.')}`,
    ]);
  }

  console.log('');
}

export function printHelpHint(command?: string): void {
  if (!canPrintTip(getRunOptions())) return;
  const hint = command
    ? `Run ${style.accent(`expgov ${command} --help`)} for command-specific usage.`
    : `Run ${style.accent('expgov --help')} for full usage.`;
  console.log(`${BRAND()}  ${style.dim('hint')}  ${hint}\n`);
}
