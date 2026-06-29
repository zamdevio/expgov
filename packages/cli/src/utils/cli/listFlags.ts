import type { Command } from 'commander';

export function addListFlags(cmd: Command): Command {
  return cmd
    .option('-T, --top <n>', 'max list rows (default 10, min 1)', (v) => Number(v))
    .option('-F, --full', 'show all list rows without truncation');
}

export function addCacheFlags(cmd: Command): Command {
  return cmd
    .option('-f, --force', 'rebuild snapshot and overwrite cache')
    .option('-nch, --no-cache', 'skip cache');
}
