import type { RunOptions } from '../types/runtime/run.js';

const defaults: RunOptions = {
  json: false,
  jsonPretty: true,
  quiet: false,
  silent: false,
  noColor: false,
  noLogChannel: false,
  noLogPrefix: false,
  verbose: false,
};

let active: RunOptions = { ...defaults };

export function setRunOptions(next: Partial<RunOptions>): void {
  active = { ...active, ...next };
}

export function getRunOptions(): RunOptions {
  return active;
}

export function resetRunOptions(): void {
  active = { ...defaults };
}
