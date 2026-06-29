import { style } from '../../runtime/style.js';
import type { ExportError } from '../../errors/index.js';
import { printHeader, printMeta } from '../report.js';

export function printExportError(err: ExportError): void {
  printHeader('error', style.err(err.message));
  printMeta({
    code: style.err(err.code),
    ...(err.details as Record<string, string | undefined>),
  });
}

export function printUnexpected(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  printHeader('error', style.err('Unexpected failure'));
  printMeta({ message });
  if (process.env.EXPORTS_DEBUG) {
    console.error(err);
  }
}
