import ts from 'typescript';

import { getRootIndexRepoPath, getTimelineBarrelPath } from '../context/paths.js';
import {
  ISSUE_INVENTORY_DIRECT_BARREL_EXPORT,
  ISSUE_INVENTORY_UNREACHABLE_MODULE_EXPORTS,
} from '../shared/constants/issues.js';
import type { Issue } from '../types/json/envelope.js';
import type { InventorySnapshot } from '../types/inventory/snapshot.js';
import type { SourceReader } from '../types/inventory/source.js';
import { publishedSubpathBarrels } from './source.js';

function trackedBarrelPaths(): string[] {
  const paths = new Set<string>();
  paths.add(getRootIndexRepoPath());
  const timelineBarrel = getTimelineBarrelPath();
  if (timelineBarrel) paths.add(timelineBarrel);
  for (const { repoPath } of publishedSubpathBarrels()) {
    paths.add(repoPath);
  }
  return [...paths].sort();
}

function snapshotModulePaths(snapshot: InventorySnapshot): string[] {
  const paths = new Set<string>();
  for (const sym of snapshot.symbols) {
    if (sym.sourceModule) paths.add(sym.sourceModule);
  }
  for (const ns of snapshot.namespaces) {
    if (ns.sourceModule) paths.add(ns.sourceModule);
  }
  for (const edge of snapshot.edges) {
    paths.add(edge.toModule);
  }
  return [...paths].sort();
}

/** Direct `export const|function|class|…` names (not `export { … } from`). */
export function listDirectExportDeclarationNames(source: string, fileName: string): string[] {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const names: string[] = [];

  const pushUnique = (name: string | undefined) => {
    if (!name || names.includes(name)) return;
    names.push(name);
  };

  for (const stmt of sf.statements) {
    const mods = ts.canHaveModifiers(stmt) ? ts.getModifiers(stmt) : undefined;
    const isExport = Boolean(mods?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword));
    if (!isExport) continue;

    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) pushUnique(decl.name.text);
      }
      continue;
    }
    if (ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt) || ts.isEnumDeclaration(stmt)) {
      pushUnique(stmt.name?.text);
      continue;
    }
    if (ts.isInterfaceDeclaration(stmt) || ts.isTypeAliasDeclaration(stmt) || ts.isModuleDeclaration(stmt)) {
      pushUnique(stmt.name.getText(sf));
      continue;
    }
  }

  return names;
}

/** All named exports from a module (direct decls + `export { … }` / `export * as`). */
export function listModuleExportNames(source: string, fileName: string): string[] {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const names = new Set<string>(listDirectExportDeclarationNames(source, fileName));

  for (const stmt of sf.statements) {
    if (!ts.isExportDeclaration(stmt) || !stmt.exportClause) continue;
    if (ts.isNamespaceExport(stmt.exportClause)) {
      names.add(stmt.exportClause.name.text);
      continue;
    }
    if (!ts.isNamedExports(stmt.exportClause)) continue;
    for (const el of stmt.exportClause.elements) {
      names.add(el.name.text);
    }
  }

  return [...names].sort();
}

function reachableNamesByModule(snapshot: InventorySnapshot): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  const touch = (modulePath: string, name: string) => {
    let set = map.get(modulePath);
    if (!set) {
      set = new Set();
      map.set(modulePath, set);
    }
    set.add(name);
  };

  for (const sym of snapshot.symbols) {
    if (sym.sourceModule) touch(sym.sourceModule, sym.name);
  }
  for (const ns of snapshot.namespaces) {
    if (ns.sourceModule) touch(ns.sourceModule, ns.name);
  }
  for (const edge of snapshot.edges) {
    touch(edge.toModule, edge.symbol);
  }
  return map;
}

/** ID1 — direct export decls inside tracked barrels (not inventoriable today). */
export function diagnoseDirectBarrelExports(reader: SourceReader): Issue[] {
  const issues: Issue[] = [];
  for (const barrelPath of trackedBarrelPaths()) {
    const source = reader.read(barrelPath);
    if (!source) continue;
    const names = listDirectExportDeclarationNames(source, barrelPath);
    if (!names.length) continue;
    issues.push({
      severity: 'warning',
      code: ISSUE_INVENTORY_DIRECT_BARREL_EXPORT,
      path: barrelPath,
      message: 'direct barrel export(s) not inventoriable — move to a module and re-export',
      samples: names,
    });
  }
  return issues;
}

/**
 * ID2 — tracked modules (snapshot graph) with local export names that never
 * appear on the reachable inventoriable surface from that module.
 */
export function diagnoseUnreachableModuleExports(
  snapshot: InventorySnapshot,
  reader: SourceReader,
): Issue[] {
  if (snapshot.scanDepth !== 'full') return [];

  const reachable = reachableNamesByModule(snapshot);
  const issues: Issue[] = [];

  for (const modulePath of snapshotModulePaths(snapshot)) {
    const source = reader.read(modulePath);
    if (!source) continue;
    const localNames = listModuleExportNames(source, modulePath);
    if (!localNames.length) continue;
    const hit = reachable.get(modulePath) ?? new Set();
    const orphans = localNames.filter((name) => !hit.has(name));
    if (!orphans.length) continue;
    issues.push({
      severity: 'warning',
      code: ISSUE_INVENTORY_UNREACHABLE_MODULE_EXPORTS,
      path: modulePath,
      message: 'export(s) in tracked module not reachable from SDK barrels',
      samples: orphans,
    });
  }

  return issues;
}

/** Inventory diagnostics (warn-first; does not fail the command). */
export function computeInventoryDiagnostics(
  snapshot: InventorySnapshot,
  reader: SourceReader,
): Issue[] {
  return [...diagnoseDirectBarrelExports(reader), ...diagnoseUnreachableModuleExports(snapshot, reader)];
}
