import type { UPDATE_STATE_SCHEMA_VERSION } from '../../constants/update.js';

export interface UpdateStateFile {
  schemaVersion: typeof UPDATE_STATE_SCHEMA_VERSION;
  lastAttemptMs: number;
  lastSuccessMs: number | null;
  latestRegistryVersion: string | null;
  lastError: string | null;
  registryEndpoint: string;
  cliVersionWhenRecorded: string | null;
}
