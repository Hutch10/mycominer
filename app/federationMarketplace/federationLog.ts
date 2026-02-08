/**
 * Phase 62: Federation Marketplace - Audit Log
 * 
 * Complete audit trail for all federation operations.
 * Integrates with compliance systems and provides full traceability.
 */

import type {
  FederationLogEntry,
  FederationQuery,
  FederationQueryResult,
  FederationContext,
  FederationPolicyDecision,
} from './federationTypes';

/**
 * Logs all federation operations for compliance and audit purposes
 */
export class FederationLog {
  private logs: FederationLogEntry[] = [];
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Log a query operation
   */
  logQuery(
    query: FederationQuery,
    result: FederationQueryResult,
    context: FederationContext
  ): void {
    const entry: FederationLogEntry = {
      logId: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      operationType: 'query',
      performerId: context.performerId,
      tenantId: context.tenantId,
      federationId: query.federationId,
      queryType: query.queryType,
      success: result.success,
      error: result.error?.message,
      metadata: {
        queryId: query.queryId,
        executionTimeMs: result.metadata.executionTimeMs,
        tenantsIncluded: result.metadata.tenantsIncluded,
        federationsIncluded: result.metadata.federationsIncluded,
        dataPointsAnalyzed: result.metadata.dataPointsAnalyzed,
        categories: query.categories,
        timeRange: query.timeRange,
      },
    };

    this.logs.push(entry);
    this.persistLog(entry);
  }

  /**
   * Log a benchmark generation operation
   */
  logBenchmark(
    tenantId: string,
    federationId: string,
    benchmarkCount: number,
    success: boolean,
    context: FederationContext,
    error?: string
  ): void {
    const entry: FederationLogEntry = {
      logId: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      operationType: 'benchmark',
      performerId: context.performerId,
      tenantId,
      federationId,
      success,
      error,
      metadata: {
        benchmarkCount,
        requestedBy: context.performerId,
        role: context.performerRole,
      },
    };

    this.logs.push(entry);
    this.persistLog(entry);
  }

  /**
   * Log an insight generation operation
   */
  logInsightGeneration(
    federationId: string,
    insightCount: number,
    categories: string[],
    success: boolean,
    context: FederationContext,
    error?: string
  ): void {
    const entry: FederationLogEntry = {
      logId: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      operationType: 'insight-generation',
      performerId: context.performerId,
      tenantId: context.tenantId,
      federationId,
      success,
      error,
      metadata: {
        insightCount,
        categories,
        requestedBy: context.performerId,
      },
    };

    this.logs.push(entry);
    this.persistLog(entry);
  }

  /**
   * Log a data sharing operation
   */
  logDataSharing(
    tenantId: string,
    federationId: string,
    categories: string[],
    recordCount: number,
    anonymized: boolean,
    success: boolean,
    context: FederationContext,
    error?: string
  ): void {
    const entry: FederationLogEntry = {
      logId: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      operationType: 'data-sharing',
      performerId: context.performerId,
      tenantId,
      federationId,
      success,
      error,
      metadata: {
        categories,
        recordCount,
        anonymized,
        performerRole: context.performerRole,
        timestamp: new Date().toISOString(),
      },
    };

    this.logs.push(entry);
    this.persistLog(entry);
  }

  /**
   * Log a policy evaluation
   */
  logPolicyEvaluation(
    decision: FederationPolicyDecision,
    context: FederationContext,
    operationDetails: Record<string, any>
  ): void {
    const entry: FederationLogEntry = {
      logId: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
      operationType: 'policy-evaluation',
      performerId: context.performerId,
      tenantId: context.tenantId,
      federationId: context.federationId,
      success: decision.allowed,
      error: decision.allowed ? undefined : decision.reason,
      metadata: {
        decision: decision.allowed ? 'ALLOWED' : 'DENIED',
        reason: decision.reason,
        requiredPermissions: decision.requiredPermissions,
        missingPermissions: decision.missingPermissions,
        policyViolations: decision.policyViolations,
        ...operationDetails,
      },
    };

    this.logs.push(entry);
    this.persistLog(entry);
  }

  /**
   * Get logs for a specific tenant
   */
  getLogsForTenant(
    tenantId: string,
    filters?: {
      operationType?: FederationLogEntry['operationType'];
      startDate?: Date;
      endDate?: Date;
      successOnly?: boolean;
    }
  ): FederationLogEntry[] {
    let filtered = this.logs.filter(log => log.tenantId === tenantId);

    if (filters) {
      if (filters.operationType) {
        filtered = filtered.filter(log => log.operationType === filters.operationType);
      }

      if (filters.startDate) {
        filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
      }

      if (filters.endDate) {
        filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
      }

      if (filters.successOnly !== undefined) {
        filtered = filtered.filter(log => log.success === filters.successOnly);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get logs for a specific federation
   */
  getLogsForFederation(
    federationId: string,
    filters?: {
      operationType?: FederationLogEntry['operationType'];
      startDate?: Date;
      endDate?: Date;
    }
  ): FederationLogEntry[] {
    let filtered = this.logs.filter(log => log.federationId === federationId);

    if (filters) {
      if (filters.operationType) {
        filtered = filtered.filter(log => log.operationType === filters.operationType);
      }

      if (filters.startDate) {
        filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
      }

      if (filters.endDate) {
        filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get logs for a specific performer
   */
  getLogsForPerformer(
    performerId: string,
    filters?: {
      operationType?: FederationLogEntry['operationType'];
      startDate?: Date;
      endDate?: Date;
    }
  ): FederationLogEntry[] {
    let filtered = this.logs.filter(log => log.performerId === performerId);

    if (filters) {
      if (filters.operationType) {
        filtered = filtered.filter(log => log.operationType === filters.operationType);
      }

      if (filters.startDate) {
        filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
      }

      if (filters.endDate) {
        filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get operation statistics
   */
  getStatistics(
    timeRange?: { start: Date; end: Date }
  ): {
    totalOperations: number;
    successRate: number;
    operationsByType: Record<string, number>;
    failuresByType: Record<string, number>;
    uniquePerformers: number;
    uniqueTenants: number;
    uniqueFederations: number;
  } {
    let filtered = this.logs;

    if (timeRange) {
      filtered = filtered.filter(
        log => log.timestamp >= timeRange.start && log.timestamp <= timeRange.end
      );
    }

    const successCount = filtered.filter(log => log.success).length;
    const operationsByType: Record<string, number> = {};
    const failuresByType: Record<string, number> = {};
    const performers = new Set<string>();
    const tenants = new Set<string>();
    const federations = new Set<string>();

    for (const log of filtered) {
      operationsByType[log.operationType] = (operationsByType[log.operationType] || 0) + 1;
      
      if (!log.success) {
        failuresByType[log.operationType] = (failuresByType[log.operationType] || 0) + 1;
      }

      performers.add(log.performerId);
      if (log.tenantId) tenants.add(log.tenantId);
      if (log.federationId) federations.add(log.federationId);
    }

    return {
      totalOperations: filtered.length,
      successRate: filtered.length > 0 ? (successCount / filtered.length) * 100 : 0,
      operationsByType,
      failuresByType,
      uniquePerformers: performers.size,
      uniqueTenants: tenants.size,
      uniqueFederations: federations.size,
    };
  }

  /**
   * Export logs to JSON for compliance reporting
   */
  exportToJSON(filters?: {
    startDate?: Date;
    endDate?: Date;
    tenantId?: string;
    federationId?: string;
  }): string {
    let filtered = this.logs;

    if (filters) {
      if (filters.startDate) {
        filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.tenantId) {
        filtered = filtered.filter(log => log.tenantId === filters.tenantId);
      }
      if (filters.federationId) {
        filtered = filtered.filter(log => log.federationId === filters.federationId);
      }
    }

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      exportedBy: this.tenantId,
      logCount: filtered.length,
      logs: filtered,
    }, null, 2);
  }

  /**
   * Clear old logs (retention policy)
   */
  clearOldLogs(retentionDays: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const beforeCount = this.logs.length;
    this.logs = this.logs.filter(log => log.timestamp >= cutoffDate);
    const removedCount = beforeCount - this.logs.length;

    console.log(`[FederationLog] Cleared ${removedCount} logs older than ${retentionDays} days`);
    return removedCount;
  }

  /**
   * Get recent activity summary
   */
  getRecentActivity(limit: number = 10): FederationLogEntry[] {
    return [...this.logs]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Persist log entry (in production, would write to database)
   */
  private persistLog(entry: FederationLogEntry): void {
    // In production: write to persistent storage
    // For now: in-memory only
    console.log(`[FederationLog] ${entry.operationType.toUpperCase()} - ${entry.success ? 'SUCCESS' : 'FAILURE'}`, {
      performer: entry.performerId,
      tenant: entry.tenantId,
      federation: entry.federationId,
      timestamp: entry.timestamp.toISOString(),
    });
  }

  /**
   * Integration with Phase 50 Auditor
   */
  async reportToAuditor(entry: FederationLogEntry): Promise<void> {
    // In production: send to Phase 50 Autonomous Auditor
    // Check for policy violations, unusual patterns, etc.
    if (!entry.success && entry.metadata?.policyViolations) {
      console.warn(`[FederationLog → Auditor] Policy violation detected:`, entry);
    }
  }

  /**
   * Integration with Phase 45 Governance History
   */
  async recordGovernanceChange(
    changeType: string,
    details: Record<string, any>,
    context: FederationContext
  ): Promise<void> {
    // In production: integrate with Governance History
    console.log(`[FederationLog → Governance] ${changeType}`, details);
  }
}
