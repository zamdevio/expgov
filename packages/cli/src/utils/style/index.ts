import chalk from 'chalk';

const identity = (s: string) => s;

const chalkStyle = {
  reset: (s: string) => chalk.reset(s),
  bold: (s: string) => chalk.bold(s),
  dim: (s: string) => chalk.dim(s),
  accent: (s: string) => chalk.cyan(s),
  ok: (s: string) => chalk.green(s),
  warn: (s: string) => chalk.yellow(s),
  err: (s: string) => chalk.red(s),
  magenta: (s: string) => chalk.magenta(s),
  blue: (s: string) => chalk.blue(s),
  tip: (s: string) => chalk.hex('#FF8C00')(s),
};

const plainStyle = {
  reset: identity,
  bold: identity,
  dim: identity,
  accent: identity,
  ok: identity,
  warn: identity,
  err: identity,
  magenta: identity,
  blue: identity,
  tip: identity,
};

export const style = { ...chalkStyle };

export function configureStyleFromRun(noColor: boolean): void {
  const next = noColor ? plainStyle : chalkStyle;
  Object.assign(style, next);
}
