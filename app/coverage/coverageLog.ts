/**
 * Phase 48: Global Coverage Sweep & Missing Systems Detector
 * 
 * COVERAGE LOG
 * 
 * Complete audit trail for all coverage operations including:
 * - Coverage queries executed
 * - Gaps detected
 * - Phase inventory operations
 * - Integration analysis
 * - Completeness checks
 * 
 * Integrates with:
 * - Compliance Engine (Phase 32)
 * - Governance History (Phase 45)
 * - Fabric (Phase 46)
 */

import {
  CoverageLogEntry,
  CoverageLogType,
  CoverageLogDetails,
  CoverageQuery,
  CoverageResult,
  CoverageGap,
  CoverageScopeContext,
  PhaseNumber
} from './coverageTypes';

export class CoverageLog {
  private entries: CoverageLogEntry[] = [];
  private maxEntries: number;

  constructor(maxEntries: number = 10000) {
    this.maxEntries = maxEntries;
  }

  /**
   * Log a coverage query
   */
  logQuery(
    query: CoverageQuery,
    result: CoverageResult | null,
    performer: string,
    success: boolean,
    errorMessage?: string
  ): void {
    const entry: CoverageLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type: 'coverage-query',
      timestamp: new Date().toISOString(),
      performer,
      scope: query.scope,
      details: {
        queryType: query.queryType,
        filters: query.filters,
        gapsDetected: result?.metadata.totalGapsDetected || 0,
        executionTimeMs: result?.executionTimeMs || 0
      },
      success,
      errorMessage
    };

    this.addEntry(entry);
  }

  /**
   * Log phase inventory operation
   */
  logPhaseInventory(
    phasesInventoried: PhaseNumber[],
    enginesFound: number,
    uiComponentsFound: number,
    integrationsFound: number,
    performer: string,
    scope: CoverageScopeContext
  ): void {
    const entry: CoverageLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type: 'phase-inventory',
      timestamp: new Date().toISOString(),
      performer,
      scope,
      details: {
        phasesInventoried,
        enginesFound,
        uiComponentsFound,
        integrationsFound
      },
      success: true
    };

    this.addEntry(entry);
  }

  /**
   * Log gap detection
   */
  logGapDetection(
    gaps: CoverageGap[],
    performer: string,
    scope: CoverageScopeContext
  ): void {
    const gapsByCategory = gaps.reduce((acc, gap) => {
      acc[gap.category] = (acc[gap.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const gapsBySeverity = gaps.reduce((acc, gap) => {
      acc[gap.severity] = (acc[gap.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const entry: CoverageLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type: 'gap-detection',
      timestamp: new Date().toISOString(),
      performer,
      scope,
      details: {
        gapsDetected: gaps.length,
        gapsByCategory: gapsByCategory as any,
        gapsBySeverity: gapsBySeverity as any
      },
      success: true
    };

    this.addEntry(entry);
  }

  /**
   * Log integration analysis
   */
  logIntegrationAnalysis(
    integrationsAnalyzed: number,
    missingIntegrations: number,
    brokenIntegrations: number,
    performer: string,
    scope: CoverageScopeContext
  ): void {
    const entry: CoverageLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type: 'integration-analysis',
      timestamp: new Date().toISOString(),
      performer,
      scope,
      details: {
        integrationsAnalyzed,
        missingIntegrations,
        brokenIntegrations
      },
      success: true
    };

    this.addEntry(entry);
  }

  /**
   * Log completeness check
   */
  logCompletenessCheck(
    phasesChecked: PhaseNumber[],
    completenessScores: Record<PhaseNumber, number>,
    averageCompleteness: number,
    performer: string,
    scope: CoverageScopeContext
  ): void {
    const entry: CoverageLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type: 'completeness-check',
      timestamp: new Date().toISOString(),
      performer,
      scope,
      details: {
        phasesChecked,
        completenessScores,
        averageCompleteness
      },
      success: true
    };

    this.addEntry(entry);
  }

  /**
   * Log error
   */
  logError(
    errorMessage: string,
    context: Record<string, any>,
    performer: string,
    scope: CoverageScopeContext
  ): void {
    const entry: CoverageLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type: 'error',
      timestamp: new Date().toISOString(),
      performer,
      scope,
      details: {
        errorMessage,
        errorStack: undefined,
        context
      },
      success: false,
      errorMessage
    };

    this.addEntry(entry);
  }

  /**
   * Get all entries
   */
  getAllEntries(): CoverageLogEntry[] {
    return [...this.entries];
  }

  /**
   * Get entries by type
   */
  getEntriesByType(type: CoverageLogType): CoverageLogEntry[] {
    return this.entries.filter(e => e.type === type);
  }

  /**
   * Get entries in date range
   */
  getEntriesInRange(startDate: Date, endDate: Date): CoverageLogEntry[] {
    return this.entries.filter(e => {
      const timestamp = new Date(e.timestamp);
      return timestamp >= startDate && timestamp <= endDate;
    });
  }

  /**
   * Get entries by performer
   */
  getEntriesByPerformer(performer: string): CoverageLogEntry[] {
    return this.entries.filter(e => e.performer === performer);
  }

  /**
   * Get entries by scope
   */
  getEntriesByScope(tenantId: string, facilityId?: string): CoverageLogEntry[] {
    return this.entries.filter(e => {
      if (e.scope.tenantId !== tenantId) return false;
      if (facilityId && e.scope.facilityId !== facilityId) return false;
      return true;
    });
  }

  /**
   * Get successful queries
   */
  getSuccessfulQueries(): CoverageLogEntry[] {
    return this.entries.filter(e => e.type === 'coverage-query' && e.success);
  }

  /**
   * Get failed queries
   */
  getFailedQueries(): CoverageLogEntry[] {
    return this.entries.filter(e => e.type === 'coverage-query' && !e.success);
  }

  /**
   * Get query statistics
   */
  getQueryStatistics(): {
    totalQueries: number;
    successfulQueries: number;
    failedQueries: number;
    averageExecutionTimeMs: number;
    totalGapsDetected: number;
  } {
    const queries = this.entries.filter(e => e.type === 'coverage-query');
    const successful = queries.filter(e => e.success);
    const failed = queries.filter(e => !e.success);

    const totalExecutionTime = queries.reduce((sum, e) => {
      const details = e.details as any;
      return sum + (details.executionTimeMs || 0);
    }, 0);

    const totalGapsDetected = queries.reduce((sum, e) => {
      const details = e.details as any;
      return sum + (details.gapsDetected || 0);
    }, 0);

    return {
      totalQueries: queries.length,
      successfulQueries: successful.length,
      failedQueries: failed.length,
      averageExecutionTimeMs: queries.length > 0 ? totalExecutionTime / queries.length : 0,
      totalGapsDetected
    };
  }

  /**
   * Export log
   */
  exportLog(filters?: {
    type?: CoverageLogType;
    startDate?: Date;
    endDate?: Date;
    performer?: string;
  }): string {
    let entries = this.entries;

    if (filters) {
      if (filters.type) {
        entries = entries.filter(e => e.type === filters.type);
      }
      if (filters.startDate && filters.endDate) {
        entries = this.getEntriesInRange(filters.startDate, filters.endDate);
      }
      if (filters.performer) {
        entries = entries.filter(e => e.performer === filters.performer);
      }
    }

    return JSON.stringify(entries, null, 2);
  }

  /**
   * Clear old entries
   */
  clearOldEntries(olderThanDays: number): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    this.entries = this.entries.filter(e => {
      const timestamp = new Date(e.timestamp);
      return timestamp > cutoffDate;
    });
  }

  /**
   * Clear all entries
   */
  clearAll(): void {
    this.entries = [];
  }

  /**
   * Add entry (internal)
   */
  private addEntry(entry: CoverageLogEntry): void {
    this.entries.push(entry);

    // Maintain max entries limit
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }
}
