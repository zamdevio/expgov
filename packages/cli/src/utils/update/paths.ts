import { mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const STATE_DIR = path.join(os.homedir(), '.expgov', 'state');
const STATE_FILE = path.join(STATE_DIR, 'version.json');

/** Absolute path to `~/.expgov/state/version.json`. */
export function getUpdateStateFilePath(): string {
  return STATE_FILE;
}

export function ensureVersionStateDirExists(): void {
  mkdirSync(STATE_DIR, { recursive: true });
}
