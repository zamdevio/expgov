import type { InitDetection } from '../types/init/detection.js';
import { detectionToConfig } from './detect.js';
import { RICH_INIT_CACHE_HINT, RICH_INIT_POLICIES_HINT, RICH_INIT_TIER_HINTS } from '../shared/constants/initHints.js';
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

function formatCommentedStringList(items: readonly string[], indent: string): string {
  if (!items.length) return '[]';
  const itemIndent = `${indent}  `;
  return `[\n${items.map((item) => `${itemIndent}// ${quote(item)},`).join('\n')}\n${indent}]`;
}

function formatTierBucket(
  bucket: { exact?: string[]; prefix?: string[] },
  indent: string,
  richHints?: { exact?: readonly string[]; prefix?: readonly string[] },
): string {
  const exact = bucket.exact?.length
    ? formatStringList(bucket.exact, `${indent}  `)
    : richHints?.exact?.length
      ? formatCommentedStringList(richHints.exact, `${indent}  `)
      : '[]';
  const prefix = bucket.prefix?.length
    ? formatStringList(bucket.prefix, `${indent}  `)
    : richHints?.prefix?.length
      ? formatCommentedStringList(richHints.prefix, `${indent}  `)
      : '[]';
  return `{\n${indent}  exact: ${exact},\n${indent}  prefix: ${prefix},\n${indent}}`;
}

function formatRichPoliciesBlock(indent: string): string {
  const i = indent;
  return [
    `${i}// policies: {`,
    ...RICH_INIT_POLICIES_HINT.map((line) => `${i}// ${line}`),
    `${i}// },`,
    '',
  ].join('\n');
}

function formatRichCacheBlock(indent: string): string {
  const i = indent;
  return [
    `${i}// cache: {`,
    `${i}//   enabled: ${RICH_INIT_CACHE_HINT.enabled},`,
    `${i}//   dir: ${quote(RICH_INIT_CACHE_HINT.dir)},`,
    `${i}// },`,
    '',
  ].join('\n');
}

/** Generate expgov.config.ts source from detection (conservative tiers; optional --rich hints). */
export function buildInitConfigTemplate(
  detection: InitDetection,
  options: { rich?: boolean; importSpecifier?: string } = {},
): string {
  const config = detectionToConfig(detection);
  const imp = options.importSpecifier ?? DEFAULT_INIT_CONFIG_IMPORT;
  const rich = Boolean(options.rich);
  const tiers = config.tiers;

  const notes = detection.notes.map((n) => `// ${n}`).join('\n');
  const tierNote = rich
    ? '// --rich: commented cache + tier examples below (uncomment to opt in).'
    : '// Conservative tiers: classify via @sdkTier or add tiers.*.exact — run `expgov suggest`.';

  return `import { defineConfig, type ExpgovConfig } from '${imp}';

${notes}
${tierNote}

export default defineConfig({
  packageName: ${quote(config.packageName)},
  core: {
    dir: ${quote(config.core.dir)},
    rootBarrel: ${quote(config.core.rootBarrel)},
    subpaths: ${formatSubpaths(config.core.subpaths)},
  },
  tsconfig: ${quote(config.tsconfig ?? 'tsconfig.json')},
${rich ? formatRichCacheBlock('  ') : ''}  git: {
    tagPattern: ${quote(config.git?.tagPattern ?? 'v*')},
    timelineBarrelPath: ${quote(config.git?.timelineBarrelPath ?? config.core.rootBarrel)},${
      config.git?.compatBaseline
        ? `\n    compatBaseline: ${quote(config.git.compatBaseline)},`
        : ''
    }
  },
  tiers: {
${rich ? formatRichPoliciesBlock('    ') : ''}    stable: ${formatTierBucket(tiers?.stable ?? { exact: [], prefix: [] }, '    ', rich ? RICH_INIT_TIER_HINTS.stable : undefined)},
    internal: ${formatTierBucket(tiers?.internal ?? { exact: [], prefix: [] }, '    ', rich ? RICH_INIT_TIER_HINTS.internal : undefined)},
    advanced: ${formatTierBucket(tiers?.advanced ?? { exact: [], prefix: [] }, '    ', rich ? RICH_INIT_TIER_HINTS.advanced : undefined)},
  },
} satisfies ExpgovConfig);
`;
}
