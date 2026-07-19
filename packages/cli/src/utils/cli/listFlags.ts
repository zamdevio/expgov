import type { Command } from 'commander';

function collectString(value: string, previous: string[]): string[] {
  return previous.concat(value);
}

export function addListFlags(cmd: Command): Command {
  return cmd
    .option('-T, --top <n>', 'max list rows (default 10, min 1)', (v) => Number(v))
    .option('-F, --full', 'show all list rows without truncation');
}

/** Add shared tier and category filters. */
export function addFilterFlags(cmd: Command): Command {
  return cmd
    .option('--tier <tier>', 'filter by tier (repeatable)', collectString, [])
    .option('--category <category>', 'filter by category (repeatable)', collectString, []);
}

export function addCacheFlags(cmd: Command): Command {
  return cmd
    .option('-f, --force', 'rebuild snapshot and overwrite cache')
    .option('-nch, --no-cache', 'skip cache');
}
