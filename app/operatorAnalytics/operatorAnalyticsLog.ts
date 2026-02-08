/**
 * OPERATOR ANALYTICS LOG
 * Phase 54: Operator Performance & Workflow Analytics Center
 * 
 * Stores analytics queries, computed metrics, and policy decisions.
 * Complete audit trail for compliance and debugging.
 */

import {
  OperatorAnalyticsLogEntry,
  QueryLogEntry,
  MetricLogEntry,
  SnapshotLogEntry,
  WorkloadProfileLogEntry,
  PolicyDecisionLogEntry,
  ErrorLogEntry,
  OperatorAnalyticsStatistics,
  OperatorMetricCategory,
} from './operatorAnalyticsTypes';

// ============================================================================
// OPERATOR ANALYTICS LOG
// ============================================================================

export class OperatorAnalyticsLog {
  private entries: OperatorAnalyticsLogEntry[] = [];
  private maxEntries: number = 10000;

  // ==========================================================================
  // LOG OPERATIONS
  // ==========================================================================

  logQuery(entry: Omit<QueryLogEntry, 'entryId' | 'timestamp' | 'entryType'>): string {
    const logEntry: QueryLogEntry = {
      ...entry,
      entryId: `log-query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'query',
      timestamp: new Date().toISOString(),
    };

    this.addEntry(logEntry);
    return logEntry.entryId;
  }

  logMetric(entry: Omit<MetricLogEntry, 'entryId' | 'timestamp' | 'entryType'>): string {
    const logEntry: MetricLogEntry = {
      ...entry,
      entryId: `log-metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'metric',
      timestamp: new Date().toISOString(),
    };

    this.addEntry(logEntry);
    return logEntry.entryId;
  }

  logSnapshot(entry: Omit<SnapshotLogEntry, 'entryId' | 'timestamp' | 'entryType'>): string {
    const logEntry: SnapshotLogEntry = {
      ...entry,
      entryId: `log-snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'snapshot',
      timestamp: new Date().toISOString(),
    };

    this.addEntry(logEntry);
    return logEntry.entryId;
  }

  logWorkloadProfile(entry: Omit<WorkloadProfileLogEntry, 'entryId' | 'timestamp' | 'entryType'>): string {
    const logEntry: WorkloadProfileLogEntry = {
      ...entry,
      entryId: `log-workload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'workload-profile',
      timestamp: new Date().toISOString(),
    };

    this.addEntry(logEntry);
    return logEntry.entryId;
  }

  logPolicyDecision(entry: Omit<PolicyDecisionLogEntry, 'entryId' | 'timestamp' | 'entryType'>): string {
    const logEntry: PolicyDecisionLogEntry = {
      ...entry,
      entryId: `log-policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'policy-decision',
      timestamp: new Date().toISOString(),
    };

    this.addEntry(logEntry);
    return logEntry.entryId;
  }

  logError(entry: Omit<ErrorLogEntry, 'entryId' | 'timestamp' | 'entryType'>): string {
    const logEntry: ErrorLogEntry = {
      ...entry,
      entryId: `log-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'error',
      timestamp: new Date().toISOString(),
    };

    this.addEntry(logEntry);
    return logEntry.entryId;
  }

  private addEntry(entry: OperatorAnalyticsLogEntry): void {
    this.entries.push(entry);

    // Enforce max entries limit
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  // ==========================================================================
  // RETRIEVAL
  // ==========================================================================

  getEntries(filter?: {
    entryType?: OperatorAnalyticsLogEntry['entryType'];
    tenantId?: string;
    operatorId?: string;
    category?: OperatorMetricCategory;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): OperatorAnalyticsLogEntry[] {
    let filtered = [...this.entries];

    if (filter) {
      if (filter.entryType) {
        filtered = filtered.filter(e => e.entryType === filter.entryType);
      }

      if (filter.tenantId) {
        filtered = filtered.filter(e => e.scope.tenantId === filter.tenantId);
      }

      if (filter.operatorId) {
        filtered = filtered.filter(e => {
          if (e.entryType === 'snapshot') {
            return (e as SnapshotLogEntry).operatorId === filter.operatorId;
          }
          return false;
        });
      }

      if (filter.category) {
        filtered = filtered.filter(e => {
          if (e.entryType === 'metric') {
            return (e as MetricLogEntry).category === filter.category;
          }
          if (e.entryType === 'query') {
            return filter.category ? (e as QueryLogEntry).categories.includes(filter.category) : false;
          }
          return false;
        });
      }

      if (filter.startDate) {
        const start = new Date(filter.startDate).getTime();
        filtered = filtered.filter(e => new Date(e.timestamp).getTime() >= start);
      }

      if (filter.endDate) {
        const end = new Date(filter.endDate).getTime();
        filtered = filtered.filter(e => new Date(e.timestamp).getTime() <= end);
      }

      if (filter.limit && filter.limit > 0) {
        filtered = filtered.slice(-filter.limit);
      }
    }

    return filtered;
  }

  getEntryById(entryId: string): OperatorAnalyticsLogEntry | undefined {
    return this.entries.find(e => e.entryId === entryId);
  }

  getLatestEntries(count: number = 100): OperatorAnalyticsLogEntry[] {
    return this.entries.slice(-count);
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  getStatistics(): OperatorAnalyticsStatistics {
    const totalQueries = this.entries.filter(e => e.entryType === 'query').length;
    const totalMetrics = this.entries.filter(e => e.entryType === 'metric').length;
    const totalSnapshots = this.entries.filter(e => e.entryType === 'snapshot').length;
    const totalWorkloadProfiles = this.entries.filter(e => e.entryType === 'workload-profile').length;

    // By category
    const byCategory: Record<OperatorMetricCategory, number> = {
      'task-throughput': 0,
      'alert-response-time': 0,
      'audit-remediation-timeline': 0,
      'drift-remediation-timeline': 0,
      'governance-resolution-time': 0,
      'documentation-remediation': 0,
      'simulation-resolution': 0,
      'cross-engine-efficiency': 0,
      'sla-adherence': 0,
      'workload-distribution': 0,
    };

    for (const entry of this.entries) {
      if (entry.entryType === 'metric') {
        const metricEntry = entry as MetricLogEntry;
        byCategory[metricEntry.category]++;
      }
    }

    // By operator
    const byOperator: Record<string, number> = {};
    for (const entry of this.entries) {
      if (entry.entryType === 'snapshot') {
        const snapshotEntry = entry as SnapshotLogEntry;
        byOperator[snapshotEntry.operatorId] = (byOperator[snapshotEntry.operatorId] || 0) + 1;
      }
    }

    // By tenant
    const byTenant: Record<string, number> = {};
    for (const entry of this.entries) {
      const tenantId = entry.scope.tenantId;
      byTenant[tenantId] = (byTenant[tenantId] || 0) + 1;
    }

    // Trends (last 7 days vs previous 7 days)
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

    const recent = this.entries.filter(e => 
      new Date(e.timestamp).getTime() >= sevenDaysAgo
    );
    const previous = this.entries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time >= fourteenDaysAgo && time < sevenDaysAgo;
    });

    const trends = {
      queriesChange: this.calculateChange(
        previous.filter(e => e.entryType === 'query').length,
        recent.filter(e => e.entryType === 'query').length
      ),
      metricsChange: this.calculateChange(
        previous.filter(e => e.entryType === 'metric').length,
        recent.filter(e => e.entryType === 'metric').length
      ),
      snapshotsChange: this.calculateChange(
        previous.filter(e => e.entryType === 'snapshot').length,
        recent.filter(e => e.entryType === 'snapshot').length
      ),
    };

    return {
      totalQueries,
      totalMetrics,
      totalSnapshots,
      totalWorkloadProfiles,
      byCategory,
      byOperator,
      byTenant,
      trends,
    };
  }

  private calculateChange(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  // ==========================================================================
  // QUERY ANALYTICS
  // ==========================================================================

  getQueryFrequency(category: OperatorMetricCategory): number {
    const queries = this.entries.filter(e => {
      if (e.entryType !== 'query') return false;
      const queryEntry = e as QueryLogEntry;
      return queryEntry.categories.includes(category);
    });

    return queries.length;
  }

  getMostQueriedCategories(limit: number = 5): {
    category: OperatorMetricCategory;
    count: number;
  }[] {
    const categoryCounts: Record<string, number> = {};

    for (const entry of this.entries) {
      if (entry.entryType === 'query') {
        const queryEntry = entry as QueryLogEntry;
        for (const category of queryEntry.categories) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      }
    }

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category: category as OperatorMetricCategory,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getMostActiveOperators(limit: number = 10): {
    operatorId: string;
    operatorName: string;
    snapshotCount: number;
  }[] {
    const operatorCounts: Record<string, { name: string; count: number }> = {};

    for (const entry of this.entries) {
      if (entry.entryType === 'snapshot') {
        const snapshotEntry = entry as SnapshotLogEntry;
        if (!operatorCounts[snapshotEntry.operatorId]) {
          operatorCounts[snapshotEntry.operatorId] = {
            name: snapshotEntry.operatorName,
            count: 0,
          };
        }
        operatorCounts[snapshotEntry.operatorId].count++;
      }
    }

    return Object.entries(operatorCounts)
      .map(([operatorId, data]) => ({
        operatorId,
        operatorName: data.name,
        snapshotCount: data.count,
      }))
      .sort((a, b) => b.snapshotCount - a.snapshotCount)
      .slice(0, limit);
  }

  // ==========================================================================
  // ERROR ANALYTICS
  // ==========================================================================

  getErrors(filter?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): ErrorLogEntry[] {
    let errors = this.entries.filter(e => e.entryType === 'error') as ErrorLogEntry[];

    if (filter) {
      if (filter.startDate) {
        const start = new Date(filter.startDate).getTime();
        errors = errors.filter(e => new Date(e.timestamp).getTime() >= start);
      }

      if (filter.endDate) {
        const end = new Date(filter.endDate).getTime();
        errors = errors.filter(e => new Date(e.timestamp).getTime() <= end);
      }

      if (filter.limit && filter.limit > 0) {
        errors = errors.slice(-filter.limit);
      }
    }

    return errors;
  }

  getErrorRate(): number {
    const total = this.entries.length;
    const errors = this.entries.filter(e => e.entryType === 'error').length;
    
    return total > 0 ? (errors / total) * 100 : 0;
  }

  // ==========================================================================
  // POLICY ANALYTICS
  // ==========================================================================

  getPolicyDecisions(filter?: {
    allowed?: boolean;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): PolicyDecisionLogEntry[] {
    let decisions = this.entries.filter(e => e.entryType === 'policy-decision') as PolicyDecisionLogEntry[];

    if (filter) {
      if (filter.allowed !== undefined) {
        decisions = decisions.filter(d => d.allowed === filter.allowed);
      }

      if (filter.startDate) {
        const start = new Date(filter.startDate).getTime();
        decisions = decisions.filter(d => new Date(d.timestamp).getTime() >= start);
      }

      if (filter.endDate) {
        const end = new Date(filter.endDate).getTime();
        decisions = decisions.filter(d => new Date(d.timestamp).getTime() <= end);
      }

      if (filter.limit && filter.limit > 0) {
        decisions = decisions.slice(-filter.limit);
      }
    }

    return decisions;
  }

  getPolicyApprovalRate(): number {
    const decisions = this.entries.filter(e => e.entryType === 'policy-decision') as PolicyDecisionLogEntry[];
    const approved = decisions.filter(d => d.allowed).length;
    
    return decisions.length > 0 ? (approved / decisions.length) * 100 : 0;
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  exportToJSON(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  exportToCSV(): string {
    const headers = ['entryId', 'entryType', 'timestamp', 'tenantId', 'details'];
    const rows = this.entries.map(entry => {
      const details = this.getEntryDetails(entry);
      return [
        entry.entryId,
        entry.entryType,
        entry.timestamp,
        entry.scope.tenantId,
        JSON.stringify(details),
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  private getEntryDetails(entry: OperatorAnalyticsLogEntry): any {
    switch (entry.entryType) {
      case 'query':
        return { queryId: (entry as QueryLogEntry).queryId };
      case 'metric':
        return { metricId: (entry as MetricLogEntry).metricId, category: (entry as MetricLogEntry).category };
      case 'snapshot':
        return { snapshotId: (entry as SnapshotLogEntry).snapshotId, operatorId: (entry as SnapshotLogEntry).operatorId };
      case 'workload-profile':
        return { profileId: (entry as WorkloadProfileLogEntry).profileId };
      case 'policy-decision':
        return { allowed: (entry as PolicyDecisionLogEntry).allowed };
      case 'error':
        return { errorCode: (entry as ErrorLogEntry).errorCode, message: (entry as ErrorLogEntry).message };
      default:
        return {};
    }
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  clearOldEntries(daysToKeep: number = 30): number {
    const cutoffDate = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const initialCount = this.entries.length;

    this.entries = this.entries.filter(e => 
      new Date(e.timestamp).getTime() >= cutoffDate
    );

    return initialCount - this.entries.length;
  }

  clearAllEntries(): void {
    this.entries = [];
  }

  getEntryCount(): number {
    return this.entries.length;
  }
}
