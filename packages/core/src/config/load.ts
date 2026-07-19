import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';
import type { ExpgovConfig, ExpgovConfigOverrides } from '../types/config/index.js';
import { INIT_CONFIG_FILE_NAME } from '../shared/constants/init.js';

const jiti = createJiti(import.meta.url, { interopDefault: true });

function findGitRoot(startDir: string): string | null {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: startDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0 || !result.stdout?.trim()) return null;
  return result.stdout.trim();
}

function resolveRepoRoot(cwd: string, configRepoRoot?: string): string {
  if (configRepoRoot) {
    return path.resolve(cwd, configRepoRoot);
  }
  return findGitRoot(cwd) ?? cwd;
}

function discoverConfigFile(repoRoot: string): string | null {
  const candidate = path.join(repoRoot, INIT_CONFIG_FILE_NAME);
  return existsSync(candidate) ? candidate : null;
}

function assertTypeScriptConfigPath(filePath: string): void {
  if (!filePath.endsWith('.ts')) {
    throw new Error(
      `Config must be TypeScript (expgov.config.ts). JSON and other formats are not supported: ${filePath}`,
    );
  }
}

function loadConfigFile(filePath: string): ExpgovConfig {
  assertTypeScriptConfigPath(filePath);
  const mod = jiti(filePath) as { default?: ExpgovConfig } & Partial<ExpgovConfig>;
  const config = mod.default ?? (mod as ExpgovConfig);
  if (!config?.packageName || !config.core) {
    throw new Error(`Invalid expgov config in ${filePath} — export default defineConfig({ packageName, core, ... })`);
  }
  return config;
}

function mergeCacheOverride(config: ExpgovConfig, cacheDir?: string): ExpgovConfig['cache'] {
  if (cacheDir === undefined) return config.cache;
  const base = typeof config.cache === 'object' ? config.cache : {};
  return { ...base, dir: cacheDir };
}

function mergeOverrides(config: ExpgovConfig, overrides: ExpgovConfigOverrides): ExpgovConfig {
  return {
    ...config,
    packageName: overrides.packageName ?? config.packageName,
    repoRoot: overrides.repoRoot ?? config.repoRoot,
    cache: mergeCacheOverride(config, overrides.cacheDir),
    tsconfig: overrides.tsconfig ?? config.tsconfig,
    core: { ...config.core },
    git: config.git ? { ...config.git } : undefined,
    tiers: config.tiers ? { ...config.tiers } : undefined,
  };
}

/** Resolve config file path and parsed config from discovery order. */
export function resolveExpgovConfig(overrides: ExpgovConfigOverrides = {}): {
  config: ExpgovConfig;
  configPath: string | null;
  cwd: string;
} {
  const cwd = path.resolve(overrides.cwd ?? process.cwd());

  if (overrides.configPath) {
    const configPath = path.resolve(cwd, overrides.configPath);
    if (!existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }
    const config = loadConfigFile(configPath);
    return { config: mergeOverrides(config, overrides), configPath, cwd };
  }

  const inCwd = path.join(cwd, INIT_CONFIG_FILE_NAME);
  if (existsSync(inCwd)) {
    const config = loadConfigFile(inCwd);
    return { config: mergeOverrides(config, overrides), configPath: inCwd, cwd };
  }

  const repoRoot = resolveRepoRoot(cwd, overrides.repoRoot);
  const discovered = discoverConfigFile(repoRoot);
  if (discovered) {
    const config = loadConfigFile(discovered);
    return { config: mergeOverrides(config, overrides), configPath: discovered, cwd };
  }

  throw new Error(
    `No expgov config found. Add ${INIT_CONFIG_FILE_NAME} to the project root or pass --config path/to/${INIT_CONFIG_FILE_NAME}.`,
  );
}

export function formatConfigDiscoveryHint(cwd: string): string {
  const repoRoot = findGitRoot(cwd) ?? cwd;
  const found = discoverConfigFile(repoRoot);
  if (found) return `Found ${path.relative(cwd, found)}`;
  return `Looked in ${repoRoot} for ${INIT_CONFIG_FILE_NAME}`;
}
