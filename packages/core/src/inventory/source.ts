import { readFileSync } from 'node:fs';
import path from 'node:path';

import { npmSubpathKey } from '../context/index.js';
import { gitShowFile } from '../git/index.js';
import { coreRepoPath, getRepoRoot, getSubpathSourceEntries } from '../paths.js';

export interface SourceReader {
  read(repoRelativePath: string): string | null;
}

export function createWorktreeReader(): SourceReader {
  return {
    read(repoRelativePath: string): string | null {
      try {
        return readFileSync(path.join(getRepoRoot(), repoRelativePath), 'utf8');
      } catch {
        return null;
      }
    },
  };
}

export function createGitReader(sha: string): SourceReader {
  return {
    read(repoRelativePath: string): string | null {
      return gitShowFile(sha, repoRelativePath);
    },
  };
}

export function resolveModuleSpecifier(barrelRepoPath: string, specifier: string): string {
  const barrelDir = path.posix.dirname(barrelRepoPath);
  const withoutExt = specifier.replace(/\.js$/i, '');
  let resolved = path.posix.normalize(path.posix.join(barrelDir, withoutExt));
  if (!resolved.endsWith('.ts')) resolved = `${resolved}.ts`;
  return resolved;
}

export function resolveModuleCandidates(barrelRepoPath: string, specifier: string): string[] {
  const base = resolveModuleSpecifier(barrelRepoPath, specifier);
  const dir = path.posix.dirname(base);
  const name = path.posix.basename(base).replace(/\.ts$/, '');
  return [base, path.posix.join(dir, `${name}/index.ts`), path.posix.join(dir, name, 'index.ts')];
}

export function readModule(
  reader: SourceReader,
  barrelRepoPath: string,
  specifier: string | undefined,
): { content: string; repoPath: string } | null {
  if (!specifier) return null;
  for (const candidate of resolveModuleCandidates(barrelRepoPath, specifier)) {
    const content = reader.read(candidate);
    if (content !== null) return { content, repoPath: candidate };
  }
  return null;
}

export function readModuleAtPath(reader: SourceReader, repoPath: string): string | null {
  for (const candidate of [repoPath, repoPath.replace(/\.ts$/, '/index.ts')]) {
    const content = reader.read(candidate);
    if (content !== null) return content;
  }
  return null;
}

/** All published subpath barrel repo paths. */
export function publishedSubpathBarrels(): { npmSubpath: string; repoPath: string }[] {
  return Object.entries(getSubpathSourceEntries()).map(([subpathKey, rel]) => ({
    npmSubpath: npmSubpathKey(subpathKey),
    repoPath: coreRepoPath(rel),
  }));
}
