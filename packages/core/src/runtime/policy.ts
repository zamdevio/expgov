import type { RunOptions } from '../types/runtime/run.js';

export function canPrintCommandBanner(run: RunOptions): boolean {
  return !run.json && !run.silent;
}

export function canPrintInfo(run: RunOptions): boolean {
  return !run.json && !run.quiet && !run.silent;
}

export function canPrintWarn(run: RunOptions): boolean {
  return !run.json && !run.silent;
}

export function canPrintPrimary(run: RunOptions): boolean {
  return !run.json && !run.silent;
}

export function canPrintDetail(run: RunOptions): boolean {
  return !run.json && !run.quiet && !run.silent;
}

export function canPrintTip(run: RunOptions): boolean {
  return canPrintDetail(run);
}

export function canPrintVerbose(run: RunOptions): boolean {
  return !run.json && !run.silent;
}
