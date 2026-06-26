import type { CliJsonEnvelope, Issue } from '../types/json/envelope.js';
import type { CommandStatus } from './types.js';

export type LogLevel = 'info' | 'notice' | 'warn' | 'error' | 'tip' | 'verbose';

export type LogEvent =
  | { type: 'log'; level: LogLevel; message: string }
  | { type: 'raw'; message: string; stream?: 'stdout' | 'stderr' }
  | { type: 'blank' }
  | { type: 'command-line'; command: string; status: CommandStatus; durationMs: number }
  | { type: 'header'; command: string; subtitle: string }
  | { type: 'meta'; rows: Record<string, string | undefined> }
  | { type: 'report'; command: string; body: string }
  | { type: 'envelope'; envelope: CliJsonEnvelope<string, unknown> }
  | { type: 'command-start'; command: string }
  | { type: 'command-end'; command: string; status: CommandStatus; durationMs: number; exitCode?: number };

export type CommandSummary = {
  command: string;
  status: CommandStatus;
  durationMs: number;
  exitCode?: number;
  issues: Issue[];
};

export type LogSink = (event: LogEvent) => void;
