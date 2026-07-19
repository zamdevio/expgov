import { describe, expect, it } from 'vitest';

import {
  COMPAT_BASELINE_LATEST_TAG,
  resolveCompatBaseline,
  resolveValidateSinceRef,
} from '../../git/compatBaseline.js';
import { ExportError } from '../../errors/index.js';
import { clearProjectContext, initProjectContextFromConfig } from '../../context/index.js';
import type { ExpgovConfig } from '../../types/config/index.js';
import { ExpgovTmpFixture } from './helpers/tmpFixture.js';

const miniConfig: ExpgovConfig = {
  packageName: '@test/pkg',
  core: {
    dir: 'packages/core',
    rootBarrel: 'packages/core/src/index.ts',
    subpaths: { '.': 'src/index.ts' },
  },
  cache: { enabled: true, dir: '.expgov/cache' },
  git: { tagPattern: 'v*', timelineBarrelPath: 'packages/core/src/index.ts' },
};

describe('resolveCompatBaseline', () => {
  it('returns undefined when unset', () => {
    expect(resolveCompatBaseline(undefined, ['v1.0.0'])).toBeUndefined();
  });

  it('passes through an explicit ref', () => {
    expect(resolveCompatBaseline('v1.0.0', ['v1.0.0', 'v1.0.1'])).toBe('v1.0.0');
  });

  it('resolves latest-tag to the newest matching tag', () => {
    expect(resolveCompatBaseline(COMPAT_BASELINE_LATEST_TAG, ['v1.0.0', 'v1.0.1'])).toBe('v1.0.1');
  });

  it('throws when latest-tag has no matching tags', () => {
    const fixture = new ExpgovTmpFixture('compat-baseline');
    try {
      fixture.write({
        'packages/core/package.json': JSON.stringify({ name: '@test/pkg', version: '1.0.0' }),
        'packages/core/src/index.ts': 'export {};\n',
      });
      initProjectContextFromConfig(miniConfig, fixture.root);
      expect(() => resolveCompatBaseline(COMPAT_BASELINE_LATEST_TAG, [])).toThrow(ExportError);
    } finally {
      clearProjectContext();
      fixture.cleanup();
    }
  });
});

describe('resolveValidateSinceRef', () => {
  it('prefers CLI --since over config baseline', () => {
    expect(resolveValidateSinceRef('v0.9.0', 'v1.0.0')).toBe('v0.9.0');
  });

  it('falls back to config baseline when CLI omits --since', () => {
    expect(resolveValidateSinceRef(undefined, 'v1.0.0')).toBe('v1.0.0');
  });

  it('prefers CLI --since over latest-tag config', () => {
    expect(resolveValidateSinceRef('HEAD', COMPAT_BASELINE_LATEST_TAG)).toBe('HEAD');
  });
});
