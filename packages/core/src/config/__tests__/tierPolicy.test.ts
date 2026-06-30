import { describe, expect, it } from 'vitest';

import { resolveTierCatalog } from '../../config/tierCatalog.js';
import {
  isBuiltinPolicyName,
  policyViolatesRootFlat,
  resolvePolicyRules,
  resolveTierPolicies,
} from '../../config/tierPolicy.js';
import { BUILTIN_POLICY_DEFAULTS } from '../../shared/constants/tierPolicies.js';

describe('resolveTierPolicies', () => {
  it('ships built-in presets with default rules', () => {
    const policies = resolveTierPolicies();
    expect(policies.get('public')?.rules).toEqual(BUILTIN_POLICY_DEFAULTS.public);
    expect(policies.get('maintainer')?.rules).toEqual(BUILTIN_POLICY_DEFAULTS.maintainer);
    expect(policies.get('experimental')?.rules).toEqual(BUILTIN_POLICY_DEFAULTS.experimental);
  });

  it('merges config overrides onto built-in presets', () => {
    const policies = resolveTierPolicies({
      policies: {
        experimental: { rules: { rootFlat: 'allow' } },
      },
    });
    expect(policies.get('experimental')?.rules.rootFlat).toBe('allow');
    expect(policies.get('public')?.rules).toEqual(BUILTIN_POLICY_DEFAULTS.public);
  });

  it('registers custom policies with permissive defaults', () => {
    const policies = resolveTierPolicies({
      policies: {
        partnerApi: { rules: { rootFlat: 'deny' } },
      },
    });
    expect(policies.get('partnerApi')?.rules.rootFlat).toBe('deny');
  });
});

describe('resolveTierCatalog', () => {
  it('resolves policy rules on bucket entries', () => {
    const catalog = resolveTierCatalog({
      internal: { prefix: ['^internal'] },
      beta: { policy: 'preview', prefix: ['^beta'] },
    });
    const internal = catalog.byName.get('internal');
    expect(internal?.policy).toBe('maintainer');
    expect(policyViolatesRootFlat(internal!.policyRules)).toBe(true);

    const beta = catalog.byName.get('beta');
    expect(beta?.policy).toBe('preview');
    expect(policyViolatesRootFlat(beta!.policyRules)).toBe(false);
  });

  it('applies custom policy refs from tiers.policies', () => {
    const catalog = resolveTierCatalog({
      policies: {
        partnerApi: { rules: { rootFlat: 'deny' } },
      },
      beta: { policy: 'partnerApi', prefix: ['^beta'] },
    });
    const beta = catalog.byName.get('beta');
    expect(beta?.policy).toBe('partnerApi');
    expect(policyViolatesRootFlat(beta!.policyRules)).toBe(true);
    expect(resolvePolicyRules('partnerApi', catalog.policies).rootFlat).toBe('deny');
  });

  it('ignores tiers.policies when collecting buckets', () => {
    const catalog = resolveTierCatalog({
      policies: {
        partnerApi: { rules: { rootFlat: 'deny' } },
      },
    });
    expect(catalog.byName.has('policies')).toBe(false);
    expect(catalog.policies.has('partnerApi')).toBe(true);
  });
});

describe('isBuiltinPolicyName', () => {
  it('recognizes built-in policy ids', () => {
    expect(isBuiltinPolicyName('public')).toBe(true);
    expect(isBuiltinPolicyName('partnerApi')).toBe(false);
  });
});
