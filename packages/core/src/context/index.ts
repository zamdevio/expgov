import path from 'node:path';
import { existsSync } from 'node:fs';
import { resolveTierCatalog } from '../config/tierCatalog.js';
import { resolveCacheSettings } from '../config/resolveCache.js';
import type { ExpgovConfig, ExpgovConfigOverrides, ProjectContext } from '../types/config/index.js';
import { resolveExpgovConfig } from '../config/load.js';
import { INIT_CONFIG_FILE_NAME } from '../shared/constants/init.js';

function posixJoin(...parts: string[]): string {
  return path.posix.join(...parts.map((p) => p.replace(/\\/g, '/')));
}

export function buildProjectContext(
  config: ExpgovConfig,
  cwd: string,
  configPath: string | null = null,
): ProjectContext {
  const repoRoot = path.resolve(cwd, config.repoRoot ?? '.');
  const coreDir = path.resolve(repoRoot, config.core.dir);
  const corePkgPath = path.resolve(repoRoot, config.core.packageJson ?? path.join(config.core.dir, 'package.json'));
  const rootIndexRepoPath = config.core.rootBarrel.replace(/\\/g, '/');
  const rootIndexAbsPath = path.resolve(repoRoot, rootIndexRepoPath);
  const cacheSettings = resolveCacheSettings(config);
  const exportsCacheRoot = path.resolve(repoRoot, cacheSettings.dir);
  const tsconfigPath = path.resolve(repoRoot, config.tsconfig ?? 'tsconfig.json');
  const defaultConfigPath = path.join(repoRoot, INIT_CONFIG_FILE_NAME);
  const resolvedConfigPath = configPath ? path.resolve(cwd, configPath) : null;
  const configRepoPath = resolvedConfigPath
    ? path.relative(repoRoot, resolvedConfigPath).replace(/\\/g, '/')
    : existsSync(defaultConfigPath)
      ? INIT_CONFIG_FILE_NAME
      : null;

  const coreDirPosix = config.core.dir.replace(/\\/g, '/');
  const coreSrcPrefix = posixJoin(coreDirPosix, 'src') + '/';
  const tierCatalog = resolveTierCatalog(config.tiers);

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
    configRepoPath,
    cacheEnabled: cacheSettings.enabled,
    tsconfigPath,
    subpathSourceEntries: { ...config.core.subpaths },
    git: {
      tagPattern: config.git?.tagPattern ?? 'v*',
      timelineBarrelPath: (config.git?.timelineBarrelPath ?? rootIndexRepoPath).replace(/\\/g, '/'),
    },
    tierCatalog,
    tierConfig: config.tiers ?? {},
    tierTag: tierCatalog.tag,
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
  const { config, cwd, configPath } = resolveExpgovConfig(overrides);
  const ctx = buildProjectContext(config, cwd, configPath);
  setProjectContext(ctx);
  return ctx;
}

export function initProjectContextFromConfig(
  config: ExpgovConfig,
  cwd: string,
  configPath: string | null = null,
): ProjectContext {
  const ctx = buildProjectContext(config, cwd, configPath);
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
