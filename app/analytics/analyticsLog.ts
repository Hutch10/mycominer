// Phase 39: Global Analytics & Incident Pattern Library
// analyticsLog.ts
// Deterministic logging for all analytics sessions and operations

import { AnalyticsLogEntry, AnalyticsLogEntryType, AnalyticsQuery } from './analyticsTypes';

let analyticsLog: AnalyticsLogEntry[] = [];

export function logAnalyticsEntry(entry: Omit<AnalyticsLogEntry, 'logId'>): AnalyticsLogEntry {
  const logEntry: AnalyticsLogEntry = {
    logId: `alog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...entry,
  };
  analyticsLog.push(logEntry);
  return logEntry;
}

export function logAnalyticsQuery(query: AnalyticsQuery, status: 'success' | 'partial' | 'failed', info: {
  clustersGenerated?: number;
  patternsFound?: number;
  trendsComputed?: number;
  executionTimeMs?: number;
  errorMessage?: string;
}): AnalyticsLogEntry {
  return logAnalyticsEntry({
    timestamp: new Date().toISOString(),
    entryType: 'query-initiated',
    tenantId: query.tenantId,
    query,
    status,
    clustersGenerated: info.clustersGenerated,
    patternsFound: info.patternsFound,
    trendsComputed: info.trendsComputed,
    executionTimeMs: info.executionTimeMs,
    errorMessage: info.errorMessage,
    scopeFiltering: {
      tenantsInScope: [query.tenantId],
      facilitiesInScope: query.scope.facilityId ? [query.scope.facilityId] : [],
    },
  });
}

export function logClusteringComplete(tenantId: string, clustersGenerated: number, executionTimeMs: number): AnalyticsLogEntry {
  return logAnalyticsEntry({
    timestamp: new Date().toISOString(),
    entryType: 'clustering-complete',
    tenantId,
    clustersGenerated,
    executionTimeMs,
    status: 'success',
    scopeFiltering: {
      tenantsInScope: [tenantId],
      facilitiesInScope: [],
    },
  });
}

export function logPatternLibraryQueried(tenantId: string, patternsFound: number, executionTimeMs: number): AnalyticsLogEntry {
  return logAnalyticsEntry({
    timestamp: new Date().toISOString(),
    entryType: 'pattern-library-queried',
    tenantId,
    patternsFound,
    executionTimeMs,
    status: 'success',
    scopeFiltering: {
      tenantsInScope: [tenantId],
      facilitiesInScope: [],
    },
  });
}

export function logTrendAnalysisComplete(tenantId: string, trendsComputed: number, executionTimeMs: number): AnalyticsLogEntry {
  return logAnalyticsEntry({
    timestamp: new Date().toISOString(),
    entryType: 'trend-analysis-complete',
    tenantId,
    trendsComputed,
    executionTimeMs,
    status: 'success',
    scopeFiltering: {
      tenantsInScope: [tenantId],
      facilitiesInScope: [],
    },
  });
}

export function logResultGenerated(tenantId: string, resultId: string, clustersGenerated: number, patternsFound: number, trendsComputed: number, executionTimeMs: number): AnalyticsLogEntry {
  return logAnalyticsEntry({
    timestamp: new Date().toISOString(),
    entryType: 'result-generated',
    tenantId,
    resultId,
    clustersGenerated,
    patternsFound,
    trendsComputed,
    executionTimeMs,
    status: 'success',
    scopeFiltering: {
      tenantsInScope: [tenantId],
      facilitiesInScope: [],
    },
  });
}

export function logAccessDenied(tenantId: string, reason: string): AnalyticsLogEntry {
  return logAnalyticsEntry({
    timestamp: new Date().toISOString(),
    entryType: 'access-denied',
    tenantId,
    status: 'failed',
    errorMessage: reason,
    scopeFiltering: {
      tenantsInScope: [tenantId],
      facilitiesInScope: [],
    },
  });
}

export function logAnalyticsError(tenantId: string, entryType: AnalyticsLogEntryType, errorMessage: string): AnalyticsLogEntry {
  return logAnalyticsEntry({
    timestamp: new Date().toISOString(),
    entryType,
    tenantId,
    status: 'failed',
    errorMessage,
    scopeFiltering: {
      tenantsInScope: [tenantId],
      facilitiesInScope: [],
    },
  });
}

export function getAnalyticsLog(): AnalyticsLogEntry[] {
  return [...analyticsLog];
}

export function getAnalyticsLogByTenant(tenantId: string): AnalyticsLogEntry[] {
  return analyticsLog.filter((entry) => entry.tenantId === tenantId);
}

export function getAnalyticsLogByType(entryType: AnalyticsLogEntryType): AnalyticsLogEntry[] {
  return analyticsLog.filter((entry) => entry.entryType === entryType);
}

export function clearAnalyticsLog(): void {
  analyticsLog = [];
}

export function filterAnalyticsLog(predicate: (entry: AnalyticsLogEntry) => boolean): AnalyticsLogEntry[] {
  return analyticsLog.filter(predicate);
}
