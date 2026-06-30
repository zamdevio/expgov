import type { Command } from 'commander';
import { formatBoxHeader, getRunOptions } from '@expgov/core';
import { CLI_NAME, CLI_ROOT_TAGLINE } from '../../constants/cli.js';
import { COMMAND_SUBTITLES } from '../../constants/commandSubtitles.js';

export function maybePrintCommandBanner(cmd: Command, root?: Command): void {
  const run = getRunOptions();
  if (run.json || run.silent) return;

  const name = cmd.name();
  if (!name || name === 'help' || name === CLI_NAME) return;
  if (root && cmd === root) return;

  const subtitle = COMMAND_SUBTITLES[name] ?? CLI_ROOT_TAGLINE;
  const title = name.charAt(0).toUpperCase() + name.slice(1);
  console.log(formatBoxHeader(title, subtitle));
  console.log('');
}
