import { getProjectContext } from '../context/index.js';
import { formatTierTagProvenance, tierFromTagLiteral } from '../config/tierTag.js';
import {
  compilePrefixMatcher,
  testPrefixMatcher,
} from '../config/tiers.js';
import { BUILTIN_DEFAULT_PREFIXES } from '../shared/constants/tiers.js';
import { MAX_REEXPORT_DEPTH } from '../shared/constants/inventory.js';
import type { TierBucket } from '../types/config/tiers.js';
import {
  declarationPatternFor,
  findNamedReexportSpecifier,
  readModuleFromBarrel,
} from './reexport-chain.js';
import type {
  StabilityTier,
  SymbolTierClassification,
  TierBucketName,
  TierProvenance,
} from '../types/inventory/tiers.js';

function resolveDeclaredTierTagInContent(input: {
  name: string;
  moduleContent: string;
}): { tier: string; tagLiteral: string } | undefined {
  const { name, moduleContent } = input;
  const { tierTag } = getProjectContext();
  const declarationPattern = declarationPatternFor(name);

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
      const tier = tierFromTagLiteral(tierTag, tagLiteral);
      if (tier) return { tier, tagLiteral };
    }

    match = declarationPattern.exec(moduleContent);
  }

  return undefined;
}

/**
 * Follow re-export chains to the declaring module and read the configured tier JSDoc tag.
 */
export function resolveDeclaredTierTag(input: {
  name: string;
  barrelRepoPath: string;
  sourceSpecifier: string | null;
  barrelContent?: string | null;
  readAtPath: (repoPath: string) => string | null;
}): { tier: string; tagLiteral: string } | undefined {
  if (!input.sourceSpecifier) {
    if (!input.barrelContent) return undefined;
    return resolveDeclaredTierTagInContent({ name: input.name, moduleContent: input.barrelContent });
  }

  let barrelPath = input.barrelRepoPath;
  let symbolName = input.name;
  let specifier = input.sourceSpecifier;

  for (let depth = 0; depth < MAX_REEXPORT_DEPTH; depth++) {
    const mod = readModuleFromBarrel(input.readAtPath, barrelPath, specifier);
    if (!mod) return undefined;

    const declared = resolveDeclaredTierTagInContent({ name: symbolName, moduleContent: mod.content });
    if (declared) return declared;

    const next = findNamedReexportSpecifier(mod.content, mod.repoPath, symbolName);
    if (!next) return undefined;

    barrelPath = mod.repoPath;
    specifier = next.specifier;
    symbolName = next.sourceSymbol;
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

  const hasExplicitBucket = nested !== undefined;
  if (!hasExplicitBucket) {
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

function classifyConfigTierWithProvenance(name: string): SymbolTierClassification | null {
  const { tierCatalog, tierConfig } = getProjectContext();

  for (const entry of tierCatalog.entries) {
    const provenance = matchTierBucketProvenance(
      name,
      entry.name,
      tierConfig[entry.name] as TierBucket | undefined,
      BUILTIN_DEFAULT_PREFIXES[entry.name as keyof typeof BUILTIN_DEFAULT_PREFIXES] ?? [],
    );
    if (provenance) {
      return { tier: entry.name, provenance };
    }
  }

  return null;
}

function tagTierClassification(tier: string, tagLiteral: string): SymbolTierClassification {
  const { tierTag } = getProjectContext();
  return {
    tier,
    provenance: {
      kind: 'tag',
      label: formatTierTagProvenance(tierTag, tagLiteral),
    },
  };
}

/**
 * Tier classifier with provenance for SDK export governance.
 *
 * When both JSDoc tag and config match, `tiers.tag.precedence` decides (default: tag wins).
 */
export function classifySymbolTierWithProvenance(
  name: string,
  options?: { declaredTierTag?: string; declaredTagLiteral?: string },
): SymbolTierClassification {
  const tagResult = options?.declaredTierTag
    ? tagTierClassification(options.declaredTierTag, options.declaredTagLiteral ?? options.declaredTierTag)
    : null;
  const configResult = classifyConfigTierWithProvenance(name);

  if (tagResult && configResult) {
    const { tierTag } = getProjectContext();
    return tierTag.precedence === 'config' ? configResult : tagResult;
  }
  if (tagResult) return tagResult;
  if (configResult) return configResult;

  return { tier: 'unclassified', provenance: null };
}

/** Tier classifier for SDK export governance (tier only). */
export function classifySymbolTier(
  name: string,
  options?: { declaredTierTag?: string; declaredTagLiteral?: string },
): StabilityTier {
  return classifySymbolTierWithProvenance(name, options).tier;
}
