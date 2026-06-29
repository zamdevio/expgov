import type { CliJsonEnvelope, Issue } from '../json/envelope.js';
import type { CommandStatus } from './status.js';

export type LogLevel = 'info' | 'notice' | 'warn' | 'error' | 'tip' | 'verbose';

export type LogEvent =
  | { type: 'log'; level: LogLevel; message: string }
  | { type: 'raw'; message: string; stream?: 'stdout' | 'stderr' }
  | { type: 'blank' }
  | { type: 'summary'; text: string }
  | { type: 'note'; text: string }
  | { type: 'footer'; command: string; status: CommandStatus; durationMs: number }
  | { type: 'header'; command: string; subtitle: string }
  | { type: 'meta'; rows: Record<string, string | undefined> }
  | { type: 'report'; command: string; body: string }
  | { type: 'envelope'; envelope: CliJsonEnvelope<string, unknown> };

export type CommandSummary = {
  command: string;
  status: CommandStatus;
  durationMs: number;
  exitCode?: number;
  issues: Issue[];
};

export type LogSink = (event: LogEvent) => void;
