/**
 * REAL-TIME LOG
 * Phase 55: Real-Time Performance Monitoring
 * 
 * Store real-time events, computed metrics, policy decisions with filtering and export.
 * Integrates with Phases 45-54 for comprehensive audit trail.
 * 
 * NO GENERATIVE AI. NO PREDICTIONS.
 */

import {
  RealTimeLogEntry,
  EventReceivedLogEntry,
  MetricComputedLogEntry,
  PolicyDecisionLogEntry,
  StreamStateUpdateLogEntry,
  ErrorLogEntry,
  RealTimeStatistics,
  RealTimeEvent,
  RealTimeMetric,
} from './realtimeTypes';

// ============================================================================
// REAL-TIME LOG
// ============================================================================

export class RealTimeLog {
  private entries: RealTimeLogEntry[] = [];
  private maxEntries = 10000;

  // ==========================================================================
  // LOG ENTRY METHODS
  // ==========================================================================

  /**
   * Log event received
   */
  logEventReceived(data: Omit<EventReceivedLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: EventReceivedLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'event-received',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  /**
   * Log metric computed
   */
  logMetricComputed(data: Omit<MetricComputedLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: MetricComputedLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'metric-computed',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  /**
   * Log policy decision
   */
  logPolicyDecision(data: Omit<PolicyDecisionLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: PolicyDecisionLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'policy-decision',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  /**
   * Log stream state update
   */
  logStreamStateUpdate(data: Omit<StreamStateUpdateLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: StreamStateUpdateLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'stream-state-update',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  /**
   * Log error
   */
  logError(data: Omit<ErrorLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: ErrorLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'error',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  private addEntry(entry: RealTimeLogEntry): void {
    this.entries.push(entry);

    // Maintain size limit
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  // ==========================================================================
  // QUERY METHODS
  // ==========================================================================

  /**
   * Get log entries with filters
   */
  getEntries(filter?: {
    entryType?: string;
    tenantId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): RealTimeLogEntry[] {
    let filtered = [...this.entries];

    if (filter?.entryType) {
      filtered = filtered.filter(e => e.entryType === filter.entryType);
    }

    if (filter?.tenantId) {
      filtered = filtered.filter(e => {
        if (e.entryType === 'event-received') {
          return e.event.scope.tenantId === filter.tenantId;
        }
        if (e.entryType === 'metric-computed') {
          return e.metric.scope.tenantId === filter.tenantId;
        }
        if (e.entryType === 'policy-decision' || e.entryType === 'stream-state-update' || e.entryType === 'error') {
          return e.scope.tenantId === filter.tenantId;
        }
        return false;
      });
    }

    if (filter?.startDate) {
      filtered = filtered.filter(e => e.timestamp >= filter.startDate!);
    }

    if (filter?.endDate) {
      filtered = filtered.filter(e => e.timestamp <= filter.endDate!);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  /**
   * Get latest entries
   */
  getLatestEntries(limit: number = 100): RealTimeLogEntry[] {
    return this.entries.slice(-limit);
  }

  // ==========================================================================
  // STATISTICS METHODS
  // ==========================================================================

  /**
   * Get real-time statistics
   */
  getStatistics(): RealTimeStatistics {
    const eventEntries = this.entries.filter(e => e.entryType === 'event-received') as EventReceivedLogEntry[];
    const metricEntries = this.entries.filter(e => e.entryType === 'metric-computed') as MetricComputedLogEntry[];
    const policyEntries = this.entries.filter(e => e.entryType === 'policy-decision') as PolicyDecisionLogEntry[];

    // By category
    const byCategory: Record<string, number> = {};
    for (const entry of eventEntries) {
      byCategory[entry.event.category] = (byCategory[entry.event.category] || 0) + 1;
    }

    // By severity
    const bySeverity: Record<string, number> = {};
    for (const entry of eventEntries) {
      bySeverity[entry.event.severity] = (bySeverity[entry.event.severity] || 0) + 1;
    }

    // By operator
    const byOperator: Record<string, number> = {};
    for (const entry of eventEntries) {
      if (entry.event.operatorId) {
        byOperator[entry.event.operatorId] = (byOperator[entry.event.operatorId] || 0) + 1;
      }
    }

    // By tenant
    const byTenant: Record<string, number> = {};
    for (const entry of eventEntries) {
      byTenant[entry.event.scope.tenantId] = (byTenant[entry.event.scope.tenantId] || 0) + 1;
    }

    // Calculate trends (last 5 minutes vs previous 5 minutes)
    const now = Date.now();
    const last5Min = eventEntries.filter(e => new Date(e.timestamp).getTime() > now - 300000);
    const prev5Min = eventEntries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time > now - 600000 && time <= now - 300000;
    });

    const eventsPerMinuteChange = prev5Min.length > 0
      ? ((last5Min.length - prev5Min.length) / prev5Min.length) * 100
      : 0;

    const last5MinMetrics = metricEntries.filter(e => new Date(e.timestamp).getTime() > now - 300000);
    const prev5MinMetrics = metricEntries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time > now - 600000 && time <= now - 300000;
    });

    const metricsPerMinuteChange = prev5MinMetrics.length > 0
      ? ((last5MinMetrics.length - prev5MinMetrics.length) / prev5MinMetrics.length) * 100
      : 0;

    // Calculate average event lag
    let totalLag = 0;
    let lagCount = 0;
    for (const entry of last5Min) {
      const eventTime = new Date(entry.event.timestamp).getTime();
      const logTime = new Date(entry.timestamp).getTime();
      totalLag += logTime - eventTime;
      lagCount++;
    }
    const averageEventLag = lagCount > 0 ? totalLag / lagCount : 0;

    return {
      totalEventsReceived: eventEntries.length,
      totalMetricsComputed: metricEntries.length,
      totalPolicyDecisions: policyEntries.length,
      byCategory,
      bySeverity,
      byOperator,
      byTenant,
      streamHealth: {
        averageEventLag,
        missedEventsTotal: 0, // Would be tracked by stream health monitoring
        uptime: 100, // Would be tracked by system health monitoring
      },
      trends: {
        eventsPerMinuteChange,
        metricsPerMinuteChange,
        slaAdherenceChange: 0, // Would be calculated from SLA metrics
      },
    };
  }

  /**
   * Get event frequency by category
   */
  getEventFrequency(): Record<string, number> {
    const eventEntries = this.entries.filter(e => e.entryType === 'event-received') as EventReceivedLogEntry[];
    const frequency: Record<string, number> = {};

    for (const entry of eventEntries) {
      frequency[entry.event.category] = (frequency[entry.event.category] || 0) + 1;
    }

    return frequency;
  }

  /**
   * Get most active operators
   */
  getMostActiveOperators(limit: number = 10): { operatorId: string; eventCount: number }[] {
    const eventEntries = this.entries.filter(e => e.entryType === 'event-received') as EventReceivedLogEntry[];
    const operatorCounts: Record<string, number> = {};

    for (const entry of eventEntries) {
      if (entry.event.operatorId) {
        operatorCounts[entry.event.operatorId] = (operatorCounts[entry.event.operatorId] || 0) + 1;
      }
    }

    return Object.entries(operatorCounts)
      .map(([operatorId, eventCount]) => ({ operatorId, eventCount }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, limit);
  }

  /**
   * Get errors
   */
  getErrors(filter?: {
    tenantId?: string;
    errorCode?: string;
    startDate?: string;
    endDate?: string;
  }): ErrorLogEntry[] {
    let errors = this.entries.filter(e => e.entryType === 'error') as ErrorLogEntry[];

    if (filter?.tenantId) {
      errors = errors.filter(e => e.scope.tenantId === filter.tenantId);
    }

    if (filter?.errorCode) {
      errors = errors.filter(e => e.errorCode === filter.errorCode);
    }

    if (filter?.startDate) {
      errors = errors.filter(e => e.timestamp >= filter.startDate!);
    }

    if (filter?.endDate) {
      errors = errors.filter(e => e.timestamp <= filter.endDate!);
    }

    return errors;
  }

  /**
   * Get error rate
   */
  getErrorRate(): number {
    const errors = this.entries.filter(e => e.entryType === 'error');
    return this.entries.length > 0 ? (errors.length / this.entries.length) * 100 : 0;
  }

  /**
   * Get policy decisions
   */
  getPolicyDecisions(filter?: {
    tenantId?: string;
    allowed?: boolean;
    startDate?: string;
    endDate?: string;
  }): PolicyDecisionLogEntry[] {
    let decisions = this.entries.filter(e => e.entryType === 'policy-decision') as PolicyDecisionLogEntry[];

    if (filter?.tenantId) {
      decisions = decisions.filter(e => e.scope.tenantId === filter.tenantId);
    }

    if (filter?.allowed !== undefined) {
      decisions = decisions.filter(e => e.allowed === filter.allowed);
    }

    if (filter?.startDate) {
      decisions = decisions.filter(e => e.timestamp >= filter.startDate!);
    }

    if (filter?.endDate) {
      decisions = decisions.filter(e => e.timestamp <= filter.endDate!);
    }

    return decisions;
  }

  /**
   * Get policy approval rate
   */
  getPolicyApprovalRate(): number {
    const decisions = this.entries.filter(e => e.entryType === 'policy-decision') as PolicyDecisionLogEntry[];
    const approved = decisions.filter(d => d.allowed);
    return decisions.length > 0 ? (approved.length / decisions.length) * 100 : 0;
  }

  // ==========================================================================
  // EXPORT METHODS
  // ==========================================================================

  /**
   * Export to JSON
   */
  exportToJSON(filter?: Parameters<typeof this.getEntries>[0]): string {
    const entries = filter ? this.getEntries(filter) : this.entries;
    return JSON.stringify(entries, null, 2);
  }

  /**
   * Export to CSV
   */
  exportToCSV(filter?: Parameters<typeof this.getEntries>[0]): string {
    const entries = filter ? this.getEntries(filter) : this.entries;
    
    if (entries.length === 0) return '';

    // CSV header
    const headers = ['Entry ID', 'Entry Type', 'Timestamp', 'Tenant ID', 'Details'];
    let csv = headers.join(',') + '\n';

    // CSV rows
    for (const entry of entries) {
      const row: string[] = [
        entry.entryId,
        entry.entryType,
        entry.timestamp,
        this.extractTenantId(entry),
        this.extractDetails(entry),
      ];
      csv += row.map(field => `"${field}"`).join(',') + '\n';
    }

    return csv;
  }

  private extractTenantId(entry: RealTimeLogEntry): string {
    if (entry.entryType === 'event-received') {
      return entry.event.scope.tenantId;
    }
    if (entry.entryType === 'metric-computed') {
      return entry.metric.scope.tenantId;
    }
    if (entry.entryType === 'policy-decision' || entry.entryType === 'stream-state-update' || entry.entryType === 'error') {
      return entry.scope.tenantId;
    }
    return '';
  }

  private extractDetails(entry: RealTimeLogEntry): string {
    if (entry.entryType === 'event-received') {
      return `${entry.event.category} - ${entry.event.eventType} - ${entry.event.severity}`;
    }
    if (entry.entryType === 'metric-computed') {
      return `${entry.metric.category} - ${entry.metric.name} - ${entry.metric.value} ${entry.metric.unit}`;
    }
    if (entry.entryType === 'policy-decision') {
      return `${entry.allowed ? 'Allowed' : 'Denied'} - ${entry.reason}`;
    }
    if (entry.entryType === 'stream-state-update') {
      return `${entry.eventsProcessed} events, ${entry.metricsComputed} metrics`;
    }
    if (entry.entryType === 'error') {
      return `${entry.errorCode} - ${entry.message}`;
    }
    return '';
  }

  // ==========================================================================
  // MAINTENANCE METHODS
  // ==========================================================================

  /**
   * Clear old entries
   */
  clearOldEntries(retentionDays: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffTimestamp = cutoffDate.toISOString();

    const originalLength = this.entries.length;
    this.entries = this.entries.filter(e => e.timestamp >= cutoffTimestamp);
    return originalLength - this.entries.length;
  }

  /**
   * Get total entry count
   */
  getEntryCount(): number {
    return this.entries.length;
  }

  /**
   * Clear all entries
   */
  clearAllEntries(): void {
    this.entries = [];
  }
}
