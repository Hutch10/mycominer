/**
 * Phase 43: System Health - Health Log
 * 
 * Stores and tracks all health queries, drift findings, integrity findings,
 * and policy evaluations. Supports filtering, export, and compliance integration.
 */

import {
  HealthLogEntry,
  HealthQuery,
  DriftFinding,
  IntegrityFinding,
  HealthPolicyEvaluation,
  HealthCategory,
  HealthSeverity
} from './healthTypes';

// ============================================================================
// HEALTH LOG CLASS
// ============================================================================

export class HealthLog {
  private entries: Map<string, HealthLogEntry> = new Map();
  private tenantId: string;
  private facilityId?: string;
  private maxRetentionDays: number;

  constructor(tenantId: string, facilityId?: string, maxRetentionDays: number = 365) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
    this.maxRetentionDays = maxRetentionDays;
  }

  /**
   * Log a health query
   */
  logQuery(query: HealthQuery): HealthLogEntry {
    const entry: HealthLogEntry = {
      id: `log-query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      tenantId: query.tenantId,
      facilityId: query.facilityId,
      userId: query.userId,
      entryType: 'query',
      queryId: query.id,
      description: query.description,
      context: {
        queryType: query.queryType,
        categories: query.categories,
        assetTypes: query.assetTypes,
        severityThreshold: query.severityThreshold
      },
      references: []
    };

    this.entries.set(entry.id, entry);
    return entry;
  }

  /**
   * Log a drift finding
   */
  logDriftFinding(finding: DriftFinding, userId: string): HealthLogEntry {
    const entry: HealthLogEntry = {
      id: `log-drift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      tenantId: finding.tenantId,
      facilityId: finding.facilityId,
      userId,
      entryType: 'drift-finding',
      findingId: finding.id,
      category: finding.category,
      severity: finding.severity,
      description: finding.rationale,
      context: {
        assetType: finding.assetType,
        assetId: finding.assetId,
        assetName: finding.assetName,
        driftType: finding.driftType,
        fieldsDrifted: finding.fieldsDrifted,
        fieldCount: finding.fieldsDrifted.length
      },
      references: finding.references
    };

    this.entries.set(entry.id, entry);
    return entry;
  }

  /**
   * Log an integrity finding
   */
  logIntegrityFinding(finding: IntegrityFinding, userId: string): HealthLogEntry {
    const entry: HealthLogEntry = {
      id: `log-integrity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      tenantId: finding.tenantId,
      facilityId: finding.facilityId,
      userId,
      entryType: 'integrity-finding',
      findingId: finding.id,
      category: finding.category,
      severity: finding.severity,
      description: finding.description,
      context: {
        issueType: finding.issueType,
        assetType: finding.assetType,
        assetId: finding.assetId,
        assetName: finding.assetName,
        affectedItemsCount: finding.affectedItems.length,
        rationale: finding.rationale,
        recommendation: finding.recommendation
      },
      references: finding.references
    };

    this.entries.set(entry.id, entry);
    return entry;
  }

  /**
   * Log a policy evaluation
   */
  logPolicyEvaluation(evaluation: HealthPolicyEvaluation, userId: string): HealthLogEntry {
    const entry: HealthLogEntry = {
      id: `log-policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      tenantId: evaluation.tenantId,
      facilityId: evaluation.facilityId,
      userId,
      entryType: 'policy-evaluation',
      description: `Policy evaluation: ${evaluation.passed ? 'PASSED' : 'FAILED'}`,
      context: {
        policyId: evaluation.policyId,
        passed: evaluation.passed,
        violatedRulesCount: evaluation.violatedRules.length,
        evaluatedAssets: evaluation.evaluatedAssets,
        evaluationContext: evaluation.context
      },
      references: []
    };

    this.entries.set(entry.id, entry);
    return entry;
  }

  // ==========================================================================
  // QUERY & FILTERING
  // ==========================================================================

  /**
   * Get entries by type
   */
  getEntriesByType(entryType: HealthLogEntry['entryType']): HealthLogEntry[] {
    return Array.from(this.entries.values())
      .filter(e => e.entryType === entryType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get entries by category
   */
  getEntriesByCategory(category: HealthCategory): HealthLogEntry[] {
    return Array.from(this.entries.values())
      .filter(e => e.category === category)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get entries by severity
   */
  getEntriesBySeverity(severity: HealthSeverity): HealthLogEntry[] {
    return Array.from(this.entries.values())
      .filter(e => e.severity === severity)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get entries by time range
   */
  getEntriesByTimeRange(startDate: string, endDate: string): HealthLogEntry[] {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return Array.from(this.entries.values())
      .filter(e => {
        const entryDate = new Date(e.timestamp);
        return entryDate >= start && entryDate <= end;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get entries by user
   */
  getEntriesByUser(userId: string): HealthLogEntry[] {
    return Array.from(this.entries.values())
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get entries by facility
   */
  getEntriesByFacility(facilityId: string): HealthLogEntry[] {
    return Array.from(this.entries.values())
      .filter(e => e.facilityId === facilityId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Search entries
   */
  searchEntries(searchTerm: string): HealthLogEntry[] {
    const lowerSearchTerm = searchTerm.toLowerCase();

    return Array.from(this.entries.values())
      .filter(e => {
        return (
          e.description.toLowerCase().includes(lowerSearchTerm) ||
          e.id.toLowerCase().includes(lowerSearchTerm) ||
          JSON.stringify(e.context).toLowerCase().includes(lowerSearchTerm)
        );
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get all entries
   */
  getAllEntries(): HealthLogEntry[] {
    return Array.from(this.entries.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get entry by ID
   */
  getEntryById(id: string): HealthLogEntry | undefined {
    return this.entries.get(id);
  }

  /**
   * Get recent entries
   */
  getRecentEntries(limit: number = 50): HealthLogEntry[] {
    return Array.from(this.entries.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // ==========================================================================
  // STATISTICS & ANALYTICS
  // ==========================================================================

  /**
   * Get log statistics
   */
  getStatistics(): {
    totalEntries: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    byDate: Record<string, number>;
  } {
    const stats = {
      totalEntries: this.entries.size,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byDate: {} as Record<string, number>
    };

    for (const entry of this.entries.values()) {
      // By type
      stats.byType[entry.entryType] = (stats.byType[entry.entryType] || 0) + 1;

      // By category
      if (entry.category) {
        stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;
      }

      // By severity
      if (entry.severity) {
        stats.bySeverity[entry.severity] = (stats.bySeverity[entry.severity] || 0) + 1;
      }

      // By date
      const date = entry.timestamp.split('T')[0];
      stats.byDate[date] = (stats.byDate[date] || 0) + 1;
    }

    return stats;
  }

  /**
   * Get trend data
   */
  getTrendData(days: number = 30): {
    date: string;
    queries: number;
    driftFindings: number;
    integrityFindings: number;
    policyEvaluations: number;
  }[] {
    const trends: Map<string, {
      date: string;
      queries: number;
      driftFindings: number;
      integrityFindings: number;
      policyEvaluations: number;
    }> = new Map();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (const entry of this.entries.values()) {
      const entryDate = new Date(entry.timestamp);
      if (entryDate < startDate) continue;

      const dateKey = entry.timestamp.split('T')[0];
      
      if (!trends.has(dateKey)) {
        trends.set(dateKey, {
          date: dateKey,
          queries: 0,
          driftFindings: 0,
          integrityFindings: 0,
          policyEvaluations: 0
        });
      }

      const trend = trends.get(dateKey)!;
      
      switch (entry.entryType) {
        case 'query':
          trend.queries++;
          break;
        case 'drift-finding':
          trend.driftFindings++;
          break;
        case 'integrity-finding':
          trend.integrityFindings++;
          break;
        case 'policy-evaluation':
          trend.policyEvaluations++;
          break;
      }
    }

    return Array.from(trends.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  // ==========================================================================
  // EXPORT & MAINTENANCE
  // ==========================================================================

  /**
   * Export entries to JSON
   */
  exportToJSON(filters?: {
    entryTypes?: HealthLogEntry['entryType'][];
    categories?: HealthCategory[];
    severities?: HealthSeverity[];
    startDate?: string;
    endDate?: string;
  }): string {
    let entries = Array.from(this.entries.values());

    if (filters) {
      if (filters.entryTypes) {
        entries = entries.filter(e => filters.entryTypes!.includes(e.entryType));
      }
      if (filters.categories) {
        entries = entries.filter(e => e.category && filters.categories!.includes(e.category));
      }
      if (filters.severities) {
        entries = entries.filter(e => e.severity && filters.severities!.includes(e.severity));
      }
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        entries = entries.filter(e => new Date(e.timestamp) >= start);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        entries = entries.filter(e => new Date(e.timestamp) <= end);
      }
    }

    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      entryCount: entries.length,
      entries: entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }, null, 2);
  }

  /**
   * Clean up old entries
   */
  cleanupOldEntries(): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.maxRetentionDays);

    let removedCount = 0;

    for (const [id, entry] of this.entries.entries()) {
      const entryDate = new Date(entry.timestamp);
      if (entryDate < cutoffDate) {
        this.entries.delete(id);
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Clear all entries
   */
  clearAll(): void {
    this.entries.clear();
  }

  /**
   * Get log size
   */
  getSize(): number {
    return this.entries.size;
  }

  /**
   * Import entries from JSON
   */
  importFromJSON(jsonData: string): number {
    try {
      const data = JSON.parse(jsonData);
      let importedCount = 0;

      if (data.entries && Array.isArray(data.entries)) {
        for (const entry of data.entries) {
          // Validate entry belongs to this tenant
          if (entry.tenantId === this.tenantId) {
            this.entries.set(entry.id, entry as HealthLogEntry);
            importedCount++;
          }
        }
      }

      return importedCount;
    } catch (error) {
      console.error('Failed to import health log entries:', error);
      return 0;
    }
  }
}

// ============================================================================
// LOG UTILITIES
// ============================================================================

/**
 * Create a health log filter
 */
export function createLogFilter(options: {
  entryTypes?: HealthLogEntry['entryType'][];
  categories?: HealthCategory[];
  severities?: HealthSeverity[];
  startDate?: string;
  endDate?: string;
  userId?: string;
  facilityId?: string;
}): (entry: HealthLogEntry) => boolean {
  return (entry: HealthLogEntry) => {
    if (options.entryTypes && !options.entryTypes.includes(entry.entryType)) {
      return false;
    }
    if (options.categories && entry.category && !options.categories.includes(entry.category)) {
      return false;
    }
    if (options.severities && entry.severity && !options.severities.includes(entry.severity)) {
      return false;
    }
    if (options.startDate && new Date(entry.timestamp) < new Date(options.startDate)) {
      return false;
    }
    if (options.endDate && new Date(entry.timestamp) > new Date(options.endDate)) {
      return false;
    }
    if (options.userId && entry.userId !== options.userId) {
      return false;
    }
    if (options.facilityId && entry.facilityId !== options.facilityId) {
      return false;
    }
    return true;
  };
}

/**
 * Aggregate log entries by category
 */
export function aggregateByCategory(entries: HealthLogEntry[]): Record<HealthCategory, HealthLogEntry[]> {
  const aggregated: Partial<Record<HealthCategory, HealthLogEntry[]>> = {};

  for (const entry of entries) {
    if (entry.category) {
      if (!aggregated[entry.category]) {
        aggregated[entry.category] = [];
      }
      aggregated[entry.category]!.push(entry);
    }
  }

  return aggregated as Record<HealthCategory, HealthLogEntry[]>;
}
