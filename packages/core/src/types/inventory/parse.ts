import type { TsExportKind } from './snapshot.js';

export interface ParsedFlatExport {
  name: string;
  tsKind: TsExportKind;
  exportKind: 'flat';
  sourceSpecifier: string | null;
}

export interface ParsedNamespaceExport {
  name: string;
  exportKind: 'namespace';
  sourceSpecifier: string | null;
}

export type ParsedExport = ParsedFlatExport | ParsedNamespaceExport;
