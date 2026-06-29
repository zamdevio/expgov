import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { getProjectContext } from '../../context/index.js';
import { fingerprintSource } from '../../inventory/fingerprint.js';
import { parseBarrelExports } from '../../inventory/parse-barrel.js';
import { findNamedReexportSpecifier, readModuleFromBarrel } from '../../inventory/reexport-chain.js';
import { createWorktreeReader, publishedSubpathBarrels, readModule } from '../../inventory/source.js';
import type { InventorySnapshot } from '../../types/inventory/snapshot.js';
import type { WorktreeFileRecord } from '../../types/cache/worktreeFiles.js';
import type { SourceReader } from '../../types/inventory/source.js';
import { MAX_REEXPORT_DEPTH } from '../../shared/constants/inventory.js';
import {
  getRepoRoot,
  getRootIndexRepoPath,
  getTimelineBarrelPath,
} from '../../paths.js';

export function fingerprintFileContent(content: string | Buffer): string {
  return fingerprintSource(typeof content === 'string' ? content : content.toString('utf8'));
}

export function hashRepoFile(repoRelativePath: string): WorktreeFileRecord | null {
  const abs = path.join(getRepoRoot(), repoRelativePath);
  try {
    const content = readFileSync(abs);
    const stat = statSync(abs);
    return {
      hash: fingerprintFileContent(content),
      size: stat.size,
      mtimeMs: stat.mtimeMs,
    };
  } catch {
    return null;
  }
}

/** Root + published subpath barrels (+ timeline barrel when distinct). */
export function discoverBarrelPaths(): string[] {
  const paths = new Set<string>();
  paths.add(getRootIndexRepoPath());
  const timelineBarrel = getTimelineBarrelPath();
  if (timelineBarrel) paths.add(timelineBarrel);
  for (const { repoPath } of publishedSubpathBarrels()) {
    paths.add(repoPath);
  }
  return [...paths].sort();
}

/** Governance inputs that affect inventory without appearing in barrels. */
export function governanceInputPaths(): string[] {
  const ctx = getProjectContext();
  const paths: string[] = [];
  if (ctx.configRepoPath) paths.push(ctx.configRepoPath);
  paths.push(path.relative(ctx.repoRoot, ctx.corePkgPath).replace(/\\/g, '/'));
  return [...new Set(paths)].sort();
}

export function collectSnapshotModulePaths(snapshot: InventorySnapshot): string[] {
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

function collectReexportChainPaths(
  readAtPath: (repoPath: string) => string | null,
  startModulePath: string,
  exportName: string,
): string[] {
  const paths = new Set<string>([startModulePath]);
  let barrelPath = startModulePath;
  let symbolName = exportName;

  for (let depth = 0; depth < MAX_REEXPORT_DEPTH; depth += 1) {
    const content = readAtPath(barrelPath);
    if (!content) break;

    const next = findNamedReexportSpecifier(content, barrelPath, symbolName);
    if (!next) break;

    const mod = readModuleFromBarrel(readAtPath, barrelPath, next.specifier);
    if (!mod) break;

    paths.add(mod.repoPath);
    barrelPath = mod.repoPath;
    symbolName = next.sourceSymbol;
  }

  return [...paths];
}

/**
 * Every module reachable from barrel export specifiers (direct hop + re-export chain).
 * Ensures edits to deep re-exports invalidate worktree cache even when barrels are unchanged.
 */
export function collectBarrelScanClosure(reader: SourceReader): string[] {
  const paths = new Set<string>();
  const readAtPath = (repoPath: string) => reader.read(repoPath);

  for (const barrelPath of discoverBarrelPaths()) {
    const source = readAtPath(barrelPath);
    if (!source) continue;
    paths.add(barrelPath);

    const parsed = parseBarrelExports(source, barrelPath);
    for (const item of parsed) {
      if (!item.sourceSpecifier) continue;
      const mod = readModule(reader, barrelPath, item.sourceSpecifier);
      if (!mod) continue;
      for (const chainPath of collectReexportChainPaths(readAtPath, mod.repoPath, item.name)) {
        paths.add(chainPath);
      }
    }
  }

  return [...paths].sort();
}

export function mergeTrackedPaths(...groups: string[][]): string[] {
  return [...new Set(groups.flat())].sort();
}

export function hashTrackedPaths(repoPaths: string[]): Record<string, WorktreeFileRecord> {
  const records: Record<string, WorktreeFileRecord> = {};
  for (const repoPath of mergeTrackedPaths(repoPaths)) {
    const record = hashRepoFile(repoPath);
    if (record) records[repoPath] = record;
  }
  return records;
}

/** Hash paths on disk; returns null when any path is missing. */
export function scanCurrentFileRecords(repoPaths: string[]): Record<string, WorktreeFileRecord> | null {
  const records: Record<string, WorktreeFileRecord> = {};
  for (const repoPath of mergeTrackedPaths(repoPaths)) {
    const record = hashRepoFile(repoPath);
    if (!record) return null;
    records[repoPath] = record;
  }
  return records;
}

export function computeInputFilesEpoch(files: Record<string, WorktreeFileRecord>): string {
  const lines = Object.keys(files)
    .sort()
    .map((repoPath) => `${repoPath}:${files[repoPath].hash}`);
  return createHash('sha256').update(lines.join('\n')).digest('hex').slice(0, 16);
}

export function fileRecordsMatch(
  stored: Record<string, WorktreeFileRecord>,
  current: Record<string, WorktreeFileRecord>,
): boolean {
  const storedKeys = Object.keys(stored).sort();
  const currentKeys = Object.keys(current).sort();
  if (storedKeys.length !== currentKeys.length) return false;
  for (let i = 0; i < storedKeys.length; i += 1) {
    const key = storedKeys[i];
    if (key !== currentKeys[i]) return false;
    if (stored[key].hash !== current[key].hash) return false;
  }
  return true;
}

export function buildWorktreeFileRecords(
  snapshot: InventorySnapshot,
  reader: SourceReader = createWorktreeReader(),
): {
  files: Record<string, WorktreeFileRecord>;
  inputFilesEpoch: string;
} {
  const paths = mergeTrackedPaths(
    discoverBarrelPaths(),
    governanceInputPaths(),
    collectBarrelScanClosure(reader),
    collectSnapshotModulePaths(snapshot),
  );
  const files = hashTrackedPaths(paths);
  return { files, inputFilesEpoch: computeInputFilesEpoch(files) };
}

export function resolveTrackedPathsForRead(
  filesState: { files: Record<string, WorktreeFileRecord> } | undefined,
): string[] {
  if (filesState) return Object.keys(filesState.files).sort();
  return mergeTrackedPaths(discoverBarrelPaths(), governanceInputPaths());
}
