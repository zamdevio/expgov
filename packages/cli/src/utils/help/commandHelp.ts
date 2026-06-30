import { formatGitCommitRangeHelp, formatTimelineRangeHelp } from '@expgov/core';
import type { CommandHelpExtra } from '../../types/help/index.js';

const COMMAND_HELP_EXTRAS: Record<string, CommandHelpExtra> = {
  init: {
    examples: ['expgov init', 'expgov init -y', 'expgov init --rich'],
    related: ['inventory', 'validate', 'doctor'],
  },
  inventory: {
    examples: ['expgov inventory', 'expgov inventory HEAD -v', 'expgov inventory -T 5'],
    related: ['validate', 'graph', 'suggest'],
  },
  diff: {
    examples: [
      'expgov diff HEAD',
      'expgov diff HEAD~30..HEAD~1',
      'expgov diff v1.0.0..v2.0.0',
      'expgov diff -F',
    ],
    rangeFormats: () => [
      '(omit)                   HEAD → working tree',
      'v0.1.4                   v0.1.4 → working tree',
      ...formatGitCommitRangeHelp(),
    ],
    related: ['validate', 'trend', 'timeline'],
  },
  validate: {
    examples: ['expgov validate', 'expgov validate -v'],
    related: ['suggest', 'inventory', 'doctor'],
  },
  doctor: {
    examples: ['expgov doctor', 'expgov doctor -v'],
    related: ['init', 'validate'],
  },
  suggest: {
    examples: ['expgov suggest', 'expgov suggest -v'],
    related: ['validate', 'inventory'],
  },
  trend: {
    examples: ['expgov trend', 'expgov trend --tags 8', 'expgov trend -T 5'],
    related: ['diff', 'timeline', 'validate'],
  },
  timeline: {
    examples: [
      'expgov timeline',
      'expgov timeline @3m',
      'expgov timeline HEAD~20',
      'expgov timeline HEAD~30..HEAD~1',
      'expgov timeline -T 15',
    ],
    rangeFormats: formatTimelineRangeHelp,
    related: ['diff', 'trend', 'graph'],
  },
  graph: {
    examples: ['expgov graph', 'expgov graph HEAD -v', 'expgov graph -T 8'],
    related: ['inventory', 'diff'],
  },
  version: {
    examples: ['expgov version', 'expgov version --check'],
    related: ['doctor'],
  },
};

/** Raw Examples / Range formats / Related appendix for Commander formatHelp (before colorize). */
export function formatCommandHelpExtras(commandName: string): string {
  const extra = COMMAND_HELP_EXTRAS[commandName];
  if (!extra) return '';

  const lines: string[] = [];
  if (extra.examples?.length) {
    lines.push('', 'Examples:');
    for (const ex of extra.examples) lines.push(`  ${ex}`);
  }
  if (extra.rangeFormats) {
    lines.push('', 'Range formats:');
    for (const line of extra.rangeFormats()) lines.push(`  ${line}`);
  }
  if (extra.related?.length) {
    lines.push('', 'Related:');
    lines.push(`  ${extra.related.join('  ·  ')}`);
  }
  return lines.length ? lines.join('\n') : '';
}
