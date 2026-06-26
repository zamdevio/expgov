import { getProjectContext } from '../context/index.js';

export type StabilityTier = 'stable' | 'advanced' | 'internal' | 'unclassified';
export type DeclaredTierTag = Exclude<StabilityTier, 'unclassified'>;

const SDK_TIER_TAG_PATTERN = /@sdkTier\s+(stable|advanced|internal)\b/;

function hasPatternMatch(name: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(name));
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Reads `@sdkTier` from the declaration JSDoc of a symbol in a source module.
 */
export function resolveDeclaredTierTag(input: {
  name: string;
  moduleContent: string | null;
}): DeclaredTierTag | undefined {
  const { name, moduleContent } = input;
  if (!moduleContent) return undefined;

  const escapedName = escapeRegExp(name);
  const declarationPattern = new RegExp(
    String.raw`export\s+(?:declare\s+)?(?:async\s+)?(?:const|let|var|function|class|interface|type|enum)\s+${escapedName}\b`,
    'g',
  );

  let match: RegExpExecArray | null = declarationPattern.exec(moduleContent);
  while (match) {
    const beforeDeclaration = moduleContent.slice(0, match.index).replace(/\s+$/g, '');
    if (!beforeDeclaration.endsWith('*/')) {
      match = declarationPattern.exec(moduleContent);
      continue;
    }

    const commentStart = beforeDeclaration.lastIndexOf('/**');
    if (commentStart === -1) {
      match = declarationPattern.exec(moduleContent);
      continue;
    }

    const jsDocBlock = beforeDeclaration.slice(commentStart);
    const tag = SDK_TIER_TAG_PATTERN.exec(jsDocBlock)?.[1] as DeclaredTierTag | undefined;
    if (tag) return tag;

    match = declarationPattern.exec(moduleContent);
  }

  return undefined;
}

/**
 * Tier classifier for SDK export governance.
 *
 * Priority:
 * 1) @sdkTier JSDoc tag
 * 2) internal markers
 * 3) advanced markers
 * 4) stable allowlist / stable naming conventions
 * 5) unclassified (forces explicit governance decision)
 */
export function classifySymbolTier(
  name: string,
  options?: { declaredTierTag?: DeclaredTierTag },
): StabilityTier {
  if (options?.declaredTierTag) return options.declaredTierTag;

  const { tiers } = getProjectContext();

  if (hasPatternMatch(name, tiers.internalPatterns)) return 'internal';
  if (hasPatternMatch(name, tiers.advancedPatterns)) return 'advanced';

  if (tiers.stableExact.has(name)) return 'stable';
  if (tiers.stablePrefixes.some((prefix) => name.startsWith(prefix))) return 'stable';

  return 'unclassified';
}
