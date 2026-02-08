/**
 * Phase 51: Continuous Integrity Monitor - Monitor Log
 * 
 * Complete monitoring trail for all cycles, checks, and alerts.
 */

import type {
  MonitorCheck,
  MonitorCycle,
  MonitorAlert,
  MonitorRule,
  MonitorLogEntry,
  MonitorStatistics,
  MonitorCategory,
  MonitorSeverity,
} from './monitorTypes';

// ============================================================================
// MONITOR LOG
// ============================================================================

export class MonitorLog {
  private tenantId: string;
  private entries: MonitorLogEntry[] = [];
  private readonly maxEntries = 10000;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // ==========================================================================
  // LOGGING METHODS
  // ==========================================================================

  /**
   * Log monitoring cycle
   */
  public logCycle(cycle: MonitorCycle): void {
    const entry: MonitorLogEntry = {
      entryId: `cycle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'cycle',
      timestamp: cycle.metadata.completedAt,
      tenantId: cycle.check.scope.tenantId,
      facilityId: cycle.check.scope.facilityId,
      cycle: {
        cycleId: cycle.cycleId,
        frequency: cycle.frequency,
        totalAlerts: cycle.totalAlerts,
        newAlerts: cycle.newAlerts,
      },
      performedBy: cycle.performedBy,
      executionTime: cycle.metadata.executionTime,
      success: true,
    };

    this.addEntry(entry);
  }

  /**
   * Log monitoring check
   */
  public logCheck(check: MonitorCheck): void {
    const entry: MonitorLogEntry = {
      entryId: `check-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'check',
      timestamp: check.triggeredAt,
      tenantId: check.scope.tenantId,
      facilityId: check.scope.facilityId,
      check: {
        checkId: check.checkId,
        checkType: check.checkType,
        scope: check.scope,
      },
      performedBy: check.triggeredBy,
      success: true,
    };

    this.addEntry(entry);
  }

  /**
   * Log alert
   */
  public logAlert(alert: MonitorAlert): void {
    const entry: MonitorLogEntry = {
      entryId: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'alert',
      timestamp: alert.detectedAt,
      tenantId: alert.scope.tenantId,
      facilityId: alert.scope.facilityId,
      alert: {
        alertId: alert.alertId,
        severity: alert.severity,
        category: alert.category,
        affectedEntitiesCount: alert.affectedEntities.length,
      },
      performedBy: 'system',
      success: true,
    };

    this.addEntry(entry);
  }

  /**
   * Log rule evaluation
   */
  public logEvaluation(
    rule: MonitorRule,
    passed: boolean,
    executionTime: number
  ): void {
    const entry: MonitorLogEntry = {
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
   * Log error
   */
  public logError(cycleId: string, errorMessage: string, errorStack?: string): void {
    const entry: MonitorLogEntry = {
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
  public getAllEntries(): MonitorLogEntry[] {
    return [...this.entries];
  }

  /**
   * Get entries by type
   */
  public getEntriesByType(entryType: MonitorLogEntry['entryType']): MonitorLogEntry[] {
    return this.entries.filter(e => e.entryType === entryType);
  }

  /**
   * Get entries in time range
   */
  public getEntriesInRange(startDate: string, endDate: string): MonitorLogEntry[] {
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
  public getEntriesByPerformer(performedBy: string): MonitorLogEntry[] {
    return this.entries.filter(e => e.performedBy === performedBy);
  }

  /**
   * Get recent entries
   */
  public getRecentEntries(count: number): MonitorLogEntry[] {
    return this.entries.slice(-count);
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get monitoring statistics
   */
  public getStatistics(): MonitorStatistics {
    const cycleEntries = this.getEntriesByType('cycle');
    const alertEntries = this.getEntriesByType('alert');

    // Count alerts by category
    const alertsByCategory: Record<MonitorCategory, number> = {
      'governance-drift': 0,
      'governance-lineage-breakage': 0,
      'workflow-sop-drift': 0,
      'documentation-completeness-drift': 0,
      'fabric-link-breakage': 0,
      'cross-engine-metadata-mismatch': 0,
      'health-drift': 0,
      'analytics-pattern-drift': 0,
      'compliance-pack-drift': 0,
    };

    for (const entry of alertEntries) {
      if (entry.alert?.category) {
        alertsByCategory[entry.alert.category]++;
      }
    }

    // Count alerts by severity
    const alertsBySeverity: Record<MonitorSeverity, number> = {
      'critical': 0,
      'high': 0,
      'medium': 0,
      'low': 0,
      'info': 0,
    };

    for (const entry of alertEntries) {
      if (entry.alert?.severity) {
        alertsBySeverity[entry.alert.severity]++;
      }
    }

    // Get alerts in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const alertsLast24Hours = this.getEntriesInRange(yesterday, new Date().toISOString())
      .filter(e => e.entryType === 'alert').length;

    const cyclesLast24Hours = this.getEntriesInRange(yesterday, new Date().toISOString())
      .filter(e => e.entryType === 'cycle').length;

    // Calculate averages
    const averageAlertsPerCycle = cycleEntries.length > 0
      ? Math.round(alertEntries.length / cycleEntries.length)
      : 0;

    // Most common category and severity
    const mostCommonCategory = Object.entries(alertsByCategory)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as MonitorCategory || 'governance-drift';

    const mostCommonSeverity = Object.entries(alertsBySeverity)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as MonitorSeverity || 'medium';

    // Count by engine (from alert entries)
    const alertsByEngine: Record<string, number> = {};

    for (const entry of alertEntries) {
      if (entry.alert) {
        const engine = this.getEngineFromCategory(entry.alert.category);
        alertsByEngine[engine] = (alertsByEngine[engine] || 0) + 1;
      }
    }

    return {
      totalCycles: cycleEntries.length,
      totalAlerts: alertEntries.length,
      alertsByCategory,
      alertsBySeverity,
      cyclesLast24Hours,
      alertsLast24Hours,
      averageAlertsPerCycle,
      newAlerts: alertEntries.length, // In production, filter by status
      acknowledgedAlerts: 0,
      resolvedAlerts: 0,
      falsePositiveAlerts: 0,
      suppressedAlerts: 0,
      mostCommonCategory,
      mostCommonSeverity,
      alertsByEngine,
    };
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  /**
   * Export log to JSON
   */
  public exportLog(filters?: {
    entryType?: MonitorLogEntry['entryType'];
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
  private addEntry(entry: MonitorLogEntry): void {
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
  private getEngineFromCategory(category: MonitorCategory): string {
    const mapping: Record<MonitorCategory, string> = {
      'governance-drift': 'governance',
      'governance-lineage-breakage': 'governance-history',
      'workflow-sop-drift': 'workflow',
      'documentation-completeness-drift': 'documentation',
      'fabric-link-breakage': 'fabric',
      'cross-engine-metadata-mismatch': 'intelligence-hub',
      'health-drift': 'health',
      'analytics-pattern-drift': 'analytics',
      'compliance-pack-drift': 'compliance',
    };

    return mapping[category] || 'unknown';
  }
}
