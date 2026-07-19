import type { Command } from 'commander';

import { getRunOptions } from '@expgov/core/internal';

/** Delegate to Commander outputHelp (root Workflows appendix lives in configureCliHelp.formatHelp). */
export function printCliHelp(program: Command, topic?: string): void {
  const run = getRunOptions();
  if (run.json || run.silent) return;

  const normalized = topic?.trim().toLowerCase();

  if (!normalized || normalized === 'all' || normalized === 'help') {
    program.outputHelp();
    return;
  }

  const sub = program.commands.find((cmd) => cmd.name() === normalized);
  if (sub) {
    sub.outputHelp();
    return;
  }

  program.outputHelp();
}
