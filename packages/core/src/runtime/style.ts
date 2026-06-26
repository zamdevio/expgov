import chalk from 'chalk';

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

export type StyleTokens = typeof chalkStyle;

export const style: StyleTokens = { ...chalkStyle };

export function configureStyle(noColor: boolean): void {
  const next = noColor ? plainStyle : chalkStyle;
  Object.assign(style, next);
}

export const CLI_NAME = 'expgov';
export const CLI_MARK = '⚡';
export const BRAND = () => style.bold(style.accent(CLI_NAME));
