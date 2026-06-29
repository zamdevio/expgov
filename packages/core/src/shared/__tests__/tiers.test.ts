import { describe, expect, it } from 'vitest';

import { compilePrefixMatcher, matchesTierBucket, testPrefixMatcher } from '../../config/tiers.js';
import { REGEX_METACHAR } from '../constants/tiers.js';

describe('REGEX_METACHAR', () => {
  it('detects regex metacharacters', () => {
    expect(REGEX_METACHAR.test('^internal')).toBe(true);
    expect(REGEX_METACHAR.test('run')).toBe(false);
  });
});

describe('compilePrefixMatcher', () => {
  it('uses literal prefix when no metacharacters', () => {
    const matcher = compilePrefixMatcher('run');
    expect(matcher).toEqual({ kind: 'prefix', value: 'run' });
    expect(testPrefixMatcher('runExports', matcher)).toBe(true);
  });

  it('parses slash-wrapped regex', () => {
    const matcher = compilePrefixMatcher('/^beta[A-Z_]/');
    expect(matcher.kind).toBe('regex');
    if (matcher.kind === 'regex') {
      expect(matcher.pattern.test('betaFoo')).toBe(true);
      expect(matcher.pattern.test('alpha')).toBe(false);
    }
  });
});

describe('matchesTierBucket', () => {
  it('matches exact and prefix rules', () => {
    const bucket = {
      exact: new Set(['MyType']),
      matchers: [compilePrefixMatcher('run')],
    };
    expect(matchesTierBucket('MyType', bucket)).toBe(true);
    expect(matchesTierBucket('runFoo', bucket)).toBe(true);
    expect(matchesTierBucket('other', bucket)).toBe(false);
  });
});
