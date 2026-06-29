import { afterEach, describe, expect, it } from 'vitest';

import {
  clearProjectContext,
  initProjectContextFromConfig,
  npmSubpathKey,
} from '../../context/index.js';
import type { ExpgovConfig } from '../../types/config/index.js';

const config: ExpgovConfig = {
  packageName: '@test/pkg',
  core: {
    dir: 'packages/core',
    rootBarrel: 'packages/core/src/index.ts',
    subpaths: { '.': 'src/index.ts' },
  },
};

afterEach(() => {
  clearProjectContext();
});

describe('npmSubpathKey', () => {
  it('normalizes ./-prefixed export keys to package/subpath', () => {
    initProjectContextFromConfig(config, '/tmp');
    expect(npmSubpathKey('.')).toBe('@test/pkg');
    expect(npmSubpathKey('./advanced')).toBe('@test/pkg/advanced');
    expect(npmSubpathKey('advanced')).toBe('@test/pkg/advanced');
    expect(npmSubpathKey('./internal')).toBe('@test/pkg/internal');
  });
});
