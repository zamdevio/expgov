import { style } from '@expgov/core';

const WORKFLOW_LINES = [
  'New export surface     init → inventory → validate',
  'Release review         trend → diff v1..v2 → validate',
  'API archaeology        timeline @3m → diff <sha>..HEAD',
  'Dependency map         graph → inventory -v',
] as const;

/** Root help only — appended in configureCliHelp.formatHelp so -h/--help matches bare expgov. */
export function formatWorkflowAppendix(): string {
  const lines = [
    '',
    style.bold(style.magenta('Workflows:')),
    ...WORKFLOW_LINES.map((line) => `  ${style.dim(line)}`),
    '',
  ];
  return lines.join('\n');
}
