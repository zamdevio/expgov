import { SDK_PACKAGE_NAME, SDK_VERSION } from '@expgov/core';
import { coreLogRaw, style } from '@expgov/core/internal';

import { CLI_VERSION } from '../../constants/cli.js';
import { ENV_EXPGOV_NO_UPDATE_CHECK } from '../../constants/env.js';
import { NPM_REGISTRY_LATEST_URL, UPDATE_STATE_SCHEMA_VERSION, VERSION_UNKNOWN } from '../../constants/update.js';
import { readUpdateState, resetUpdateState, writeUpdateState } from '../update/cache.js';
import { printGlobalInstallHints } from '../update/installHint.js';
import { fetchLatestPublishedVersion, isPublishedVersionNewer } from '../update/registry.js';

function truthyEnv(v: string | undefined): boolean {
  if (v === undefined) return false;
  const x = v.trim().toLowerCase();
  return x === '1' || x === 'true' || x === 'yes';
}

/** Human version lines (visible even when global `-q` / `-s` are set). */
export function printCurrentVersionLine(): void {
  const cliLine = `${style.dim('Current CLI:')} ${style.bold(style.ok(CLI_VERSION))}`;
  const sdkLine = `${style.dim('SDK:')} ${style.bold(style.ok(SDK_VERSION))} ${style.dim(`(${SDK_PACKAGE_NAME})`)}`;
  coreLogRaw(cliLine);
  coreLogRaw(sdkLine);
}

export function formatLatestCliLine(latest: string | null, current: string): string {
  if (!latest) {
    return `${style.dim('Latest CLI:')} ${style.dim(VERSION_UNKNOWN)}`;
  }
  const value = `${style.dim('Latest CLI:')} ${style.bold(style.ok(latest))}`;
  if (!isPublishedVersionNewer(latest, current)) {
    return `${value} ${style.dim('(up to date)')}`;
  }
  return value;
}

export function printVersionCheckReport(latest: string | null): void {
  if (latest && isPublishedVersionNewer(latest, CLI_VERSION)) {
    coreLogRaw(`${style.warn('Update available:')} ${CLI_VERSION} → ${latest}`);
  }

  coreLogRaw(`${style.dim('Current CLI:')} ${style.bold(style.ok(CLI_VERSION))}`);
  coreLogRaw(formatLatestCliLine(latest, CLI_VERSION));

  if (latest && isPublishedVersionNewer(latest, CLI_VERSION)) {
    printGlobalInstallHints();
  }

  const sdkLine = `${style.dim('SDK:')} ${style.bold(style.ok(SDK_VERSION))} ${style.dim(`(${SDK_PACKAGE_NAME})`)}`;
  coreLogRaw(sdkLine);
}

export function runVersionResetCommand(): void {
  resetUpdateState();
  coreLogRaw(
    'Cleared cached npm update check. Next run will look up the latest version again.',
  );
}

export async function runVersionCheckCommand(): Promise<void> {
  if (truthyEnv(process.env[ENV_EXPGOV_NO_UPDATE_CHECK])) {
    coreLogRaw(
      `${style.warn('Update check skipped')} (${ENV_EXPGOV_NO_UPDATE_CHECK} is set).`,
    );
    printCurrentVersionLine();
    return;
  }

  const now = Date.now();
  const prev = readUpdateState(NPM_REGISTRY_LATEST_URL);
  const latest = await fetchLatestPublishedVersion();

  if (!latest) {
    writeUpdateState({
      schemaVersion: UPDATE_STATE_SCHEMA_VERSION,
      lastAttemptMs: now,
      lastSuccessMs: prev.lastSuccessMs,
      latestRegistryVersion: prev.latestRegistryVersion,
      lastError: 'fetch_failed',
      registryEndpoint: NPM_REGISTRY_LATEST_URL,
      cliVersionWhenRecorded: prev.cliVersionWhenRecorded,
    });
    coreLogRaw(
      `${style.warn('Could not fetch latest version')} from the npm registry (offline or unexpected response).`,
    );
    printVersionCheckReport(null);
    return;
  }

  writeUpdateState({
    schemaVersion: UPDATE_STATE_SCHEMA_VERSION,
    lastAttemptMs: now,
    lastSuccessMs: now,
    latestRegistryVersion: latest,
    lastError: null,
    registryEndpoint: NPM_REGISTRY_LATEST_URL,
    cliVersionWhenRecorded: CLI_VERSION,
  });

  printVersionCheckReport(latest);
}
