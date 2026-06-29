import { DEFAULT_TIER_TAG_NAME } from '../shared/constants/tiers.js';
import type { TierTagConfig } from '../types/config/tiers.js';

export interface ResolvedTierTagPolicy {
  name: string;
  bucketNames: readonly string[];
  tagPattern: RegExp;
  /** When tag and config both match: `tag` (default) or `config`. */
  precedence: 'tag' | 'config';
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeTagName(name: string | undefined): string {
  const trimmed = (name ?? DEFAULT_TIER_TAG_NAME).trim();
  if (!trimmed) return DEFAULT_TIER_TAG_NAME;
  return trimmed.replace(/^@+/, '');
}

export function resolveTierTagPolicy(
  config: TierTagConfig | undefined,
  bucketNames: readonly string[],
): ResolvedTierTagPolicy {
  const name = normalizeTagName(config?.name);
  const labels = [...bucketNames].map(escapeRegExp).join('|');
  const tagPattern = labels.length
    ? new RegExp(String.raw`@${escapeRegExp(name)}\s+(${labels})\b`)
    : /$^/;

  return {
    name,
    bucketNames,
    tagPattern,
    precedence: config?.precedence === 'config' ? 'config' : 'tag',
  };
}

export function formatTierTagProvenance(policy: ResolvedTierTagPolicy, tagLiteral: string): string {
  return `@${policy.name} ${tagLiteral}`;
}

export function tierFromTagLiteral(policy: ResolvedTierTagPolicy, literal: string): string | undefined {
  return policy.bucketNames.includes(literal) ? literal : undefined;
}
