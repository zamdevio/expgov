import { coreLogRaw, style } from '@expgov/core';

import { CLI_PACKAGE_NAME } from '../../constants/cli.js';

export const VERSION_UNKNOWN = '—' as const;

export function formatGlobalInstallHintLine(packageName = CLI_PACKAGE_NAME): string {
  return (
    `${style.blue('pnpm')} add -g ${packageName}@latest or ` +
    `${style.blue('npm')} install -g ${packageName}@latest`
  );
}

export function printGlobalInstallHints(): void {
  coreLogRaw(formatGlobalInstallHintLine());
}
