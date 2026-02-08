/**
 * Phase 42: Operator Insights & Knowledge Packs — Logging System
 * 
 * Comprehensive audit logging for all insights operations:
 * - Query initiation and completion
 * - Pack generation and access
 * - Reference linking
 * - Integration events (Phases 34, 37, 38, 39, 40)
 * - Federation rule enforcement
 * - Errors and warnings
 */

import { InsightsLogEntry, InsightsLogEntryType, InsightReference } from './insightsTypes';

// In-memory log store
const insightsLogStore: InsightsLogEntry[] = [];

// ==================== LOGGING FUNCTIONS ====================

export function logQueryInitiated(
  tenantId: string,
  insightCategory?: string,
  facilityId?: string,
  context?: Record<string, any>
): string {
  const logId = `log-query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const entry: InsightsLogEntry = {
    logId,
    timestamp: new Date().toISOString(),
    entryType: 'query-initiated',
    tenantId,
    facilityId,
    action: `Insight query initiated for category: ${insightCategory || 'all'}`,
    references_used: [],
    context: context || {},
    result: 'success',
  };
  insightsLogStore.push(entry);
  return logId;
}

export function logQueryCompleted(
  logId: string,
  insightCount: number,
  executionTimeMs: number,
  tenantId: string
): void {
  const entry: InsightsLogEntry = {
    logId: `log-completion-${logId}`,
    timestamp: new Date().toISOString(),
    entryType: 'query-completed',
    tenantId,
    action: `Query completed with ${insightCount} insights in ${executionTimeMs}ms`,
    references_used: [],
    context: { original_log_id: logId, insight_count: insightCount },
    result: 'success',
    execution_time_ms: executionTimeMs,
  };
  insightsLogStore.push(entry);
}

export function logPackGenerated(
  packId: string,
  packName: string,
  tenantId: string,
  facilityId?: string,
  sectionCount?: number
): void {
  const entry: InsightsLogEntry = {
    logId: `log-pack-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    entryType: 'pack-generated',
    tenantId,
    facilityId,
    target_pack_id: packId,
    action: `Knowledge pack generated: "${packName}" with ${sectionCount || 0} sections`,
    references_used: [],
    context: { pack_id: packId, section_count: sectionCount },
    result: 'success',
  };
  insightsLogStore.push(entry);
}

export function logPackAccessed(
  packId: string,
  packName: string,
  tenantId: string,
  facilityId?: string
): void {
  const entry: InsightsLogEntry = {
    logId: `log-pack-access-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    entryType: 'pack-accessed',
    tenantId,
    facilityId,
    target_pack_id: packId,
    action: `Knowledge pack accessed: "${packName}"`,
    references_used: [],
    context: { pack_id: packId },
    result: 'success',
  };
  insightsLogStore.push(entry);
}

export function logInsightAssembled(
  insightId: string,
  insightTitle: string,
  tenantId: string,
  facilityId?: string,
  referenceCount?: number
): void {
  const entry: InsightsLogEntry = {
    logId: `log-insight-asm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    entryType: 'insight-assembled',
    tenantId,
    facilityId,
    target_insight_id: insightId,
    action: `Insight assembled: "${insightTitle}" with ${referenceCount || 0} references`,
    references_used: [],
    context: { insight_id: insightId, reference_count: referenceCount },
    result: 'success',
  };
  insightsLogStore.push(entry);
}

export function logReferenceLinked(
  insightId: string,
  reference: InsightReference,
  tenantId: string,
  facilityId?: string
): void {
  const entry: InsightsLogEntry = {
    logId: `log-ref-link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    entryType: 'reference-linked',
    tenantId,
    facilityId,
    target_insight_id: insightId,
    action: `Reference linked: ${reference.referenceType} "${reference.title}" (Phase ${reference.sourcePhase})`,
    references_used: [reference],
    context: { reference_id: reference.referenceId, reference_type: reference.referenceType },
    result: 'success',
  };
  insightsLogStore.push(entry);
}

export function logPhase37Integration(
  insightId: string,
  insightTitle: string,
  tenantId: string,
  narrativeExplanation: string
): void {
  const entry: InsightsLogEntry = {
    logId: `log-p37-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    entryType: 'phase-37-integrated',
    tenantId,
    target_insight_id: insightId,
    action: `Phase 37 (Narrative Explanation) integrated for "${insightTitle}"`,
    references_used: [],
    context: { narrative_length: narrativeExplanation.length },
    result: 'success',
  };
  insightsLogStore.push(entry);
}

export function logPhase38Integration(
  insightId: string,
  insightTitle: string,
  tenantId: string,
  timelineEventCount: number
): void {
  const entry: InsightsLogEntry = {
    logId: `log-p38-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    entryType: 'phase-38-integrated',
    tenantId,
    target_insight_id: insightId,
    action: `Phase 38 (Timeline) integrated for "${insightTitle}" with ${timelineEventCount} events`,
    references_used: [],
    context: { timeline_event_count: timelineEventCount },
    result: 'success',
  };
  insightsLogStore.push(entry);
}

export function logPhase39Integration(
  insightId: string,
  insightTitle: string,
  tenantId: string,
  clusterCount: number
): void {
  const entry: InsightsLogEntry = {
    logId: `log-p39-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    entryType: 'phase-39-integrated',
    tenantId,
    target_insight_id: insightId,
    action: `Phase 39 (Analytics & Patterns) integrated for "${insightTitle}" with ${clusterCount} clusters`,
    references_used: [],
    context: { cluster_count: clusterCount },
    result: 'success',
  };
  insightsLogStore.push(entry);
}

export function logPhase40Integration(
  insightId: string,
  insightTitle: string,
  tenantId: string,
  trainingModuleCount: number
): void {
  const entry: InsightsLogEntry = {
    logId: `log-p40-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    entryType: 'phase-40-integrated',
    tenantId,
    target_insight_id: insightId,
    action: `Phase 40 (Training) integrated for "${insightTitle}" with ${trainingModuleCount} modules`,
    references_used: [],
    context: { training_module_count: trainingModuleCount },
    result: 'success',
  };
  insightsLogStore.push(entry);
}

export function logFederationRuleApplied(
  tenantId: string,
  facilityId: string | undefined,
  rule: string,
  allowed: boolean
): void {
  const entry: InsightsLogEntry = {
    logId: `log-fed-rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    entryType: 'federation-rule-applied',
    tenantId,
    facilityId,
    action: `Federation rule "${rule}": ${allowed ? 'ALLOWED' : 'DENIED'}`,
    references_used: [],
    context: { rule, allowed },
    result: allowed ? 'success' : 'failed',
  };
  insightsLogStore.push(entry);
}

export function logTenantIsolationEnforced(
  tenantId: string,
  attemptedTenant: string,
  allowed: boolean
): void {
  const entry: InsightsLogEntry = {
    logId: `log-tenant-iso-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    entryType: 'tenant-isolation-enforced',
    tenantId,
    action: `Tenant isolation check: ${attemptedTenant === tenantId ? 'AUTHORIZED' : 'DENIED'} (requested tenant: ${attemptedTenant})`,
    references_used: [],
    context: { requested_tenant: attemptedTenant, authorized: allowed },
    result: allowed ? 'success' : 'failed',
  };
  insightsLogStore.push(entry);
}

export function logExportGenerated(
  exportId: string,
  tenantId: string,
  facilityId: string | undefined,
  exportFormat: string,
  contentSize: number
): void {
  const entry: InsightsLogEntry = {
    logId: `log-export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    entryType: 'export-generated',
    tenantId,
    facilityId,
    action: `Export generated (${exportFormat}): ${contentSize} bytes`,
    references_used: [],
    context: { export_id: exportId, export_format: exportFormat, content_size: contentSize },
    result: 'success',
  };
  insightsLogStore.push(entry);
}

export function logInsightsError(
  tenantId: string,
  facilityId: string | undefined,
  operation: string,
  errorMessage: string,
  context?: Record<string, any>
): void {
  const entry: InsightsLogEntry = {
    logId: `log-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    entryType: 'error',
    tenantId,
    facilityId,
    action: `Error in operation: ${operation}`,
    error_message: errorMessage,
    references_used: [],
    context: context || {},
    result: 'failed',
  };
  insightsLogStore.push(entry);
}

// ==================== RETRIEVAL FUNCTIONS ====================

export function getInsightsLogByTenant(tenantId: string, limit: number = 100): InsightsLogEntry[] {
  return insightsLogStore
    .filter((entry) => entry.tenantId === tenantId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function getInsightsLogByType(
  entryType: InsightsLogEntryType,
  tenantId: string,
  limit: number = 100
): InsightsLogEntry[] {
  return insightsLogStore
    .filter((entry) => entry.tenantId === tenantId && entry.entryType === entryType)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function getInsightsLogByDateRange(
  tenantId: string,
  startDate: string,
  endDate: string,
  limit: number = 100
): InsightsLogEntry[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return insightsLogStore
    .filter((entry) => {
      if (entry.tenantId !== tenantId) return false;
      const timestamp = new Date(entry.timestamp).getTime();
      return timestamp >= start && timestamp <= end;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function getInsightsLogByFacility(
  tenantId: string,
  facilityId: string,
  limit: number = 100
): InsightsLogEntry[] {
  return insightsLogStore
    .filter((entry) => entry.tenantId === tenantId && entry.facilityId === facilityId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function getInsightsLogByInsightId(
  insightId: string,
  tenantId: string,
  limit: number = 50
): InsightsLogEntry[] {
  return insightsLogStore
    .filter((entry) => entry.tenantId === tenantId && entry.target_insight_id === insightId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function getInsightsLogByPackId(
  packId: string,
  tenantId: string,
  limit: number = 50
): InsightsLogEntry[] {
  return insightsLogStore
    .filter((entry) => entry.tenantId === tenantId && entry.target_pack_id === packId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function getInsightsLogErrors(
  tenantId: string,
  facilityId?: string,
  limit: number = 100
): InsightsLogEntry[] {
  let results = insightsLogStore.filter(
    (entry) => entry.tenantId === tenantId && entry.result === 'failed'
  );
  if (facilityId) {
    results = results.filter((entry) => entry.facilityId === facilityId);
  }
  return results
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function getAllInsightsLog(limit: number = 500): InsightsLogEntry[] {
  return insightsLogStore
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// Helper: Clear logs (for testing)
export function clearInsightsLog(): void {
  insightsLogStore.length = 0;
}

// Helper: Get log statistics
export function getInsightsLogStats(tenantId?: string): {
  total_entries: number;
  by_type: Record<InsightsLogEntryType, number>;
  error_count: number;
  recent_timestamp: string;
  oldest_timestamp: string;
} {
  const filtered = tenantId
    ? insightsLogStore.filter((entry) => entry.tenantId === tenantId)
    : insightsLogStore;

  const by_type: Record<InsightsLogEntryType, number> = {
    'query-initiated': 0,
    'query-completed': 0,
    'pack-generated': 0,
    'pack-accessed': 0,
    'insight-assembled': 0,
    'reference-linked': 0,
    'phase-37-integrated': 0,
    'phase-38-integrated': 0,
    'phase-39-integrated': 0,
    'phase-40-integrated': 0,
    'federation-rule-applied': 0,
    'tenant-isolation-enforced': 0,
    'export-generated': 0,
    'error': 0,
  };

  filtered.forEach((entry) => {
    by_type[entry.entryType]++;
  });

  const timestamps = filtered.map((e) => new Date(e.timestamp).getTime()).sort((a, b) => a - b);

  return {
    total_entries: filtered.length,
    by_type,
    error_count: filtered.filter((e) => e.result === 'failed').length,
    recent_timestamp: filtered.length > 0 ? filtered[0].timestamp : new Date().toISOString(),
    oldest_timestamp:
      filtered.length > 0
        ? filtered[filtered.length - 1].timestamp
        : new Date().toISOString(),
  };
}
