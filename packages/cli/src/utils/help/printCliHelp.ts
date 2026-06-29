import type { Command } from 'commander';

import { getRunOptions, style } from '@expgov/core';

const WORKFLOW_LINES = [
  'New export surface     init → inventory → validate',
  'Release review         trend → diff v1..v2 → validate',
  'API archaeology        timeline @3m → diff <sha>..HEAD',
  'Dependency map         graph → inventory -v',
] as const;

function printWorkflowAppendix(): void {
  console.log('');
  console.log(style.bold(style.magenta('Workflows:')));
  for (const line of WORKFLOW_LINES) {
    console.log(`  ${style.dim(line)}`);
  }
  console.log('');
}

/** Commander `-h` output; root help appends workflow cheat sheet. */
export function printCliHelp(program: Command, topic?: string): void {
  const run = getRunOptions();
  if (run.json || run.silent) return;

  const normalized = topic?.trim().toLowerCase();

  if (!normalized || normalized === 'all' || normalized === 'help') {
    program.outputHelp();
    printWorkflowAppendix();
    return;
  }

  const sub = program.commands.find((cmd) => cmd.name() === normalized);
  if (sub) {
    sub.outputHelp();
    return;
  }

  program.outputHelp();
  printWorkflowAppendix();
}
