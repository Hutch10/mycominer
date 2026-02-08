/**
 * Phase 61: Archive Log
 * 
 * Audit trail for all archive operations.
 * Tracks creation, retrieval, retention actions, and policy decisions.
 * 
 * NO GENERATIVE AI • DETERMINISTIC ONLY • COMPLETE AUDIT TRAIL
 */

import {
  ArchiveLogEntry,
  ArchiveCreatedLogEntry,
  ArchiveRetrievedLogEntry,
  ArchiveRetentionActionLogEntry,
  ArchivePolicyDecisionLogEntry,
  ArchiveErrorLogEntry,
  ArchiveStatistics,
  ArchiveCategory,
  RetentionAction
} from './archiveTypes';

export class ArchiveLog {
  private entries: ArchiveLogEntry[] = [];

  /**
   * Log Archive Created
   * Record when new archive is created
   */
  logArchiveCreated(
    archiveId: string,
    category: ArchiveCategory,
    version: number,
    originalId: string,
    originalType: string,
    sizeBytes: number,
    retentionDays: number,
    expiresAt: string,
    tenantId: string,
    facilityId: string | undefined,
    createdBy: string
  ): void {
    const entry: ArchiveCreatedLogEntry = {
      entryType: 'archive-created',
      timestamp: new Date().toISOString(),
      tenantId,
      facilityId,
      archive: {
        archiveId,
        category,
        version,
        originalId,
        originalType,
        sizeBytes,
        retentionDays,
        expiresAt
      },
      createdBy
    };

    this.entries.push(entry);
  }

  /**
   * Log Archive Retrieved
   * Record when archive is accessed
   */
  logArchiveRetrieved(
    archiveId: string,
    category: ArchiveCategory,
    version: number,
    accessMethod: string,
    tenantId: string,
    retrievedBy: string
  ): void {
    const entry: ArchiveRetrievedLogEntry = {
      entryType: 'archive-retrieved',
      timestamp: new Date().toISOString(),
      tenantId,
      retrieval: {
        archiveId,
        category,
        version,
        accessMethod
      },
      retrievedBy
    };

    this.entries.push(entry);
  }

  /**
   * Log Retention Action
   * Record retention management actions (expiry, legal hold, restore, delete)
   */
  logRetentionAction(
    archiveId: string,
    category: ArchiveCategory,
    actionType: RetentionAction,
    reason: string,
    previousState: string | undefined,
    newState: string | undefined,
    tenantId: string,
    performedBy: string
  ): void {
    const entry: ArchiveRetentionActionLogEntry = {
      entryType: 'archive-retention-action',
      timestamp: new Date().toISOString(),
      tenantId,
      action: {
        archiveId,
        category,
        actionType,
        reason,
        previousState,
        newState
      },
      performedBy
    };

    this.entries.push(entry);
  }

  /**
   * Log Policy Decision
   * Record policy evaluation results
   */
  logPolicyDecision(
    queryId: string,
    queryType: string,
    scope: {
      tenantId?: string;
      facilityId?: string;
      federationId?: string;
    },
    allowed: boolean,
    reason: string,
    violations: string[],
    warnings: string[],
    userId: string
  ): void {
    const entry: ArchivePolicyDecisionLogEntry = {
      entryType: 'archive-policy-decision',
      timestamp: new Date().toISOString(),
      decision: {
        queryId,
        queryType,
        scope,
        allowed,
        reason,
        violations,
        warnings
      },
      userId
    };

    this.entries.push(entry);
  }

  /**
   * Log Error
   * Record archive operation errors
   */
  logError(
    queryId: string,
    errorCode: string,
    message: string,
    details: any,
    tenantId: string | undefined,
    userId: string
  ): void {
    const entry: ArchiveErrorLogEntry = {
      entryType: 'archive-error',
      timestamp: new Date().toISOString(),
      tenantId,
      error: {
        queryId,
        errorCode,
        message,
        details
      },
      userId
    };

    this.entries.push(entry);
  }

  /**
   * Get Entries
   * Retrieve log entries with filtering
   */
  getEntries(filters?: {
    entryType?: string;
    tenantId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): ArchiveLogEntry[] {
    let results = [...this.entries];

    // Filter by entry type
    if (filters?.entryType) {
      results = results.filter(e => e.entryType === filters.entryType);
    }

    // Filter by tenant
    if (filters?.tenantId) {
      results = results.filter(e => {
        if (e.entryType === 'archive-created') return e.tenantId === filters.tenantId;
        if (e.entryType === 'archive-retrieved') return e.tenantId === filters.tenantId;
        if (e.entryType === 'archive-retention-action') return e.tenantId === filters.tenantId;
        if (e.entryType === 'archive-policy-decision') return e.decision.scope.tenantId === filters.tenantId;
        if (e.entryType === 'archive-error') return e.tenantId === filters.tenantId;
        return false;
      });
    }

    // Filter by start date
    if (filters?.startDate) {
      const startTime = new Date(filters.startDate).getTime();
      results = results.filter(e => new Date(e.timestamp).getTime() >= startTime);
    }

    // Filter by end date
    if (filters?.endDate) {
      const endTime = new Date(filters.endDate).getTime();
      results = results.filter(e => new Date(e.timestamp).getTime() <= endTime);
    }

    // Apply limit
    if (filters?.limit) {
      results = results.slice(-filters.limit);
    }

    return results;
  }

  /**
   * Get Latest Entries
   * Retrieve most recent log entries
   */
  getLatestEntries(limit: number = 100): ArchiveLogEntry[] {
    return this.entries.slice(-limit);
  }

  /**
   * Get Statistics
   * Calculate aggregate statistics from log entries
   */
  getStatistics(archiveStats: ArchiveStatistics): {
    totalOperations: number;
    byOperationType: Record<string, number>;
    byTenant: Record<string, number>;
    recentActivity: {
      last24h: number;
      last7d: number;
      last30d: number;
    };
    policyDecisions: {
      allowed: number;
      denied: number;
      denialRate: string;
    };
    retentionActions: {
      expiries: number;
      legalHolds: number;
      restorations: number;
      deletions: number;
    };
  } {
    const now = new Date().getTime();
    const day24h = now - (24 * 60 * 60 * 1000);
    const day7d = now - (7 * 24 * 60 * 60 * 1000);
    const day30d = now - (30 * 24 * 60 * 60 * 1000);

    // Total operations
    const totalOperations = this.entries.length;

    // By operation type
    const byOperationType: Record<string, number> = {};
    this.entries.forEach(e => {
      byOperationType[e.entryType] = (byOperationType[e.entryType] || 0) + 1;
    });

    // By tenant
    const byTenant: Record<string, number> = {};
    this.entries.forEach(e => {
      let tenantId: string | undefined;
      if (e.entryType === 'archive-created') tenantId = e.tenantId;
      if (e.entryType === 'archive-retrieved') tenantId = e.tenantId;
      if (e.entryType === 'archive-retention-action') tenantId = e.tenantId;
      if (e.entryType === 'archive-policy-decision') tenantId = e.decision.scope.tenantId;
      if (e.entryType === 'archive-error') tenantId = e.tenantId;

      if (tenantId) {
        byTenant[tenantId] = (byTenant[tenantId] || 0) + 1;
      }
    });

    // Recent activity
    const recentActivity = {
      last24h: this.entries.filter(e => new Date(e.timestamp).getTime() >= day24h).length,
      last7d: this.entries.filter(e => new Date(e.timestamp).getTime() >= day7d).length,
      last30d: this.entries.filter(e => new Date(e.timestamp).getTime() >= day30d).length
    };

    // Policy decisions
    const policyEntries = this.entries.filter(
      e => e.entryType === 'archive-policy-decision'
    ) as ArchivePolicyDecisionLogEntry[];
    const allowed = policyEntries.filter(e => e.decision.allowed).length;
    const denied = policyEntries.filter(e => !e.decision.allowed).length;
    const denialRate = policyEntries.length > 0
      ? `${((denied / policyEntries.length) * 100).toFixed(1)}%`
      : 'N/A';

    // Retention actions
    const retentionEntries = this.entries.filter(
      e => e.entryType === 'archive-retention-action'
    ) as ArchiveRetentionActionLogEntry[];
    const retentionActions = {
      expiries: retentionEntries.filter(e => e.action.actionType === 'expiry').length,
      legalHolds: retentionEntries.filter(e => e.action.actionType === 'legal-hold').length,
      restorations: retentionEntries.filter(e => e.action.actionType === 'restored').length,
      deletions: retentionEntries.filter(e => e.action.actionType === 'deleted').length
    };

    return {
      totalOperations,
      byOperationType,
      byTenant,
      recentActivity,
      policyDecisions: {
        allowed,
        denied,
        denialRate
      },
      retentionActions
    };
  }

  /**
   * Export to JSON
   * Export log entries as JSON
   */
  exportToJSON(filters?: any): string {
    const entries = this.getEntries(filters);
    return JSON.stringify(entries, null, 2);
  }

  /**
   * Export to CSV
   * Export log entries as CSV
   */
  exportToCSV(filters?: any): string {
    const entries = this.getEntries(filters);
    const headers = ['Entry ID', 'Entry Type', 'Timestamp', 'Tenant ID', 'Details'];
    const rows = [headers.join(',')];

    entries.forEach((entry, index) => {
      let details = '';
      if (entry.entryType === 'archive-created') {
        details = `${entry.archive.category} - v${entry.archive.version} - ${entry.archive.sizeBytes} bytes`;
      } else if (entry.entryType === 'archive-retrieved') {
        details = `${entry.retrieval.category} - v${entry.retrieval.version} - ${entry.retrieval.accessMethod}`;
      } else if (entry.entryType === 'archive-retention-action') {
        details = `${entry.action.category} - ${entry.action.actionType} - ${entry.action.reason}`;
      } else if (entry.entryType === 'archive-policy-decision') {
        details = `${entry.decision.allowed ? 'Allowed' : 'Denied'} - ${entry.decision.reason}`;
      } else if (entry.entryType === 'archive-error') {
        details = `${entry.error.errorCode} - ${entry.error.message}`;
      }

      const tenantId = this.extractTenantId(entry);
      const row = [
        `entry-${index + 1}`,
        entry.entryType,
        entry.timestamp,
        tenantId || 'N/A',
        `"${details.replace(/"/g, '""')}"`
      ];
      rows.push(row.join(','));
    });

    return rows.join('\n');
  }

  /**
   * Clear Old Entries
   * Remove entries older than retention period
   */
  clearOldEntries(retentionDays: number = 90): number {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const originalCount = this.entries.length;
    this.entries = this.entries.filter(e => new Date(e.timestamp) >= cutoffDate);
    return originalCount - this.entries.length;
  }

  /**
   * Get Entry Count
   */
  getEntryCount(): number {
    return this.entries.length;
  }

  /**
   * Clear All Entries (for testing)
   */
  clearAllEntries(): void {
    this.entries = [];
  }

  /**
   * Extract Tenant ID from Entry
   */
  private extractTenantId(entry: ArchiveLogEntry): string | undefined {
    if (entry.entryType === 'archive-created') return entry.tenantId;
    if (entry.entryType === 'archive-retrieved') return entry.tenantId;
    if (entry.entryType === 'archive-retention-action') return entry.tenantId;
    if (entry.entryType === 'archive-policy-decision') return entry.decision.scope.tenantId;
    if (entry.entryType === 'archive-error') return entry.tenantId;
    return undefined;
  }
}
