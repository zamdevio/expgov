import { CLI_MARK, CLI_NAME } from '../../constants/cli.js';
import type { HeaderOptions, LogLevel } from '../../types/ansi/index.js';
import { style } from '../style/index.js';

const levelColor: Record<LogLevel, (s: string) => string> = {
  info: style.ok,
  notice: style.warn,
  warn: style.warn,
  error: style.err,
};

export function bracketTag(label: string, color: (s: string) => string): string {
  return `${style.dim('[')}${color(label)}${style.dim(']')}`;
}

function appPrefix(): string {
  return `${style.dim('[')}${style.bold(style.accent(CLI_NAME))}${style.dim(']')}`;
}

export function stripAnsiVisible(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}

export function line(level: LogLevel, message: string): string {
  return `${appPrefix()} ${bracketTag(level, levelColor[level])} ${message}`;
}

export function tipLine(message: string): string {
  return `${appPrefix()} ${bracketTag('tip', style.tip)} ${message}`;
}

export function header(title: string, options?: HeaderOptions): string {
  const mark = options?.mark !== undefined ? options.mark : CLI_MARK;
  const markPart = mark !== '' ? `${style.dim(mark)} ` : '';
  const innerStyled = options?.subtitle
    ? ` ${markPart}${style.bold(title)} ${style.dim('—')} ${style.dim(options.subtitle)} `
    : ` ${markPart}${style.bold(title)} `;
  const innerLen = stripAnsiVisible(innerStyled).length;

  const cols =
    typeof process.stdout?.columns === 'number' && process.stdout.columns > 40
      ? process.stdout.columns
      : 100;
  const minW = options?.minWidth ?? 48;
  const cap = Math.max(minW, cols - 2);
  const natural = innerLen + 2;
  const w = Math.max(minW, Math.min(natural, cap));
  const pad = Math.max(0, w - innerLen - 1);

  const bar = '─'.repeat(w);
  return `${style.dim('╭')}${style.dim(bar)}${style.dim('╮')}\n${style.dim('│')}${innerStyled}${' '.repeat(pad)}${style.dim('│')}\n${style.dim('╰')}${style.dim(bar)}${style.dim('╯')}`;
}
