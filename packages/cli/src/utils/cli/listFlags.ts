import type { Command } from 'commander';

function collectString(value: string, previous: string[]): string[] {
  return previous.concat(value);
}

export function addListFlags(cmd: Command): Command {
  return cmd
    .option('-T, --top <n>', 'max list rows (default 10, min 1)', (v) => Number(v))
    .option('-F, --full', 'show all list rows without truncation');
}

/** Shared list filters for inventory / diff detail / graph. */
export function addFilterFlags(cmd: Command): Command {
  return cmd
    .option('--tier <tier>', 'filter by tier (repeatable)', collectString, [])
    .option('--category <category>', 'filter by category (repeatable)', collectString, [])
    .option('--namespace <name>', 'filter by root namespace name (repeatable)', collectString, [])
    .option('--module <path>', 'filter by module path substring (repeatable)', collectString, [])
    .option('--subpath <subpath>', 'filter by target subpath (repeatable)', collectString, [])
    .option('--names-only', 'list bare names (implies detail; skips tier/module columns)');
}

export function addCacheFlags(cmd: Command): Command {
  return cmd
    .option('-f, --force', 'rebuild snapshot and overwrite cache')
    .option('-nch, --no-cache', 'skip cache');
}
