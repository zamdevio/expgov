import type { Command } from 'commander';

export function addListFlags(cmd: Command): Command {
  return cmd
    .option('-l, --top <n>', 'max list rows (default 10)')
    .option('--full', 'show all list rows without truncation');
}

export function addCacheFlags(cmd: Command): Command {
  return cmd
    .option('-f, --force', 'rebuild snapshot and overwrite cache')
    .option('-nch, --no-cache', 'skip cache');
}
