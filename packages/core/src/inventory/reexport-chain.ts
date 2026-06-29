import ts from 'typescript';

import { resolveModuleCandidates } from './source.js';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Named `export { x } from './mod'` target specifier for a barrel export name. */
export function findNamedReexportSpecifier(
  source: string,
  fileName: string,
  exportName: string,
): { specifier: string; sourceSymbol: string } | null {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  for (const stmt of sf.statements) {
    if (!ts.isExportDeclaration(stmt) || !stmt.exportClause || !stmt.moduleSpecifier) continue;
    if (!ts.isNamedExports(stmt.exportClause)) continue;
    if (!ts.isStringLiteral(stmt.moduleSpecifier)) continue;

    for (const el of stmt.exportClause.elements) {
      const exportedAs = el.name.text;
      if (exportedAs !== exportName) continue;
      return {
        specifier: stmt.moduleSpecifier.text,
        sourceSymbol: el.propertyName?.text ?? el.name.text,
      };
    }
  }

  return null;
}

export function readModuleFromBarrel(
  readAtPath: (repoPath: string) => string | null,
  barrelRepoPath: string,
  specifier: string,
): { content: string; repoPath: string } | null {
  for (const candidate of resolveModuleCandidates(barrelRepoPath, specifier)) {
    const content = readAtPath(candidate);
    if (content !== null) return { content, repoPath: candidate };
  }
  return null;
}

export function declarationPatternFor(symbolName: string): RegExp {
  return new RegExp(
    String.raw`export\s+(?:declare\s+)?(?:async\s+)?(?:const|let|var|function|class|interface|type|enum)\s+${escapeRegExp(symbolName)}\b`,
    'g',
  );
}
