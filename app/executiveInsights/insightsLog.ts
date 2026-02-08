/**
 * INSIGHTS LOG
 * Phase 58: Executive Insights
 * 
 * Store insights, trends, correlations, policy decisions.
 * 
 * NO GENERATIVE AI. Deterministic logging only.
 */

import {
  InsightLogEntry,
  InsightGeneratedLogEntry,
  TrendDetectedLogEntry,
  CorrelationDetectedLogEntry,
  InsightsPolicyDecisionLogEntry,
  InsightsErrorLogEntry,
  InsightStatistics,
  InsightCategory,
  InsightTimePeriod,
} from './insightsTypes';

// ============================================================================
// INSIGHTS LOG
// ============================================================================

export class InsightsLog {
  private entries: InsightLogEntry[] = [];
  private maxEntries = 10000;

  // ==========================================================================
  // LOG ENTRY METHODS
  // ==========================================================================

  /**
   * Log insight generated
   */
  logInsightGenerated(data: Omit<InsightGeneratedLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: InsightGeneratedLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'insight-generated',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  /**
   * Log trend detected
   */
  logTrendDetected(data: Omit<TrendDetectedLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: TrendDetectedLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'trend-detected',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  /**
   * Log correlation detected
   */
  logCorrelationDetected(data: Omit<CorrelationDetectedLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: CorrelationDetectedLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'correlation-detected',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  /**
   * Log policy decision
   */
  logPolicyDecision(data: Omit<InsightsPolicyDecisionLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: InsightsPolicyDecisionLogEntry = {
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
  logError(data: Omit<InsightsErrorLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: InsightsErrorLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'error',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  private addEntry(entry: InsightLogEntry): void {
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
  }): InsightLogEntry[] {
    let filtered = [...this.entries];

    if (filter?.entryType) {
      filtered = filtered.filter(e => e.entryType === filter.entryType);
    }

    if (filter?.tenantId) {
      filtered = filtered.filter(e => {
        if (e.entryType === 'insight-generated') {
          return e.result.query.scope.tenantId === filter.tenantId;
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
  getLatestEntries(limit: number = 100): InsightLogEntry[] {
    return this.entries.slice(-limit);
  }

  // ==========================================================================
  // STATISTICS METHODS
  // ==========================================================================

  /**
   * Get insight statistics
   */
  getStatistics(): InsightStatistics {
    const insightEntries = this.entries.filter(e => e.entryType === 'insight-generated') as InsightGeneratedLogEntry[];
    const trendEntries = this.entries.filter(e => e.entryType === 'trend-detected') as TrendDetectedLogEntry[];
    const correlationEntries = this.entries.filter(e => e.entryType === 'correlation-detected') as CorrelationDetectedLogEntry[];

    // Total counts
    const totalInsights = insightEntries.length;
    const totalTrends = trendEntries.length;
    const totalCorrelations = correlationEntries.length;

    // By category
    const byCategory: Record<InsightCategory, number> = {
      'cross-engine-operational': 0,
      'tenant-performance': 0,
      'facility-performance': 0,
      'sla-compliance': 0,
      'risk-drift': 0,
      'capacity-scheduling': 0,
      'operator-performance': 0,
      'governance-documentation': 0,
    };

    for (const entry of insightEntries) {
      for (const summary of entry.result.summaries) {
        byCategory[summary.category]++;
      }
    }

    // By tenant
    const byTenant: Record<string, number> = {};
    for (const entry of insightEntries) {
      const tenantId = entry.result.query.scope.tenantId || 'all';
      byTenant[tenantId] = (byTenant[tenantId] || 0) + 1;
    }

    // By time period
    const byTimePeriod: Record<InsightTimePeriod, number> = {
      '1h': 0,
      '6h': 0,
      '24h': 0,
      '7d': 0,
      '30d': 0,
      'custom': 0,
    };

    for (const entry of insightEntries) {
      const period = entry.result.query.timePeriod;
      byTimePeriod[period]++;
    }

    // Trend distribution
    const trendDistribution = {
      increasing: trendEntries.filter(e => e.trend.direction === 'increasing').length,
      decreasing: trendEntries.filter(e => e.trend.direction === 'decreasing').length,
      stable: trendEntries.filter(e => e.trend.direction === 'stable').length,
      volatile: trendEntries.filter(e => e.trend.direction === 'volatile').length,
    };

    // Correlation distribution
    const correlationDistribution = {
      weak: correlationEntries.filter(e => e.correlation.correlationStrength === 'weak').length,
      moderate: correlationEntries.filter(e => e.correlation.correlationStrength === 'moderate').length,
      strong: correlationEntries.filter(e => e.correlation.correlationStrength === 'strong').length,
    };

    // Risk distribution (from risk-drift summaries)
    const riskDistribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    for (const entry of insightEntries) {
      for (const summary of entry.result.summaries) {
        if (summary.category === 'risk-drift') {
          riskDistribution[summary.overallRiskLevel]++;
        }
      }
    }

    // Average computation time
    const avgComputationTimeMs = insightEntries.length > 0
      ? insightEntries.reduce((sum, e) => sum + e.result.metadata.computationTimeMs, 0) / insightEntries.length
      : 0;

    // Calculate trends (last 24 hours vs previous 24 hours)
    const now = Date.now();
    const last24h = insightEntries.filter(e => new Date(e.timestamp).getTime() > now - 86400000);
    const prev24h = insightEntries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time > now - 172800000 && time <= now - 86400000;
    });

    const insightsChange = prev24h.length > 0
      ? ((last24h.length - prev24h.length) / prev24h.length) * 100
      : 0;

    const last24hTrends = trendEntries.filter(e => new Date(e.timestamp).getTime() > now - 86400000);
    const prev24hTrends = trendEntries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time > now - 172800000 && time <= now - 86400000;
    });

    const trendsChange = prev24hTrends.length > 0
      ? ((last24hTrends.length - prev24hTrends.length) / prev24hTrends.length) * 100
      : 0;

    const last24hCorrelations = correlationEntries.filter(e => new Date(e.timestamp).getTime() > now - 86400000);
    const prev24hCorrelations = correlationEntries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time > now - 172800000 && time <= now - 86400000;
    });

    const correlationsChange = prev24hCorrelations.length > 0
      ? ((last24hCorrelations.length - prev24hCorrelations.length) / prev24hCorrelations.length) * 100
      : 0;

    return {
      totalInsights,
      totalTrends,
      totalCorrelations,
      byCategory,
      byTenant,
      byTimePeriod,
      trendDistribution,
      correlationDistribution,
      riskDistribution,
      averageComputationTimeMs: avgComputationTimeMs,
      trends: {
        insightsChange,
        trendsChange,
        correlationsChange,
      },
    };
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

  private extractTenantId(entry: InsightLogEntry): string {
    if (entry.entryType === 'insight-generated') {
      return entry.result.query.scope.tenantId || 'all';
    }
    if (entry.entryType === 'policy-decision' || entry.entryType === 'error') {
      return entry.scope.tenantId || 'all';
    }
    return '';
  }

  private extractDetails(entry: InsightLogEntry): string {
    if (entry.entryType === 'insight-generated') {
      return `${entry.summariesGenerated} summaries, ${entry.trendsGenerated} trends, ${entry.correlationsGenerated} correlations`;
    }
    if (entry.entryType === 'trend-detected') {
      return `${entry.trend.metricName} - ${entry.trend.direction} by ${entry.trend.changePercentage.toFixed(1)}%`;
    }
    if (entry.entryType === 'correlation-detected') {
      return `${entry.correlation.metric1.name} ↔ ${entry.correlation.metric2.name} - ${entry.correlation.correlationStrength}`;
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
  clearOldEntries(retentionDays: number = 90): number {
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
