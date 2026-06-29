import chalk from 'chalk';

import type { ExportError } from '../../errors/index.js';
import { printHeader, printMeta } from '../report.js';

export function printExportError(err: ExportError): void {
  printHeader('error', chalk.red(err.message));
  printMeta({
    code: chalk.red(err.code),
    ...(err.details as Record<string, string | undefined>),
  });
}

export function printUnexpected(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  printHeader('error', chalk.red('Unexpected failure'));
  printMeta({ message });
  if (process.env.EXPORTS_DEBUG) {
    console.error(err);
  }
}
