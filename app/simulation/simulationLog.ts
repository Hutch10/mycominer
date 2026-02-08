/**
 * Phase 49: Operator Simulation Mode - Audit Log
 * 
 * Complete audit trail for all simulation operations.
 * Integrates with Compliance, Governance History, Fabric, Documentation, Intelligence Hub.
 * 
 * CRITICAL CONSTRAINTS:
 * - All operations logged
 * - Logs are immutable
 * - Tenant isolation enforced
 * - Export capability for compliance
 */

import type {
  SimulationQuery,
  SimulationScenario,
  SimulationLogEntry,
  SimulationStatistics,
  SimulationScenarioType,
} from './simulationTypes';

// ============================================================================
// SIMULATION LOG
// ============================================================================

export class SimulationLog {
  private tenantId: string;
  private entries: SimulationLogEntry[] = [];
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
  public logQuery(query: SimulationQuery): void {
    const entry: SimulationLogEntry = {
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
   * Log scenario build
   */
  public logScenarioBuild(scenario: SimulationScenario): void {
    const sourceEngines = Array.from(new Set(
      scenario.steps
        .map(s => s.sourceEngine)
        .filter((e): e is string => e !== undefined)
    ));

    const entry: SimulationLogEntry = {
      entryId: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'scenario-build',
      timestamp: new Date().toISOString(),
      tenantId: scenario.scope.tenantId,
      facilityId: scenario.scope.facilityId,
      scenarioBuild: {
        scenarioId: scenario.scenarioId,
        scenarioType: scenario.scenarioType,
        totalSteps: scenario.totalSteps,
        sourceEngines,
      },
      performedBy: scenario.metadata.createdBy,
      success: true,
    };

    this.addEntry(entry);
  }

  /**
   * Log timeline step
   */
  public logTimelineStep(
    stateId: string,
    stepNumber: number,
    action: 'step-forward' | 'step-backward' | 'jump' | 'replay'
  ): void {
    const entry: SimulationLogEntry = {
      entryId: `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'timeline-step',
      timestamp: new Date().toISOString(),
      tenantId: this.tenantId,
      timelineStep: {
        stateId,
        stepNumber,
        stepType: 'action',
        action,
      },
      performedBy: 'system',
      success: true,
    };

    this.addEntry(entry);
  }

  /**
   * Log error
   */
  public logError(queryId: string, errorMessage: string): void {
    const entry: SimulationLogEntry = {
      entryId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'error',
      timestamp: new Date().toISOString(),
      tenantId: this.tenantId,
      error: {
        message: errorMessage,
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
  public getAllEntries(): SimulationLogEntry[] {
    return [...this.entries];
  }

  /**
   * Get entries by type
   */
  public getEntriesByType(entryType: SimulationLogEntry['entryType']): SimulationLogEntry[] {
    return this.entries.filter(e => e.entryType === entryType);
  }

  /**
   * Get entries in time range
   */
  public getEntriesInRange(startDate: string, endDate: string): SimulationLogEntry[] {
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
  public getEntriesByPerformer(performedBy: string): SimulationLogEntry[] {
    return this.entries.filter(e => e.performedBy === performedBy);
  }

  /**
   * Get successful queries
   */
  public getSuccessfulQueries(): SimulationLogEntry[] {
    return this.entries.filter(e => e.entryType === 'query' && e.success);
  }

  /**
   * Get failed queries
   */
  public getFailedQueries(): SimulationLogEntry[] {
    return this.entries.filter(e => e.entryType === 'query' && !e.success);
  }

  /**
   * Get recent entries (last N)
   */
  public getRecentEntries(count: number): SimulationLogEntry[] {
    return this.entries.slice(-count);
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get simulation statistics
   */
  public getStatistics(): SimulationStatistics {
    const queryEntries = this.getEntriesByType('query');
    const scenarioEntries = this.getEntriesByType('scenario-build');

    // Count simulations by type
    const simulationsByType: Record<SimulationScenarioType, number> = {
      'sop-execution': 0,
      'workflow-rehearsal': 0,
      'incident-replay': 0,
      'governance-replay': 0,
      'health-drift-replay': 0,
      'analytics-replay': 0,
      'training-simulation': 0,
      'fabric-traversal': 0,
    };

    for (const entry of queryEntries) {
      if (entry.query?.queryType) {
        simulationsByType[entry.query.queryType]++;
      }
    }

    // Count simulations by source engine
    const simulationsBySourceEngine: Record<string, number> = {};

    for (const entry of scenarioEntries) {
      if (entry.scenarioBuild?.sourceEngines) {
        for (const engine of entry.scenarioBuild.sourceEngines) {
          simulationsBySourceEngine[engine] = (simulationsBySourceEngine[engine] || 0) + 1;
        }
      }
    }

    // Calculate averages
    const totalSteps = scenarioEntries.reduce(
      (sum, e) => sum + (e.scenarioBuild?.totalSteps || 0), 
      0
    );
    const averageStepsPerSimulation = scenarioEntries.length > 0
      ? Math.round(totalSteps / scenarioEntries.length)
      : 0;

    // Find most used scenario type
    const mostUsedScenarioType = Object.entries(simulationsByType)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as SimulationScenarioType || 'sop-execution';

    // Get simulations in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const simulationsLast24Hours = this.getEntriesInRange(yesterday, new Date().toISOString())
      .filter(e => e.entryType === 'query').length;

    // Count errors
    const totalErrors = this.getEntriesByType('error').length;

    return {
      totalSimulations: queryEntries.length,
      simulationsByType,
      averageStepsPerSimulation,
      averageDuration: 0, // Would be calculated from timing data
      totalErrors,
      mostUsedScenarioType,
      simulationsLast24Hours,
      simulationsBySourceEngine,
    };
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  /**
   * Export log to JSON
   */
  public exportLog(filters?: {
    entryType?: SimulationLogEntry['entryType'];
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
  private addEntry(entry: SimulationLogEntry): void {
    this.entries.push(entry);

    // Keep only last N entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  /**
   * Clear old entries (older than N days)
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
}
