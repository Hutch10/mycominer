import { TenantLogCategory, TenantLogEntry } from './tenantTypes';

const tenantLog: TenantLogEntry[] = [];

export function addTenantLog(params: { category: TenantLogCategory; message: string; context?: TenantLogEntry['context']; details?: unknown }): TenantLogEntry {
  const entry: TenantLogEntry = {
    entryId: `${params.category}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    category: params.category,
    message: params.message,
    context: params.context,
    details: params.details,
  };
  tenantLog.unshift(entry);
  return entry;
}

export function getTenantLog(limit = 100): TenantLogEntry[] {
  return tenantLog.slice(0, limit);
}

export function filterTenantLog(category: TenantLogCategory): TenantLogEntry[] {
  return tenantLog.filter((e) => e.category === category);
}
