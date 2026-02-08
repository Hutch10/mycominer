import { KnowledgeGraphLogEntry, KnowledgeGraphLogCategory } from './knowledgeGraphTypes';

const logStore: KnowledgeGraphLogEntry[] = [];

export function logGraphEvent(category: KnowledgeGraphLogCategory, message: string, context?: Record<string, unknown>): KnowledgeGraphLogEntry {
  const entry: KnowledgeGraphLogEntry = {
    entryId: `klog-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    category,
    message,
    context,
  };
  logStore.unshift(entry);
  return entry;
}

export function getGraphLog(limit = 100, category?: KnowledgeGraphLogCategory): KnowledgeGraphLogEntry[] {
  const rows = category ? logStore.filter((l) => l.category === category) : logStore;
  return rows.slice(0, limit);
}

export function clearGraphLog(): void {
  logStore.length = 0;
}
