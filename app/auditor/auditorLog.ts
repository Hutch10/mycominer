/**
 * Phase 50: Autonomous System Auditor - Audit Log
 * 
 * Complete audit trail for all audit operations.
 * Integrates with Compliance, Governance History, Fabric, Documentation, Intelligence Hub, Simulation.
 */

import type {
  AuditQuery,
  AuditResult,
  AuditFinding,
  AuditRule,
  AuditLogEntry,
  AuditStatistics,
  AuditCategory,
  AuditSeverity,
} from './auditorTypes';

// ============================================================================
// AUDITOR LOG
// ============================================================================

export class AuditorLog {
  private tenantId: string;
  private entries: AuditLogEntry[] = [];
  private readonly maxEntries = 10000;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // ==========================================================================
  // LOGGING METHODS
  // ==========================================================================

  /**
   * Log query
   */
  public logQuery(query: AuditQuery): void {
    const entry: AuditLogEntry = {
      entryId: `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'query',
      timestamp: new Date().toISOString(),
      tenantId: query.scope.tenantId,
      facilityId: query.scope.facilityId,
      query: {
        queryId: query.queryId,
        queryType: query.queryType,
        queryText: query.queryText,
        scope: query.scope,
      },
      performedBy: query.performedBy,
      success: true,
    };

    this.addEntry(entry);
  }

  /**
   * Log rule evaluation
   */
  public logEvaluation(
    rule: AuditRule,
    passed: boolean,
    executionTime: number
  ): void {
    const entry: AuditLogEntry = {
      entryId: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'evaluation',
      timestamp: new Date().toISOString(),
      tenantId: this.tenantId,
      evaluation: {
        ruleId: rule.ruleId,
        ruleName: rule.ruleName,
        category: rule.category,
        passed,
        executionTime,
      },
      performedBy: 'system',
      executionTime,
      success: true,
    };

    this.addEntry(entry);
  }

  /**
   * Log finding
   */
  public logFinding(finding: AuditFinding): void {
    const entry: AuditLogEntry = {
      entryId: `finding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'finding',
      timestamp: new Date().toISOString(),
      tenantId: finding.scope.tenantId,
      facilityId: finding.scope.facilityId,
      finding: {
        findingId: finding.findingId,
        severity: finding.severity,
        category: finding.category,
        affectedEntitiesCount: finding.affectedEntities.length,
      },
      performedBy: 'system',
      success: true,
    };

    this.addEntry(entry);
  }

  /**
   * Log error
   */
  public logError(queryId: string, errorMessage: string, errorStack?: string): void {
    const entry: AuditLogEntry = {
      entryId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'error',
      timestamp: new Date().toISOString(),
      tenantId: this.tenantId,
      error: {
        message: errorMessage,
        stack: errorStack,
      },
      performedBy: 'system',
      success: false,
    };

    this.addEntry(entry);
  }

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  /**
   * Get all entries
   */
  public getAllEntries(): AuditLogEntry[] {
    return [...this.entries];
  }

  /**
   * Get entries by type
   */
  public getEntriesByType(entryType: AuditLogEntry['entryType']): AuditLogEntry[] {
    return this.entries.filter(e => e.entryType === entryType);
  }

  /**
   * Get entries in time range
   */
  public getEntriesInRange(startDate: string, endDate: string): AuditLogEntry[] {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return this.entries.filter(e => {
      const entryTime = new Date(e.timestamp).getTime();
      return entryTime >= start && entryTime <= end;
    });
  }

  /**
   * Get entries by performer
   */
  public getEntriesByPerformer(performedBy: string): AuditLogEntry[] {
    return this.entries.filter(e => e.performedBy === performedBy);
  }

  /**
   * Get recent entries
   */
  public getRecentEntries(count: number): AuditLogEntry[] {
    return this.entries.slice(-count);
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get audit statistics
   */
  public getStatistics(): AuditStatistics {
    const queryEntries = this.getEntriesByType('query');
    const findingEntries = this.getEntriesByType('finding');

    // Count findings by category
    const findingsByCategory: Record<AuditCategory, number> = {
      'workflow-sop-alignment': 0,
      'governance-correctness': 0,
      'governance-lineage': 0,
      'health-drift-validation': 0,
      'analytics-consistency': 0,
      'documentation-completeness': 0,
      'fabric-integrity': 0,
      'cross-engine-consistency': 0,
      'compliance-pack-validation': 0,
    };

    for (const entry of findingEntries) {
      if (entry.finding?.category) {
        findingsByCategory[entry.finding.category]++;
      }
    }

    // Count findings by severity
    const findingsBySeverity: Record<AuditSeverity, number> = {
      'critical': 0,
      'high': 0,
      'medium': 0,
      'low': 0,
      'info': 0,
    };

    for (const entry of findingEntries) {
      if (entry.finding?.severity) {
        findingsBySeverity[entry.finding.severity]++;
      }
    }

    // Get findings in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const findingsLast24Hours = this.getEntriesInRange(yesterday, new Date().toISOString())
      .filter(e => e.entryType === 'finding').length;

    const auditsLast24Hours = this.getEntriesInRange(yesterday, new Date().toISOString())
      .filter(e => e.entryType === 'query').length;

    // Calculate averages
    const averageFindingsPerAudit = queryEntries.length > 0
      ? Math.round(findingEntries.length / queryEntries.length)
      : 0;

    // Most common category and severity
    const mostCommonCategory = Object.entries(findingsByCategory)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as AuditCategory || 'workflow-sop-alignment';

    const mostCommonSeverity = Object.entries(findingsBySeverity)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as AuditSeverity || 'medium';

    // Count by engine (from evaluation entries)
    const evaluationEntries = this.getEntriesByType('evaluation');
    const findingsByEngine: Record<string, number> = {};

    for (const entry of findingEntries) {
      if (entry.finding) {
        const engine = this.getEngineFromCategory(entry.finding.category);
        findingsByEngine[engine] = (findingsByEngine[engine] || 0) + 1;
      }
    }

    return {
      totalAudits: queryEntries.length,
      totalFindings: findingEntries.length,
      findingsByCategory,
      findingsBySeverity,
      auditsLast24Hours,
      findingsLast24Hours,
      averageFindingsPerAudit,
      openFindings: findingEntries.length, // In production, filter by status
      acknowledgedFindings: 0,
      resolvedFindings: 0,
      falsePositiveFindings: 0,
      mostCommonCategory,
      mostCommonSeverity,
      findingsByEngine,
    };
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  /**
   * Export log to JSON
   */
  public exportLog(filters?: {
    entryType?: AuditLogEntry['entryType'];
    startDate?: string;
    endDate?: string;
    performedBy?: string;
  }): string {
    let entries = this.entries;

    // Apply filters
    if (filters?.entryType) {
      entries = entries.filter(e => e.entryType === filters.entryType);
    }

    if (filters?.startDate && filters?.endDate) {
      entries = this.getEntriesInRange(filters.startDate, filters.endDate);
    }

    if (filters?.performedBy) {
      entries = entries.filter(e => e.performedBy === filters.performedBy);
    }

    return JSON.stringify(entries, null, 2);
  }

  // ==========================================================================
  // MAINTENANCE
  // ==========================================================================

  /**
   * Add entry to log
   */
  private addEntry(entry: AuditLogEntry): void {
    this.entries.push(entry);

    // Keep only last N entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  /**
   * Clear old entries
   */
  public clearOldEntries(daysToKeep: number): number {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();
    const initialCount = this.entries.length;

    this.entries = this.entries.filter(e => e.timestamp >= cutoffDate);

    return initialCount - this.entries.length;
  }

  /**
   * Clear all entries
   */
  public clearAll(): void {
    this.entries = [];
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Get engine from category
   */
  private getEngineFromCategory(category: AuditCategory): string {
    const mapping: Record<AuditCategory, string> = {
      'workflow-sop-alignment': 'workflow',
      'governance-correctness': 'governance',
      'governance-lineage': 'governance-history',
      'health-drift-validation': 'health',
      'analytics-consistency': 'analytics',
      'documentation-completeness': 'documentation',
      'fabric-integrity': 'fabric',
      'cross-engine-consistency': 'intelligence-hub',
      'compliance-pack-validation': 'compliance',
    };

    return mapping[category] || 'unknown';
  }
}
