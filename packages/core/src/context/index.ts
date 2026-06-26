import path from 'node:path';

import type { ExpgovConfig, ProjectContext, ResolvedTierRules } from '../config/types.js';
import type { ExpgovConfigOverrides } from '../config/types.js';
import { resolveExpgovConfig } from '../config/load.js';

const DEFAULT_STABLE_PREFIXES = [
  'run',
  'build',
  'emit',
  'get',
  'set',
  'reset',
  'is',
  'format',
  'resolve',
  'walk',
  'directory',
  'normalize',
  'rethrow',
  'noop',
] as const;

const DEFAULT_INTERNAL_PATTERNS = [/^internal[A-Z_]/, /Internal$/];
const DEFAULT_ADVANCED_PATTERNS = [/^experimental[A-Z_]/, /^beta[A-Z_]/, /^advanced[A-Z_]/, /Unsafe$/];

function compilePatterns(patterns: string[] | undefined, defaults: readonly RegExp[]): readonly RegExp[] {
  if (!patterns?.length) return defaults;
  return patterns.map((source) => new RegExp(source));
}

function resolveTierRules(config?: ExpgovConfig['tiers']): ResolvedTierRules {
  return {
    stableExact: new Set(config?.stableExact ?? []),
    stablePrefixes: config?.stablePrefixes ?? [...DEFAULT_STABLE_PREFIXES],
    internalPatterns: compilePatterns(config?.internalPatterns, DEFAULT_INTERNAL_PATTERNS),
    advancedPatterns: compilePatterns(config?.advancedPatterns, DEFAULT_ADVANCED_PATTERNS),
  };
}

function posixJoin(...parts: string[]): string {
  return path.posix.join(...parts.map((p) => p.replace(/\\/g, '/')));
}

export function buildProjectContext(config: ExpgovConfig, cwd: string): ProjectContext {
  const repoRoot = path.resolve(cwd, config.repoRoot ?? '.');
  const coreDir = path.resolve(repoRoot, config.core.dir);
  const corePkgPath = path.resolve(repoRoot, config.core.packageJson ?? path.join(config.core.dir, 'package.json'));
  const rootIndexRepoPath = config.core.rootBarrel.replace(/\\/g, '/');
  const rootIndexAbsPath = path.resolve(repoRoot, rootIndexRepoPath);
  const exportsCacheRoot = path.resolve(repoRoot, config.cacheDir ?? '.exports/cache');
  const tsconfigPath = path.resolve(repoRoot, config.tsconfig ?? 'tsconfig.json');

  const coreDirPosix = config.core.dir.replace(/\\/g, '/');
  const coreSrcPrefix = posixJoin(coreDirPosix, 'src') + '/';

  return {
    packageName: config.packageName,
    repoRoot,
    coreDir,
    corePkgPath,
    coreSrcPrefix,
    rootIndexRepoPath,
    rootIndexAbsPath,
    exportsCacheRoot,
    exportsMetaPath: path.join(exportsCacheRoot, 'meta.json'),
    tsconfigPath,
    subpathSourceEntries: { ...config.core.subpaths },
    git: {
      tagPattern: config.git?.tagPattern ?? 'v*',
      timelineBarrelPath: (config.git?.timelineBarrelPath ?? rootIndexRepoPath).replace(/\\/g, '/'),
    },
    tiers: resolveTierRules(config.tiers),
  };
}

let activeContext: ProjectContext | null = null;

export function setProjectContext(ctx: ProjectContext): void {
  activeContext = ctx;
}

export function getProjectContext(): ProjectContext {
  if (!activeContext) {
    throw new Error('ProjectContext not initialized — call initProjectContext() before running commands');
  }
  return activeContext;
}

export function tryGetProjectContext(): ProjectContext | null {
  return activeContext;
}

export function clearProjectContext(): void {
  activeContext = null;
}

export function initProjectContext(overrides: ExpgovConfigOverrides = {}): ProjectContext {
  const { config, cwd } = resolveExpgovConfig(overrides);
  const ctx = buildProjectContext(config, cwd);
  setProjectContext(ctx);
  return ctx;
}

export function npmSubpathKey(npmSubpathKey: string): string {
  const { packageName } = getProjectContext();
  return npmSubpathKey === '.' ? packageName : `${packageName}/${npmSubpathKey}`;
}

export function packageNamePathPrefix(): string {
  return getProjectContext().packageName;
}

export function isPackageTsconfigPath(key: string): boolean {
  const pkg = getProjectContext().packageName;
  return key === pkg || key.startsWith(`${pkg}/`);
}

export function wildcardPackageTsconfigPath(): string {
  return `${getProjectContext().packageName}/*`;
}
