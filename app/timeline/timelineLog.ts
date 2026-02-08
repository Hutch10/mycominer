import { TimelineLogCategory, TimelineLogEntry } from './timelineTypes';

const timelineLog: TimelineLogEntry[] = [];

export function logTimeline(category: TimelineLogCategory, message: string, context?: Record<string, unknown>): TimelineLogEntry {
  const entry: TimelineLogEntry = {
    entryId: `tlog-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    category,
    message,
    context,
  };
  timelineLog.unshift(entry);
  return entry;
}

export function getTimelineLog(limit = 100, category?: TimelineLogCategory): TimelineLogEntry[] {
  const rows = category ? timelineLog.filter((e) => e.category === category) : timelineLog;
  return rows.slice(0, limit);
}

export function clearTimelineLog(): void {
  timelineLog.length = 0;
}
