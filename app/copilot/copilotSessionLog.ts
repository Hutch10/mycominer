import { CopilotSessionLogCategory, CopilotSessionLogEntry } from './copilotTypes';

const copilotLog: CopilotSessionLogEntry[] = [];

export function logCopilot(category: CopilotSessionLogCategory, message: string, context?: Record<string, unknown>): CopilotSessionLogEntry {
  const entry: CopilotSessionLogEntry = {
    entryId: `clog-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    category,
    message,
    context,
  };
  copilotLog.unshift(entry);
  return entry;
}

export function getCopilotLog(limit = 100, category?: CopilotSessionLogCategory): CopilotSessionLogEntry[] {
  const rows = category ? copilotLog.filter((e) => e.category === category) : copilotLog;
  return rows.slice(0, limit);
}

export function clearCopilotLog(): void {
  copilotLog.length = 0;
}
