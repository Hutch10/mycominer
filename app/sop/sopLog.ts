import { SOPLogCategory, SOPLogEntry } from './sopTypes';

const sopLog: SOPLogEntry[] = [];

export function addSopLog(params: {
  category: SOPLogCategory;
  message: string;
  context?: SOPLogEntry['context'];
  details?: unknown;
}): SOPLogEntry {
  const entry: SOPLogEntry = {
    entryId: `${params.category}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    category: params.category,
    message: params.message,
    context: params.context,
    details: params.details,
  };
  sopLog.unshift(entry);
  return entry;
}

export function getSopLog(limit = 50): SOPLogEntry[] {
  return sopLog.slice(0, limit);
}

export function filterSopLog(category: SOPLogCategory): SOPLogEntry[] {
  return sopLog.filter((e) => e.category === category);
}
