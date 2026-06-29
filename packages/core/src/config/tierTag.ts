import type { DeclaredTierTag } from '../types/inventory/tiers.js';
import {
  DEFAULT_TIER_TAG_NAME,
  DEFAULT_TIER_TAG_VALUES,
  MAX_TIER_TAG_VALUES,
} from '../shared/constants/tiers.js';
import type { TierTagConfig } from './types.js';

export interface ResolvedTierTagPolicy {
  name: string;
  labelToTier: ReadonlyMap<string, DeclaredTierTag>;
  tagPattern: RegExp;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeTagName(name: string | undefined): string {
  const trimmed = (name ?? DEFAULT_TIER_TAG_NAME).trim();
  if (!trimmed) return DEFAULT_TIER_TAG_NAME;
  return trimmed.replace(/^@+/, '');
}

function buildLabelMap(config?: TierTagConfig): ReadonlyMap<string, DeclaredTierTag> {
  const entries = Object.entries(config?.values ?? DEFAULT_TIER_TAG_VALUES);
  if (entries.length > MAX_TIER_TAG_VALUES) {
    throw new Error(
      `tiers.tag.values has ${entries.length} entries (max ${MAX_TIER_TAG_VALUES})`,
    );
  }

  const map = new Map<string, DeclaredTierTag>();
  for (const [label, tier] of entries) {
    const key = label.trim();
    if (!key) continue;
    if (tier !== 'stable' && tier !== 'internal' && tier !== 'advanced') {
      throw new Error(
        `tiers.tag.values.${label} must map to stable, internal, or advanced (got ${String(tier)})`,
      );
    }
    map.set(key, tier);
  }

  if (map.size === 0) {
    return new Map(Object.entries(DEFAULT_TIER_TAG_VALUES)) as Map<string, DeclaredTierTag>;
  }

  return map;
}

export function resolveTierTagPolicy(config?: TierTagConfig): ResolvedTierTagPolicy {
  const name = normalizeTagName(config?.name);
  const labelToTier = buildLabelMap(config);
  const labels = [...labelToTier.keys()].map(escapeRegExp).join('|');
  const tagPattern = new RegExp(String.raw`@${escapeRegExp(name)}\s+(${labels})\b`);

  return { name, labelToTier, tagPattern };
}

export function formatTierTagProvenance(policy: ResolvedTierTagPolicy, tagLiteral: string): string {
  return `@${policy.name} ${tagLiteral}`;
}
