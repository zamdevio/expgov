import { resolveSdkVersion } from './version.js';

/** npm package name for the expgov SDK (`packages/core`). */
export const SDK_PACKAGE_NAME = '@expgov/core' as const;

/** Semantic version from `packages/core/package.json` (injected at build; see `version.ts`). */
export const SDK_VERSION = resolveSdkVersion();
