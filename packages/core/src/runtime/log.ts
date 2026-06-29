import { getRunOptions } from './runOptions.js';
import { canPrintInfo, canPrintTip, canPrintWarn, canPrintPrimary } from './policy.js';
import { emitLog } from './emitter.js';
import type { LogLevel } from '../types/runtime/index.js';
import { CLI_NAME, style } from './style.js';

function canEmitHuman(): boolean {
  return canPrintPrimary(getRunOptions());
}

function canEmitInfo(): boolean {
  return canPrintInfo(getRunOptions());
}

function appPrefix(): string {
  const run = getRunOptions();
  if (run.noLogPrefix) return '';
  return `${style.dim('[')}${style.bold(style.accent(CLI_NAME))}${style.dim(']')}`;
}

const levelColor: Record<LogLevel, (s: string) => string> = {
  info: style.ok,
  notice: style.warn,
  warn: style.warn,
  error: style.err,
  tip: style.tip,
  verbose: style.accent,
};

function bracketTag(label: string, color: (s: string) => string): string {
  return `${style.dim('[')}${color(label)}${style.dim(']')}`;
}

function formatLogLine(level: LogLevel, message: string): string {
  const run = getRunOptions();
  const parts: string[] = [];
  const prefix = appPrefix();
  if (prefix) parts.push(prefix);
  if (!run.noLogChannel) parts.push(bracketTag(level, levelColor[level]));
  parts.push(message);
  return parts.filter(Boolean).join(' ');
}

export function coreLog(level: LogLevel, message: string): void {
  if (level === 'error') {
    if (!canPrintWarn(getRunOptions())) return;
  } else if (level === 'warn') {
    if (!canPrintWarn(getRunOptions())) return;
  } else if (level === 'info' || level === 'notice' || level === 'verbose') {
    if (!canEmitInfo()) return;
  } else if (!canEmitHuman()) return;
  emitLog({ type: 'log', level, message: formatLogLine(level, message) });
}

export function coreLogTip(message: string): void {
  if (!canPrintTip(getRunOptions())) return;
  emitLog({ type: 'log', level: 'tip', message: formatLogLine('tip', message) });
}

export function coreLogRaw(message: string, stream: 'stdout' | 'stderr' = 'stdout'): void {
  emitLog({ type: 'raw', message, stream });
}

export function coreLogBlank(): void {
  if (!canEmitHuman()) return;
  emitLog({ type: 'blank' });
}

export function stripAnsiVisible(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}

export function formatBoxHeader(title: string, subtitle?: string): string {
  const markPart = `${style.dim('⚡')} `;
  const innerStyled = subtitle
    ? ` ${markPart}${style.bold(title)} ${style.dim('—')} ${style.dim(subtitle)} `
    : ` ${markPart}${style.bold(title)} `;
  const innerLen = stripAnsiVisible(innerStyled).length;
  const cols =
    typeof process.stdout?.columns === 'number' && process.stdout.columns > 40
      ? process.stdout.columns
      : 100;
  const minW = 48;
  const cap = Math.max(minW, cols - 2);
  const w = Math.max(minW, Math.min(innerLen + 2, cap));
  const pad = Math.max(0, w - innerLen - 1);
  const bar = '─'.repeat(w);
  return `${style.dim('╭')}${style.dim(bar)}${style.dim('╮')}\n${style.dim('│')}${innerStyled}${' '.repeat(pad)}${style.dim('│')}\n${style.dim('╰')}${style.dim(bar)}${style.dim('╯')}`;
}
