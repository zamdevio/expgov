import { writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { coreLog, coreLogTip, runInit } from '@expgov/core';

import { CONFIG_FILE_NAME } from '../../constants/cli.js';
import { getCliYesFlag } from '../../shared/context/globals.js';
import { shouldSkipInteractivePrompts } from '../../utils/interactive/index.js';
import { confirmOverwriteExisting, confirmWriteConfig } from './prompts.js';

export interface EnsureConfigOptions {
  yes?: boolean;
  force?: boolean;
  rich?: boolean;
}

function displayPath(cwd: string, target: string): string {
  const rel = path.relative(cwd, target);
  return rel && !rel.startsWith('..') ? rel : target;
}

function emitInitGuidance(): void {
  coreLogTip(`Next: run \`expgov validate\` then \`expgov inventory\` to inspect your root barrel.`);
  coreLogTip(`Add root flat symbols to \`tiers.stableExact\` in ${CONFIG_FILE_NAME} as your SDK surface grows.`);
}

export async function ensureConfig(opts: EnsureConfigOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const target = path.join(cwd, CONFIG_FILE_NAME);
  const exists = existsSync(target);
  const nonInteractive = shouldSkipInteractivePrompts() || opts.yes || getCliYesFlag();

  if (exists && !opts.force) {
    coreLog(
      'info',
      `Config already exists (${displayPath(cwd, target)}) — nothing to create. Use --force to overwrite.`,
    );
    emitInitGuidance();
    return;
  }

  if (exists && opts.force) {
    coreLog('warn', `Overwriting existing ${displayPath(cwd, target)} (--force).`);
  }

  const plan = runInit(cwd, { rich: Boolean(opts.rich) });
  const body = plan.proposedConfigSource;

  if (!body) {
    coreLog('warn', 'Init produced no config body — nothing to create.');
    process.exitCode = 1;
    return;
  }

  for (const note of plan.detection.notes) {
    coreLog('info', note);
  }

  if (!nonInteractive) {
    const ok = exists
      ? await confirmOverwriteExisting()
      : await confirmWriteConfig(CONFIG_FILE_NAME);
    if (!ok) {
      coreLog('warn', 'Skipping config file; run init again with --yes to write without prompting.');
      return;
    }
  }

  writeFileSync(target, body, 'utf8');
  coreLog('info', exists ? `Updated ${displayPath(cwd, target)}` : `Created ${displayPath(cwd, target)}`);
  emitInitGuidance();
}
