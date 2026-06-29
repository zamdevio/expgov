import { getProjectContext } from '../context/index.js';
import type { TierBucket } from '../config/types.js';
import { formatTierTagProvenance } from '../config/tierTag.js';
import {
  compilePrefixMatcher,
  testPrefixMatcher,
} from '../config/tiers.js';
import { TIER_BUCKET_ORDER } from '../shared/constants/tiers.js';
import type {
  DeclaredTierTag,
  StabilityTier,
  SymbolTierClassification,
  TierBucketName,
  TierProvenance,
} from '../types/inventory/tiers.js';

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Reads the configured export-tier JSDoc tag from the declaration block of a symbol.
 */
export function resolveDeclaredTierTag(input: {
  name: string;
  moduleContent: string | null;
}): { tier: DeclaredTierTag; tagLiteral: string } | undefined {
  const { name, moduleContent } = input;
  if (!moduleContent) return undefined;

  const { tierTag } = getProjectContext();
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
    const tagMatch = tierTag.tagPattern.exec(jsDocBlock);
    if (tagMatch?.[1]) {
      const tagLiteral = tagMatch[1];
      const tier = tierTag.labelToTier.get(tagLiteral);
      if (tier) return { tier, tagLiteral };
    }

    match = declarationPattern.exec(moduleContent);
  }

  return undefined;
}

function matchTierBucketProvenance(
  name: string,
  bucketName: TierBucketName,
  nested: TierBucket | undefined,
  defaultPrefixes: readonly string[],
): TierProvenance | null {
  const exact = nested?.exact ?? [];
  if (exact.includes(name)) {
    return { kind: 'config-exact', label: `tiers.${bucketName}.exact`, bucket: bucketName };
  }

  const configPrefixes = nested?.prefix ?? [];
  for (const prefix of configPrefixes) {
    const matcher = compilePrefixMatcher(prefix);
    if (testPrefixMatcher(name, matcher)) {
      return { kind: 'config-prefix', label: `tiers.${bucketName}.prefix`, bucket: bucketName };
    }
  }

  const hasConfig = Boolean(nested && (exact.length || configPrefixes.length));
  if (!hasConfig) {
    for (const prefix of defaultPrefixes) {
      const matcher = compilePrefixMatcher(prefix);
      if (testPrefixMatcher(name, matcher)) {
        return {
          kind: 'default-prefix',
          label: `default ${bucketName} prefix`,
          bucket: bucketName,
        };
      }
    }
  }

  return null;
}

/**
 * Tier classifier with provenance for SDK export governance.
 *
 * Priority:
 * 1) configured JSDoc tier tag (default `@sdkTier`)
 * 2) tiers.internal (exact + prefix/regex)
 * 3) tiers.advanced (exact + prefix/regex)
 * 4) tiers.stable (exact + prefix/regex)
 * 5) unclassified (forces explicit governance decision)
 */
export function classifySymbolTierWithProvenance(
  name: string,
  options?: { declaredTierTag?: DeclaredTierTag; declaredTagLiteral?: string },
): SymbolTierClassification {
  if (options?.declaredTierTag) {
    const { tierTag } = getProjectContext();
    const tagLiteral = options.declaredTagLiteral ?? options.declaredTierTag;
    return {
      tier: options.declaredTierTag,
      provenance: {
        kind: 'tag',
        label: formatTierTagProvenance(tierTag, tagLiteral),
      },
    };
  }

  const { tierConfig } = getProjectContext();

  for (const bucket of TIER_BUCKET_ORDER) {
    const provenance = matchTierBucketProvenance(name, bucket.name, tierConfig[bucket.name], bucket.defaults);
    if (provenance) {
      return { tier: bucket.tier, provenance };
    }
  }

  return { tier: 'unclassified', provenance: null };
}

/** Tier classifier for SDK export governance (tier only). */
export function classifySymbolTier(
  name: string,
  options?: { declaredTierTag?: DeclaredTierTag; declaredTagLiteral?: string },
): StabilityTier {
  return classifySymbolTierWithProvenance(name, options).tier;
}
