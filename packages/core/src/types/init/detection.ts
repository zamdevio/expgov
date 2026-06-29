import type { ExpgovCoreConfig } from '../config/expgov.js';

export type InitLayout = 'monorepo-core' | 'single-package' | 'generic';

export interface InitDetection {
  layout: InitLayout;
  packageName: string;
  core: ExpgovCoreConfig;
  rootBarrel: string;
  notes: string[];
}
