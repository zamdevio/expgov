import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LIST_TOP,
  MIN_LIST_TOP,
} from '../constants/list.js';
import {
  buildJsonListGuidance,
  formatListTruncationHint,
  limitList,
  resolveListLimit,
} from '../listing.js';

describe('resolveListLimit', () => {
  it('defaults to DEFAULT_LIST_TOP', () => {
    expect(resolveListLimit()).toBe(DEFAULT_LIST_TOP);
  });

  it('--full removes the cap', () => {
    expect(resolveListLimit({ full: true })).toBe(Infinity);
  });

  it('--top overrides default', () => {
    expect(resolveListLimit({ top: 3 })).toBe(3);
  });

  it('clamps top to MIN_LIST_TOP', () => {
    expect(resolveListLimit({ top: 0 })).toBe(MIN_LIST_TOP);
  });
});

describe('limitList', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];

  it('truncates and reports hidden count', () => {
    const { items: visible, hiddenCount } = limitList(items, 2);
    expect(visible).toEqual(['a', 'b']);
    expect(hiddenCount).toBe(3);
  });

  it('returns all when under limit', () => {
    const { items: visible, hiddenCount } = limitList(items, 10);
    expect(visible).toEqual(items);
    expect(hiddenCount).toBe(0);
  });

  it('returns all when limit is infinite', () => {
    const { items: visible, hiddenCount } = limitList(items, Infinity);
    expect(visible).toEqual(items);
    expect(hiddenCount).toBe(0);
  });
});

describe('formatListTruncationHint', () => {
  it('is empty when nothing hidden', () => {
    expect(formatListTruncationHint(0)).toBe('');
  });

  it('mentions hidden count and list flags', () => {
    const hint = formatListTruncationHint(1);
    expect(hint).toContain('1 more');
    expect(hint).toContain('-F/--full');
    expect(hint).toContain('-T/--top');
  });
});

describe('buildJsonListGuidance', () => {
  it('marks truncated false when nothing is hidden', () => {
    expect(
      buildJsonListGuidance([
        { name: 'symbols', shown: 10, hidden: 0 },
        { name: 'namespaces', shown: 2, hidden: 0 },
      ]),
    ).toEqual({ truncated: false });
  });

  it('builds a note that points at -F and -T when rows are hidden', () => {
    const guidance = buildJsonListGuidance([
      { name: 'symbols', shown: 10, hidden: 91 },
      { name: 'namespaces', shown: 0, hidden: 0 },
    ]);
    expect(guidance.truncated).toBe(true);
    expect(guidance.note).toContain('symbols: 91 more hidden (showing 10 of 101)');
    expect(guidance.note).toContain('-F/--full');
    expect(guidance.note).toContain('-T/--top');
    expect(guidance.note).not.toContain('namespaces:');
  });
});
