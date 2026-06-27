import type { InitDetection } from '../types/init/detection.js';
import { detectionToConfig } from './detect.js';
import { DEFAULT_CACHE_DIR } from '../shared/constants/cache.js';
import {
  DEFAULT_INIT_CONFIG_IMPORT,
  INIT_CONFIG_FILE_NAME,
} from '../shared/constants/init.js';

export { DEFAULT_INIT_CONFIG_IMPORT, INIT_CONFIG_FILE_NAME };

function quote(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function formatSubpaths(subpaths: Record<string, string>): string {
  const lines = Object.entries(subpaths).map(([key, value]) => `      ${quote(key)}: ${quote(value)},`);
  return `{\n${lines.join('\n')}\n    }`;
}

function formatStringList(items: string[], indent: string): string {
  if (!items.length) return '[]';
  return `[\n${items.map((item) => `${indent}  ${quote(item)},`).join('\n')}\n${indent}]`;
}

function formatTierBucket(
  bucket: { exact?: string[]; prefix?: string[] } | undefined,
  indent: string,
  richExamples?: { exact?: string[] },
): string {
  const exact = bucket?.exact?.length
    ? formatStringList(bucket.exact, `${indent}  `)
    : richExamples?.exact?.length
      ? `[\n${richExamples.exact.map((item) => `${indent}    // ${quote(item)},`).join('\n')}\n${indent}  ]`
      : '[]';
  const prefix = bucket?.prefix?.length ? formatStringList(bucket.prefix, `${indent}  `) : '[]';
  return `{\n${indent}  exact: ${exact},\n${indent}  prefix: ${prefix},\n${indent}}`;
}

/** Generate expgov.config.ts source from detection (safe defaults, optional rich comments). */
export function buildInitConfigTemplate(
  detection: InitDetection,
  options: { rich?: boolean; importSpecifier?: string } = {},
): string {
  const config = detectionToConfig(detection);
  const imp = options.importSpecifier ?? DEFAULT_INIT_CONFIG_IMPORT;
  const rich = Boolean(options.rich);
  const tiers = config.tiers;

  const notes = detection.notes.map((n) => `// ${n}`).join('\n');

  return `import { defineConfig, type ExpgovConfig } from '${imp}';

${notes}

export default defineConfig({
  packageName: ${quote(config.packageName)},
  core: {
    dir: ${quote(config.core.dir)},
    rootBarrel: ${quote(config.core.rootBarrel)},
    subpaths: ${formatSubpaths(config.core.subpaths)},
  },
  tsconfig: ${quote(config.tsconfig ?? 'tsconfig.json')},
  cacheDir: ${quote(config.cacheDir ?? DEFAULT_CACHE_DIR)},
  git: {
    tagPattern: ${quote(config.git?.tagPattern ?? 'v*')},
    timelineBarrelPath: ${quote(config.git?.timelineBarrelPath ?? config.core.rootBarrel)},
  },
  tiers: {
    stable: ${formatTierBucket(tiers?.stable, '    ', rich ? { exact: ['PingResult', 'stringifyEnvelope'] } : undefined)},
    internal: ${formatTierBucket(tiers?.internal, '    ')},
    advanced: ${formatTierBucket(tiers?.advanced, '    ')},
  },
} satisfies ExpgovConfig);
`;
}
