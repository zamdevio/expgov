export interface TierRulesConfig {
  stableExact?: string[];
  stablePrefixes?: string[];
  internalPatterns?: string[];
  advancedPatterns?: string[];
}

export interface ExpgovCoreConfig {
  dir: string;
  packageJson?: string;
  rootBarrel: string;
  subpaths: Record<string, string>;
}

export interface ExpgovGitConfig {
  tagPattern?: string;
  timelineBarrelPath?: string;
}

/** Stable project identity — paths, package name, tier rules. */
export interface ExpgovConfig {
  packageName: string;
  repoRoot?: string;
  core: ExpgovCoreConfig;
  tsconfig?: string;
  cacheDir?: string;
  git?: ExpgovGitConfig;
  tiers?: TierRulesConfig;
}

export interface ExpgovConfigOverrides {
  cwd?: string;
  configPath?: string;
  packageName?: string;
  repoRoot?: string;
  cacheDir?: string;
  tsconfig?: string;
  verbose?: boolean;
}

export interface ResolvedTierRules {
  stableExact: ReadonlySet<string>;
  stablePrefixes: readonly string[];
  internalPatterns: readonly RegExp[];
  advancedPatterns: readonly RegExp[];
}

export interface ProjectContext {
  packageName: string;
  repoRoot: string;
  coreDir: string;
  corePkgPath: string;
  coreSrcPrefix: string;
  rootIndexRepoPath: string;
  rootIndexAbsPath: string;
  exportsCacheRoot: string;
  exportsMetaPath: string;
  tsconfigPath: string;
  subpathSourceEntries: Record<string, string>;
  git: {
    tagPattern: string;
    timelineBarrelPath: string;
  };
  tiers: ResolvedTierRules;
}
