import { describe, expect, it } from 'vitest';

import { evaluateDiffFailMode } from '../../format/diffFail.js';
import {
  ISSUE_DIFF_EXPORTS_REMOVED,
  ISSUE_DIFF_TIER_VIOLATION,
} from '../constants/diff.js';

describe('evaluateDiffFailMode', () => {
  const dirty = {
    removed: ['runScan', 'legacyHelper'],
    tierViolations: ['CLI_NAME (internal) exported flat on root', 'foo (unclassified)'],
  };

  const clean = {
    removed: [] as string[],
    tierViolations: [] as string[],
  };

  it('passes by default even when removals and tier violations exist', () => {
    const result = evaluateDiffFailMode(dirty);
    expect(result.passed).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('fails on removals when --fail-on-removed is set', () => {
    const result = evaluateDiffFailMode(dirty, { failOnRemoved: true });
    expect(result.passed).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toMatchObject({
      severity: 'error',
      code: ISSUE_DIFF_EXPORTS_REMOVED,
    });
    expect(result.issues[0]?.message).toContain('runScan');
    expect(result.issues[0]?.message).toContain('legacyHelper');
  });

  it('passes with --fail-on-removed when nothing was removed', () => {
    const result = evaluateDiffFailMode(
      { removed: [], tierViolations: dirty.tierViolations },
      { failOnRemoved: true },
    );
    expect(result.passed).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('fails on tier violations when --fail-on-tier-violations is set', () => {
    const result = evaluateDiffFailMode(dirty, { failOnTierViolations: true });
    expect(result.passed).toBe(false);
    expect(result.issues).toHaveLength(2);
    expect(result.issues.every((i) => i.code === ISSUE_DIFF_TIER_VIOLATION)).toBe(true);
    expect(result.issues.map((i) => i.message)).toEqual(dirty.tierViolations);
  });

  it('combines both fail flags into one issues list', () => {
    const result = evaluateDiffFailMode(dirty, {
      failOnRemoved: true,
      failOnTierViolations: true,
    });
    expect(result.passed).toBe(false);
    expect(result.issues).toHaveLength(3);
    expect(result.issues[0]?.code).toBe(ISSUE_DIFF_EXPORTS_REMOVED);
    expect(result.issues.slice(1).every((i) => i.code === ISSUE_DIFF_TIER_VIOLATION)).toBe(true);
  });

  it('passes when both fail flags are set and the surface is clean', () => {
    const result = evaluateDiffFailMode(clean, {
      failOnRemoved: true,
      failOnTierViolations: true,
    });
    expect(result.passed).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('uses singular wording for a single removal', () => {
    const result = evaluateDiffFailMode(
      { removed: ['runScan'], tierViolations: [] },
      { failOnRemoved: true },
    );
    expect(result.issues[0]?.message).toBe('1 flat export removed: runScan');
  });
});
