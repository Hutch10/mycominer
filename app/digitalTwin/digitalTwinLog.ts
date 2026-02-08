import { DigitalTwinLogEntry, DigitalTwinLogCategory } from './digitalTwinTypes';

const logBuffer: DigitalTwinLogEntry[] = [];

export function addLogEntry(params: {
  category: DigitalTwinLogCategory;
  message: string;
  context?: DigitalTwinLogEntry['context'];
  details?: unknown;
}): DigitalTwinLogEntry {
  const entry: DigitalTwinLogEntry = {
    entryId: `${params.category}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    category: params.category,
    message: params.message,
    context: params.context ?? {},
    details: params.details,
  };
  logBuffer.unshift(entry);
  return entry;
}

export function getRecentLog(limit = 20): DigitalTwinLogEntry[] {
  return logBuffer.slice(0, limit);
}
