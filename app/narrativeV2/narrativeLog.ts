import { NarrativeLogCategory, NarrativeLogEntry } from './narrativeTypes';

const narrativeLog: NarrativeLogEntry[] = [];

export function logNarrative(category: NarrativeLogCategory, message: string, context?: Record<string, unknown>): NarrativeLogEntry {
  const entry: NarrativeLogEntry = {
    entryId: `nlog-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    category,
    message,
    context,
  };
  narrativeLog.unshift(entry);
  return entry;
}

export function getNarrativeLog(limit = 100, category?: NarrativeLogCategory): NarrativeLogEntry[] {
  const rows = category ? narrativeLog.filter((e) => e.category === category) : narrativeLog;
  return rows.slice(0, limit);
}

export function clearNarrativeLog(): void {
  narrativeLog.length = 0;
}
