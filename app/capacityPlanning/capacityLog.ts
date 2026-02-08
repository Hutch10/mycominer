/**
 * CAPACITY LOG
 * Phase 56: Capacity Planning & Resource Forecasting
 * 
 * Store capacity queries, projections, risk windows, policy decisions
 * with filtering and export.
 * 
 * NO GENERATIVE AI. NO PROBABILISTIC PREDICTION.
 */

import {
  CapacityLogEntry,
  QueryExecutedLogEntry,
  BaselineComputedLogEntry,
  ProjectionComputedLogEntry,
  RiskIdentifiedLogEntry,
  PolicyDecisionLogEntry,
  ErrorLogEntry,
  CapacityStatistics,
} from './capacityTypes';

// ============================================================================
// CAPACITY LOG
// ============================================================================

export class CapacityLog {
  private entries: CapacityLogEntry[] = [];
  private maxEntries = 10000;

  // ==========================================================================
  // LOG ENTRY METHODS
  // ==========================================================================

  /**
   * Log query executed
   */
  logQueryExecuted(data: Omit<QueryExecutedLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: QueryExecutedLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'query-executed',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  /**
   * Log baseline computed
   */
  logBaselineComputed(data: Omit<BaselineComputedLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: BaselineComputedLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'baseline-computed',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  /**
   * Log projection computed
   */
  logProjectionComputed(data: Omit<ProjectionComputedLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: ProjectionComputedLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'projection-computed',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  /**
   * Log risk identified
   */
  logRiskIdentified(data: Omit<RiskIdentifiedLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: RiskIdentifiedLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'risk-identified',
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

  private addEntry(entry: CapacityLogEntry): void {
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
  }): CapacityLogEntry[] {
    let filtered = [...this.entries];

    if (filter?.entryType) {
      filtered = filtered.filter(e => e.entryType === filter.entryType);
    }

    if (filter?.tenantId) {
      filtered = filtered.filter(e => {
        if (e.entryType === 'query-executed') {
          return e.query.scope.tenantId === filter.tenantId;
        }
        if (e.entryType === 'baseline-computed') {
          return e.baseline.scope.tenantId === filter.tenantId;
        }
        if (e.entryType === 'projection-computed') {
          return e.projection.scope.tenantId === filter.tenantId;
        }
        if (e.entryType === 'risk-identified') {
          return e.risk.scope.tenantId === filter.tenantId;
        }
        if (e.entryType === 'policy-decision' || e.entryType === 'error') {
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
  getLatestEntries(limit: number = 100): CapacityLogEntry[] {
    return this.entries.slice(-limit);
  }

  // ==========================================================================
  // STATISTICS METHODS
  // ==========================================================================

  /**
   * Get capacity planning statistics
   */
  getStatistics(): CapacityStatistics {
    const queryEntries = this.entries.filter(e => e.entryType === 'query-executed') as QueryExecutedLogEntry[];
    const baselineEntries = this.entries.filter(e => e.entryType === 'baseline-computed') as BaselineComputedLogEntry[];
    const projectionEntries = this.entries.filter(e => e.entryType === 'projection-computed') as ProjectionComputedLogEntry[];
    const riskEntries = this.entries.filter(e => e.entryType === 'risk-identified') as RiskIdentifiedLogEntry[];

    // By category
    const byCategory: Record<string, number> = {};
    for (const entry of projectionEntries) {
      byCategory[entry.projection.category] = (byCategory[entry.projection.category] || 0) + 1;
    }

    // By time window
    const byTimeWindow: Record<string, number> = {};
    for (const entry of projectionEntries) {
      byTimeWindow[entry.projection.timeWindow] = (byTimeWindow[entry.projection.timeWindow] || 0) + 1;
    }

    // By method
    const byMethod: Record<string, number> = {};
    for (const entry of projectionEntries) {
      byMethod[entry.projection.method] = (byMethod[entry.projection.method] || 0) + 1;
    }

    // By tenant
    const byTenant: Record<string, number> = {};
    for (const entry of queryEntries) {
      byTenant[entry.query.scope.tenantId] = (byTenant[entry.query.scope.tenantId] || 0) + 1;
    }

    // Risk distribution
    const riskDistribution = {
      critical: riskEntries.filter(e => e.risk.severity === 'critical').length,
      high: riskEntries.filter(e => e.risk.severity === 'high').length,
      medium: riskEntries.filter(e => e.risk.severity === 'medium').length,
      low: riskEntries.filter(e => e.risk.severity === 'low').length,
    };

    // Confidence levels
    const confidenceLevels = {
      high: projectionEntries.filter(e => e.projection.confidenceLevel === 'high').length,
      medium: projectionEntries.filter(e => e.projection.confidenceLevel === 'medium').length,
      low: projectionEntries.filter(e => e.projection.confidenceLevel === 'low').length,
    };

    // Calculate trends (last 24 hours vs previous 24 hours)
    const now = Date.now();
    const last24h = queryEntries.filter(e => new Date(e.timestamp).getTime() > now - 86400000);
    const prev24h = queryEntries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time > now - 172800000 && time <= now - 86400000;
    });

    const queriesChange = prev24h.length > 0
      ? ((last24h.length - prev24h.length) / prev24h.length) * 100
      : 0;

    const last24hProj = projectionEntries.filter(e => new Date(e.timestamp).getTime() > now - 86400000);
    const prev24hProj = projectionEntries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time > now - 172800000 && time <= now - 86400000;
    });

    const projectionsChange = prev24hProj.length > 0
      ? ((last24hProj.length - prev24hProj.length) / prev24hProj.length) * 100
      : 0;

    const last24hRisk = riskEntries.filter(e => new Date(e.timestamp).getTime() > now - 86400000);
    const prev24hRisk = riskEntries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time > now - 172800000 && time <= now - 86400000;
    });

    const risksChange = prev24hRisk.length > 0
      ? ((last24hRisk.length - prev24hRisk.length) / prev24hRisk.length) * 100
      : 0;

    return {
      totalQueries: queryEntries.length,
      totalBaselines: baselineEntries.length,
      totalProjections: projectionEntries.length,
      totalRisks: riskEntries.length,
      byCategory,
      byTimeWindow,
      byMethod,
      byTenant,
      riskDistribution,
      confidenceLevels,
      trends: {
        queriesChange,
        projectionsChange,
        risksChange,
      },
    };
  }

  /**
   * Get projection frequency by category
   */
  getProjectionFrequency(): Record<string, number> {
    const projectionEntries = this.entries.filter(e => e.entryType === 'projection-computed') as ProjectionComputedLogEntry[];
    const frequency: Record<string, number> = {};

    for (const entry of projectionEntries) {
      frequency[entry.projection.category] = (frequency[entry.projection.category] || 0) + 1;
    }

    return frequency;
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

  private extractTenantId(entry: CapacityLogEntry): string {
    if (entry.entryType === 'query-executed') {
      return entry.query.scope.tenantId;
    }
    if (entry.entryType === 'baseline-computed') {
      return entry.baseline.scope.tenantId;
    }
    if (entry.entryType === 'projection-computed') {
      return entry.projection.scope.tenantId;
    }
    if (entry.entryType === 'risk-identified') {
      return entry.risk.scope.tenantId;
    }
    if (entry.entryType === 'policy-decision' || entry.entryType === 'error') {
      return entry.scope.tenantId;
    }
    return '';
  }

  private extractDetails(entry: CapacityLogEntry): string {
    if (entry.entryType === 'query-executed') {
      return `${entry.projectionsComputed} projections, ${entry.risksIdentified} risks`;
    }
    if (entry.entryType === 'baseline-computed') {
      return `${entry.baseline.averageTasksPerHour.toFixed(1)} tasks/hr, ${entry.baseline.dataPoints} data points`;
    }
    if (entry.entryType === 'projection-computed') {
      return `${entry.projection.category} - ${entry.projection.projectedValue.toFixed(1)} ${entry.projection.unit}`;
    }
    if (entry.entryType === 'risk-identified') {
      return `${entry.risk.riskType} - ${entry.risk.severity} - ${entry.risk.description}`;
    }
    if (entry.entryType === 'policy-decision') {
      return `${entry.allowed ? 'Allowed' : 'Denied'} - ${entry.reason}`;
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
