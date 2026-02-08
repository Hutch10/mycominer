import { SandboxLogCategory, SandboxLogEntry } from './sandboxTypes';

const sandboxLog: SandboxLogEntry[] = [];

export function addSandboxLog(params: {
  category: SandboxLogCategory;
  message: string;
  context?: SandboxLogEntry['context'];
  details?: unknown;
}): SandboxLogEntry {
  const entry: SandboxLogEntry = {
    entryId: `${params.category}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    category: params.category,
    message: params.message,
    context: params.context,
    details: params.details,
  };
  sandboxLog.unshift(entry);
  return entry;
}

export function getSandboxLog(limit = 50): SandboxLogEntry[] {
  return sandboxLog.slice(0, limit);
}

export function filterSandboxLog(category: SandboxLogCategory): SandboxLogEntry[] {
  return sandboxLog.filter((e) => e.category === category);
}
