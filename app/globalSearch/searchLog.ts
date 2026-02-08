import { SearchLogCategory, SearchLogEntry } from './globalSearchTypes';

const searchLog: SearchLogEntry[] = [];

export function logSearch(category: SearchLogCategory, message: string, context?: Record<string, unknown>): SearchLogEntry {
  const entry: SearchLogEntry = {
    entryId: `slog-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    category,
    message,
    context,
  };
  searchLog.unshift(entry);
  return entry;
}

export function getSearchLog(limit = 100, category?: SearchLogCategory): SearchLogEntry[] {
  const rows = category ? searchLog.filter((e) => e.category === category) : searchLog;
  return rows.slice(0, limit);
}

export function clearSearchLog(): void {
  searchLog.length = 0;
}
