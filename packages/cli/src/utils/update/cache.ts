import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';

import { NPM_REGISTRY_LATEST_URL, UPDATE_STATE_SCHEMA_VERSION } from '../../constants/update.js';
import { ensureVersionStateDirExists, getUpdateStateFilePath } from './paths.js';

export type UpdateStateFile = {
  schemaVersion: typeof UPDATE_STATE_SCHEMA_VERSION;
  lastAttemptMs: number;
  lastSuccessMs: number | null;
  latestRegistryVersion: string | null;
  lastError: string | null;
  registryEndpoint: string;
  cliVersionWhenRecorded: string | null;
};

function emptyState(registryEndpoint: string): UpdateStateFile {
  return {
    schemaVersion: UPDATE_STATE_SCHEMA_VERSION,
    lastAttemptMs: 0,
    lastSuccessMs: null,
    latestRegistryVersion: null,
    lastError: null,
    registryEndpoint,
    cliVersionWhenRecorded: null,
  };
}

function parseV1(raw: unknown, registryEndpoint: string): UpdateStateFile | null {
  if (raw === null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.schemaVersion !== UPDATE_STATE_SCHEMA_VERSION) return null;
  const lastAttemptMs =
    typeof o.lastAttemptMs === 'number' && Number.isFinite(o.lastAttemptMs) ? o.lastAttemptMs : 0;
  const lastSuccessMs =
    o.lastSuccessMs === null
      ? null
      : typeof o.lastSuccessMs === 'number' && Number.isFinite(o.lastSuccessMs)
        ? o.lastSuccessMs
        : null;
  const latest =
    o.latestRegistryVersion === null
      ? null
      : typeof o.latestRegistryVersion === 'string' && o.latestRegistryVersion.trim()
        ? o.latestRegistryVersion.trim()
        : null;
  const lastError =
    o.lastError === null || o.lastError === undefined
      ? null
      : typeof o.lastError === 'string'
        ? o.lastError
        : null;
  const ep =
    typeof o.registryEndpoint === 'string' && o.registryEndpoint.trim()
      ? o.registryEndpoint.trim()
      : registryEndpoint;
  const cliVer =
    o.cliVersionWhenRecorded === null || o.cliVersionWhenRecorded === undefined
      ? null
      : typeof o.cliVersionWhenRecorded === 'string'
        ? o.cliVersionWhenRecorded
        : null;
  return {
    schemaVersion: UPDATE_STATE_SCHEMA_VERSION,
    lastAttemptMs,
    lastSuccessMs,
    latestRegistryVersion: latest,
    lastError,
    registryEndpoint: ep,
    cliVersionWhenRecorded: cliVer,
  };
}

export function readUpdateState(registryEndpoint: string = NPM_REGISTRY_LATEST_URL): UpdateStateFile {
  const filePath = getUpdateStateFilePath();
  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
    const state = parseV1(parsed, registryEndpoint);
    if (state !== null) return state;
  } catch {
    /* missing file or invalid JSON */
  }
  return emptyState(registryEndpoint);
}

export function writeUpdateState(state: UpdateStateFile): void {
  ensureVersionStateDirExists();
  const filePath = getUpdateStateFilePath();
  writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

export function resetUpdateState(): void {
  try {
    unlinkSync(getUpdateStateFilePath());
  } catch {
    /* ignore */
  }
}
