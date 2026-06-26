export type RunOptions = {
  json: boolean;
  jsonPretty: boolean;
  quiet: boolean;
  silent: boolean;
  noColor: boolean;
  noLogChannel: boolean;
  noLogPrefix: boolean;
  verbose: boolean;
};

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
