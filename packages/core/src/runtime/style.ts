import chalk from 'chalk';

import { CLI_NAME } from '../shared/constants/cli.js';

const identity = (s: string) => s;

const chalkStyle = {
  reset: (s: string) => chalk.reset(s),
  bold: (s: string) => chalk.bold(s),
  dim: (s: string) => chalk.dim(s),
  accent: (s: string) => chalk.cyan(s),
  ok: (s: string) => chalk.green(s),
  warn: (s: string) => chalk.yellow(s),
  highlight: (s: string) => chalk.yellowBright(s),
  err: (s: string) => chalk.red(s),
  magenta: (s: string) => chalk.magenta(s),
  blue: (s: string) => chalk.blue(s),
  tip: (s: string) => chalk.hex('#FF8C00')(s),
  white: (s: string) => chalk.white(s),
};

const plainStyle = {
  reset: identity,
  bold: identity,
  dim: identity,
  accent: identity,
  ok: identity,
  warn: identity,
  highlight: identity,
  err: identity,
  magenta: identity,
  blue: identity,
  tip: identity,
  white: identity,
};

type StyleTokens = typeof chalkStyle;

export const style: StyleTokens = { ...chalkStyle };

export function configureStyle(noColor: boolean): void {
  const next = noColor ? plainStyle : chalkStyle;
  Object.assign(style, next);
}

export const BRAND = () => style.bold(style.accent(CLI_NAME));

export function boldDim(text: string): string {
  return style.bold(style.dim(text));
}

export function tierStyle(tier: string): (text: string) => string {
  switch (tier) {
    case 'stable':
      return style.ok;
    case 'advanced':
      return style.warn;
    case 'internal':
      return style.magenta;
    case 'unclassified':
      return style.err;
    default:
      return style.accent;
  }
}

export function cacheStatusStyle(status: string): string {
  switch (status) {
    case 'hit':
      return style.ok('hit');
    case 'miss':
      return style.warn('miss');
    case 'refresh':
      return style.accent('refresh');
    case 'bypass':
      return style.dim('bypass');
    case 'disabled':
      return style.dim('disabled');
    default:
      return style.dim('n/a');
  }
}
