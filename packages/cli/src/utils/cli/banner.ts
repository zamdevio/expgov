import type { Command } from 'commander';

import { formatBoxHeader, getRunOptions } from '@expgov/core';

import { CLI_ROOT_TAGLINE } from '../../constants/cli.js';

const BANNER_SUBTITLES: Record<string, string> = {
  init: 'expgov.config.ts — export governance scaffold',
  inventory: 'root barrel export summary',
  diff: 'compare export surfaces between refs',
  validate: 'tsconfig ↔ npm parity + tier governance',
  doctor: 'config discovery and cache hygiene',
  suggest: 'tier allowlist suggestions for unclassified exports',
  trend: 'export counts across release tags',
  timeline: 'commits that changed the root export barrel',
  graph: 're-export governance map',
  help: 'command usage reference',
};

export function maybePrintCommandBanner(cmd: Command): void {
  const run = getRunOptions();
  if (run.json || run.silent) return;

  const name = cmd.name();
  if (!name) return;

  const subtitle = BANNER_SUBTITLES[name] ?? CLI_ROOT_TAGLINE;
  const title = name.charAt(0).toUpperCase() + name.slice(1);
  console.log(formatBoxHeader(title, subtitle));
  console.log('');
}
