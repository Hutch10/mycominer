/**
 * ORCHESTRATION LOG
 * Phase 57: Workload Orchestration & Scheduling Engine
 * 
 * Store schedules, conflicts, recommendations, policy decisions.
 * 
 * NO GENERATIVE AI. NO PREDICTIONS.
 */

import {
  OrchestrationLogEntry,
  ScheduleGeneratedLogEntry,
  ConflictDetectedLogEntry,
  RecommendationGeneratedLogEntry,
  OrchestrationPolicyDecisionLogEntry,
  OrchestrationErrorLogEntry,
  OrchestrationStatistics,
  OrchestrationSchedule,
  OrchestrationConflict,
  OrchestrationRecommendation,
} from './orchestrationTypes';

// ============================================================================
// ORCHESTRATION LOG
// ============================================================================

export class OrchestrationLog {
  private entries: OrchestrationLogEntry[] = [];
  private maxEntries = 10000;

  // ==========================================================================
  // LOG ENTRY METHODS
  // ==========================================================================

  /**
   * Log schedule generated
   */
  logScheduleGenerated(data: Omit<ScheduleGeneratedLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: ScheduleGeneratedLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'schedule-generated',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  /**
   * Log conflict detected
   */
  logConflictDetected(data: Omit<ConflictDetectedLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: ConflictDetectedLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'conflict-detected',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  /**
   * Log recommendation generated
   */
  logRecommendationGenerated(data: Omit<RecommendationGeneratedLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: RecommendationGeneratedLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'recommendation-generated',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  /**
   * Log policy decision
   */
  logPolicyDecision(data: Omit<OrchestrationPolicyDecisionLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: OrchestrationPolicyDecisionLogEntry = {
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
  logError(data: Omit<OrchestrationErrorLogEntry, 'entryId' | 'timestamp' | 'entryType'>): void {
    const entry: OrchestrationErrorLogEntry = {
      entryId: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'error',
      timestamp: new Date().toISOString(),
      ...data,
    };
    this.addEntry(entry);
  }

  private addEntry(entry: OrchestrationLogEntry): void {
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
  }): OrchestrationLogEntry[] {
    let filtered = [...this.entries];

    if (filter?.entryType) {
      filtered = filtered.filter(e => e.entryType === filter.entryType);
    }

    if (filter?.tenantId) {
      filtered = filtered.filter(e => {
        if (e.entryType === 'schedule-generated') {
          return e.schedule.scope.tenantId === filter.tenantId;
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
  getLatestEntries(limit: number = 100): OrchestrationLogEntry[] {
    return this.entries.slice(-limit);
  }

  // ==========================================================================
  // STATISTICS METHODS
  // ==========================================================================

  /**
   * Get orchestration statistics
   */
  getStatistics(): OrchestrationStatistics {
    const scheduleEntries = this.entries.filter(e => e.entryType === 'schedule-generated') as ScheduleGeneratedLogEntry[];
    const conflictEntries = this.entries.filter(e => e.entryType === 'conflict-detected') as ConflictDetectedLogEntry[];
    const recommendationEntries = this.entries.filter(e => e.entryType === 'recommendation-generated') as RecommendationGeneratedLogEntry[];

    // Total counts
    const totalSlots = scheduleEntries.reduce((sum, e) => sum + e.slotsGenerated, 0);

    // By category
    const byCategory: Record<string, number> = {};
    for (const entry of scheduleEntries) {
      for (const category in entry.schedule.categorySummary) {
        byCategory[category] = (byCategory[category] || 0) + entry.schedule.categorySummary[category as keyof typeof entry.schedule.categorySummary].totalSlots;
      }
    }

    // By priority
    const byPriority: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const entry of scheduleEntries) {
      for (const slot of entry.schedule.slots) {
        byPriority[slot.priority]++;
      }
    }

    // By operator
    const byOperator: Record<string, number> = {};
    for (const entry of scheduleEntries) {
      for (const slot of entry.schedule.slots) {
        byOperator[slot.operatorId] = (byOperator[slot.operatorId] || 0) + 1;
      }
    }

    // By tenant
    const byTenant: Record<string, number> = {};
    for (const entry of scheduleEntries) {
      byTenant[entry.schedule.scope.tenantId] = (byTenant[entry.schedule.scope.tenantId] || 0) + 1;
    }

    // Conflict distribution
    const conflictDistribution = {
      overCapacity: conflictEntries.filter(e => e.conflict.conflictType === 'over-capacity').length,
      slaCollision: conflictEntries.filter(e => e.conflict.conflictType === 'sla-collision').length,
      operatorOverload: conflictEntries.filter(e => e.conflict.conflictType === 'operator-overload').length,
      resourceUnavailable: conflictEntries.filter(e => e.conflict.conflictType === 'resource-unavailable').length,
      scheduleOverlap: conflictEntries.filter(e => e.conflict.conflictType === 'schedule-overlap').length,
    };

    // Capacity metrics
    const allSlots = scheduleEntries.flatMap(e => e.schedule.slots);
    const avgUtilization = allSlots.length > 0
      ? allSlots.reduce((sum, s) => sum + s.capacityUtilization, 0) / allSlots.length
      : 0;
    const peakUtilization = allSlots.length > 0
      ? Math.max(...allSlots.map(s => s.capacityUtilization))
      : 0;

    // SLA metrics
    const slaMetrics = {
      slotsWithinSLA: allSlots.filter(s => !s.slaDeadline || (s.slaBuffer && s.slaBuffer > 60)).length,
      slotsAtRisk: allSlots.filter(s => s.slaDeadline && s.slaBuffer && s.slaBuffer > 0 && s.slaBuffer <= 60).length,
      slotsBreached: allSlots.filter(s => s.slaDeadline && s.slaBuffer && s.slaBuffer < 0).length,
    };

    // Calculate trends (last 24 hours vs previous 24 hours)
    const now = Date.now();
    const last24h = scheduleEntries.filter(e => new Date(e.timestamp).getTime() > now - 86400000);
    const prev24h = scheduleEntries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time > now - 172800000 && time <= now - 86400000;
    });

    const schedulesChange = prev24h.length > 0
      ? ((last24h.length - prev24h.length) / prev24h.length) * 100
      : 0;

    const last24hConflicts = conflictEntries.filter(e => new Date(e.timestamp).getTime() > now - 86400000);
    const prev24hConflicts = conflictEntries.filter(e => {
      const time = new Date(e.timestamp).getTime();
      return time > now - 172800000 && time <= now - 86400000;
    });

    const conflictsChange = prev24hConflicts.length > 0
      ? ((last24hConflicts.length - prev24hConflicts.length) / prev24hConflicts.length) * 100
      : 0;

    return {
      totalSchedules: scheduleEntries.length,
      totalSlots,
      totalConflicts: conflictEntries.length,
      totalRecommendations: recommendationEntries.length,
      byCategory: byCategory as any,
      byPriority: byPriority as any,
      byOperator,
      byTenant,
      conflictDistribution,
      capacityMetrics: {
        averageUtilization: avgUtilization,
        peakUtilization,
        underutilizedOperators: 0, // Would need operator data
        overutilizedOperators: 0,
      },
      slaMetrics,
      trends: {
        schedulesChange,
        conflictsChange,
        utilizationChange: 0,
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

  private extractTenantId(entry: OrchestrationLogEntry): string {
    if (entry.entryType === 'schedule-generated') {
      return entry.schedule.scope.tenantId;
    }
    if (entry.entryType === 'policy-decision' || entry.entryType === 'error') {
      return entry.scope.tenantId;
    }
    return '';
  }

  private extractDetails(entry: OrchestrationLogEntry): string {
    if (entry.entryType === 'schedule-generated') {
      return `${entry.slotsGenerated} slots, ${entry.conflictsDetected} conflicts`;
    }
    if (entry.entryType === 'conflict-detected') {
      return `${entry.conflict.conflictType} - ${entry.conflict.severity}`;
    }
    if (entry.entryType === 'recommendation-generated') {
      return `${entry.recommendation.recommendationType} - ${entry.recommendation.description}`;
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
