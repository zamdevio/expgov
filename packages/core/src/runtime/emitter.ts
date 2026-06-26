import type { LogEvent, LogSink } from './events.js';

const sinks = new Set<LogSink>();
let defaultSinkInstalled = false;

export function subscribeLogSink(sink: LogSink): () => void {
  sinks.add(sink);
  return () => sinks.delete(sink);
}

export function clearLogSinks(): void {
  sinks.clear();
  defaultSinkInstalled = false;
}

export function emitLog(event: LogEvent): void {
  for (const sink of sinks) sink(event);
}

export function installDefaultLogSink(sink: LogSink): void {
  if (defaultSinkInstalled) return;
  subscribeLogSink(sink);
  defaultSinkInstalled = true;
}

export function isDefaultSinkInstalled(): boolean {
  return defaultSinkInstalled;
}
