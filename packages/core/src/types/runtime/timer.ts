import type { CommandStatus } from './status.js';

export interface CommandTimer {
  end(status: CommandStatus, exitCode?: number): number;
  elapsed(): number;
}
