/**
 * Phase 52: Unified Alerting & Notification Center — Alert Log
 * 
 * Stores alerts, groups, routing events, policy decisions.
 * Supports filtering, export, and cross-engine integration.
 */

import type {
  Alert,
  AlertGroup,
  AlertLogEntry,
  AlertStatistics,
  AlertCategory,
  AlertSeverity,
  AlertSource,
} from './alertTypes';

// ============================================================================
// ALERT LOG
// ============================================================================

export class AlertLog {
  private logEntries: AlertLogEntry[] = [];

  // ==========================================================================
  // LOGGING METHODS
  // ==========================================================================

  /**
   * Log an alert.
   */
  logAlert(alert: Alert, performer: string): void {
    const entry: AlertLogEntry = {
      entryId: `log-alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'alert',
      timestamp: new Date().toISOString(),
      tenantId: alert.scope.tenantId,
      facilityId: alert.scope.facilityId,
      performedBy: performer,
      success: true,
      details: {
        alert,
      },
    };

    this.logEntries.push(entry);
  }

  /**
   * Log an alert query.
   */
  logQuery(
    query: any,
    resultId: string,
    totalAlerts: number,
    performer: string,
    success: boolean
  ): void {
    const entry: AlertLogEntry = {
      entryId: `log-query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'query',
      timestamp: new Date().toISOString(),
      tenantId: query.scope.tenantId,
      facilityId: query.scope.facilityId,
      performedBy: performer,
      success,
      details: {
        query,
        resultId,
        totalAlerts,
      },
    };

    this.logEntries.push(entry);
  }

  /**
   * Log an alert group.
   */
  logGroup(group: AlertGroup, performer: string): void {
    const entry: AlertLogEntry = {
      entryId: `log-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'group',
      timestamp: new Date().toISOString(),
      tenantId: group.alerts[0]?.scope.tenantId || 'unknown',
      facilityId: group.alerts[0]?.scope.facilityId,
      performedBy: performer,
      success: true,
      details: {
        group,
      },
    };

    this.logEntries.push(entry);
  }

  /**
   * Log a routing event.
   */
  logRouting(
    sourceEngine: AlertSource,
    alertsRouted: number,
    alertsFiltered: number,
    tenantId: string,
    performer: string
  ): void {
    const entry: AlertLogEntry = {
      entryId: `log-routing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'routing',
      timestamp: new Date().toISOString(),
      tenantId,
      performedBy: performer,
      success: true,
      details: {
        sourceEngine,
        alertsRouted,
        alertsFiltered,
      },
    };

    this.logEntries.push(entry);
  }

  /**
   * Log an error.
   */
  logError(operation: string, error: Error, tenantId: string, performer: string): void {
    const entry: AlertLogEntry = {
      entryId: `log-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'error',
      timestamp: new Date().toISOString(),
      tenantId,
      performedBy: performer,
      success: false,
      details: {
        operation,
        error: error.message,
      },
    };

    this.logEntries.push(entry);
  }

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  /**
   * Get all log entries.
   */
  getAllEntries(): AlertLogEntry[] {
    return this.logEntries;
  }

  /**
   * Get entries by type.
   */
  getEntriesByType(entryType: string): AlertLogEntry[] {
    return this.logEntries.filter(entry => entry.entryType === entryType);
  }

  /**
   * Get entries in date range.
   */
  getEntriesInRange(startDate: string, endDate: string): AlertLogEntry[] {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return this.logEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= start && entryDate <= end;
    });
  }

  /**
   * Get entries by performer.
   */
  getEntriesByPerformer(performer: string): AlertLogEntry[] {
    return this.logEntries.filter(entry => entry.performedBy === performer);
  }

  /**
   * Get entries by tenant.
   */
  getEntriesByTenant(tenantId: string): AlertLogEntry[] {
    return this.logEntries.filter(entry => entry.tenantId === tenantId);
  }

  /**
   * Get recent entries.
   */
  getRecentEntries(count: number): AlertLogEntry[] {
    return this.logEntries.slice(-count);
  }

  /**
   * Get all alerts from log.
   */
  getAllAlerts(): Alert[] {
    return this.logEntries
      .filter(entry => entry.entryType === 'alert')
      .map(entry => (entry as any).details.alert);
  }

  /**
   * Get alerts by category.
   */
  getAlertsByCategory(category: AlertCategory): Alert[] {
    return this.getAllAlerts().filter(alert => alert.category === category);
  }

  /**
   * Get alerts by severity.
   */
  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return this.getAllAlerts().filter(alert => alert.severity === severity);
  }

  /**
   * Get alerts by source.
   */
  getAlertsBySource(source: AlertSource): Alert[] {
    return this.getAllAlerts().filter(alert => alert.source === source);
  }

  /**
   * Get alerts by status.
   */
  getAlertsByStatus(status: string): Alert[] {
    return this.getAllAlerts().filter(alert => alert.status === status);
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get comprehensive statistics.
   */
  getStatistics(): AlertStatistics {
    const allAlerts = this.getAllAlerts();
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const alertsLast24Hours = allAlerts.filter(
      alert => new Date(alert.detectedAt) >= twentyFourHoursAgo
    ).length;

    const allGroups = this.logEntries.filter(entry => entry.entryType === 'group');
    const allQueries = this.logEntries.filter(entry => entry.entryType === 'query');
    const queriesLast24Hours = allQueries.filter(
      entry => new Date(entry.timestamp) >= twentyFourHoursAgo
    ).length;

    // Count by category
    const alertsByCategory: Record<AlertCategory, number> = {} as any;
    for (const alert of allAlerts) {
      alertsByCategory[alert.category] = (alertsByCategory[alert.category] || 0) + 1;
    }

    // Count by severity
    const alertsBySeverity: Record<AlertSeverity, number> = {} as any;
    for (const alert of allAlerts) {
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
    }

    // Count by source
    const alertsBySource: Record<AlertSource, number> = {} as any;
    for (const alert of allAlerts) {
      alertsBySource[alert.source] = (alertsBySource[alert.source] || 0) + 1;
    }

    // Count by status
    const alertsByStatus: Record<string, number> = {};
    for (const alert of allAlerts) {
      alertsByStatus[alert.status] = (alertsByStatus[alert.status] || 0) + 1;
    }

    // Find most common
    const mostCommonCategory = this.findMostCommon(alertsByCategory) as AlertCategory;
    const mostCommonSeverity = this.findMostCommon(alertsBySeverity) as AlertSeverity;
    const mostCommonSource = this.findMostCommon(alertsBySource) as AlertSource;

    return {
      totalAlerts: allAlerts.length,
      totalGroups: allGroups.length,
      totalQueries: allQueries.length,
      alertsLast24Hours,
      queriesLast24Hours,
      alertsByCategory,
      alertsBySeverity,
      alertsBySource,
      alertsByStatus,
      mostCommonCategory,
      mostCommonSeverity,
      mostCommonSource,
    };
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  /**
   * Export log entries with filters.
   */
  exportLog(filters?: {
    startDate?: string;
    endDate?: string;
    entryTypes?: string[];
    performer?: string;
    tenantId?: string;
    successOnly?: boolean;
  }): {
    entries: AlertLogEntry[];
    metadata: {
      exportedAt: string;
      totalEntries: number;
      filters: any;
    };
  } {
    let entries = this.logEntries;

    if (filters) {
      if (filters.startDate && filters.endDate) {
        entries = this.getEntriesInRange(filters.startDate, filters.endDate);
      }

      if (filters.entryTypes && filters.entryTypes.length > 0) {
        entries = entries.filter(entry => filters.entryTypes!.includes(entry.entryType));
      }

      if (filters.performer) {
        entries = entries.filter(entry => entry.performedBy === filters.performer);
      }

      if (filters.tenantId) {
        entries = entries.filter(entry => entry.tenantId === filters.tenantId);
      }

      if (filters.successOnly) {
        entries = entries.filter(entry => entry.success);
      }
    }

    return {
      entries,
      metadata: {
        exportedAt: new Date().toISOString(),
        totalEntries: entries.length,
        filters: filters || {},
      },
    };
  }

  // ==========================================================================
  // MAINTENANCE
  // ==========================================================================

  /**
   * Clear old entries (keep last N days).
   */
  clearOldEntries(daysToKeep: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const originalLength = this.logEntries.length;
    this.logEntries = this.logEntries.filter(
      entry => new Date(entry.timestamp) >= cutoffDate
    );

    return originalLength - this.logEntries.length;
  }

  /**
   * Clear all entries.
   */
  clearAll(): void {
    this.logEntries = [];
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Find most common key in a record.
   */
  private findMostCommon<T extends string>(record: Record<T, number>): T | undefined {
    let maxCount = 0;
    let mostCommon: T | undefined;

    for (const [key, count] of Object.entries(record)) {
      const countNum = count as number;
      if (countNum > maxCount) {
        maxCount = countNum;
        mostCommon = key as T;
      }
    }

    return mostCommon;
  }
}
