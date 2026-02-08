/**
 * Phase 46: Multi-Tenant Data Fabric - Fabric Log
 * 
 * Stores fabric queries, link generation events, and policy evaluations
 * with tenant/facility scope. Supports filtering and export.
 */

import {
  FabricLogEntry,
  FabricQuery,
  FabricResult,
  FabricScopeContext,
  FabricQueryType
} from './fabricTypes';

// ============================================================================
// FABRIC LOG CLASS
// ============================================================================

export class FabricLog {
  private entries: FabricLogEntry[] = [];
  private tenantId: string;
  private facilityId?: string;

  constructor(tenantId: string, facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
  }

  /**
   * Log a query execution
   */
  logQuery(
    query: FabricQuery,
    result: FabricResult,
    performedBy: string
  ): void {
    const entry: FabricLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      entryType: 'query',
      scope: query.scope,
      performedBy,
      details: {
        query,
        resultSummary: {
          nodes: result.totalNodes,
          edges: result.totalEdges
        }
      },
      queryId: result.queryId,
      queryType: query.queryType,
      nodesReturned: result.totalNodes,
      edgesReturned: result.totalEdges,
      executionTimeMs: result.executionTimeMs
    };

    this.entries.push(entry);
  }

  /**
   * Log a link generation event
   */
  logLinkGeneration(
    fromEntityId: string,
    toEntityId: string,
    edgeType: string,
    success: boolean,
    performedBy: string,
    scope: FabricScopeContext
  ): void {
    const entry: FabricLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      entryType: 'link-generated',
      scope,
      performedBy,
      details: {
        fromEntityId,
        toEntityId,
        edgeType,
        success
      }
    };

    this.entries.push(entry);
  }

  /**
   * Log a policy evaluation
   */
  logPolicyEvaluation(
    policyId: string,
    policyName: string,
    allowed: boolean,
    reason: string,
    performedBy: string,
    scope: FabricScopeContext
  ): void {
    const entry: FabricLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      entryType: 'policy-evaluation',
      scope,
      performedBy,
      details: {
        policyId,
        policyName,
        allowed,
        reason
      }
    };

    this.entries.push(entry);
  }

  /**
   * Log an error
   */
  logError(
    error: string,
    details: Record<string, any>,
    performedBy: string,
    scope: FabricScopeContext
  ): void {
    const entry: FabricLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      entryType: 'error',
      scope,
      performedBy,
      details: {
        error,
        ...details
      }
    };

    this.entries.push(entry);
  }

  /**
   * Get all entries
   */
  getAllEntries(): FabricLogEntry[] {
    return [...this.entries];
  }

  /**
   * Get entries by type
   */
  getEntriesByType(entryType: FabricLogEntry['entryType']): FabricLogEntry[] {
    return this.entries.filter(e => e.entryType === entryType);
  }

  /**
   * Get entries in time range
   */
  getEntriesInRange(startTime: Date, endTime: Date): FabricLogEntry[] {
    const startStr = startTime.toISOString();
    const endStr = endTime.toISOString();
    
    return this.entries.filter(e => e.timestamp >= startStr && e.timestamp <= endStr);
  }

  /**
   * Get entries by performer
   */
  getEntriesByPerformer(performedBy: string): FabricLogEntry[] {
    return this.entries.filter(e => e.performedBy === performedBy);
  }

  /**
   * Get query statistics
   */
  getQueryStatistics(): {
    totalQueries: number;
    queriesByType: Record<string, number>;
    averageExecutionTime: number;
    totalNodesReturned: number;
    totalEdgesReturned: number;
  } {
    const queryEntries = this.getEntriesByType('query');
    
    const queriesByType: Record<string, number> = {};
    let totalExecutionTime = 0;
    let totalNodesReturned = 0;
    let totalEdgesReturned = 0;

    for (const entry of queryEntries) {
      if (entry.queryType) {
        queriesByType[entry.queryType] = (queriesByType[entry.queryType] || 0) + 1;
      }
      if (entry.executionTimeMs) {
        totalExecutionTime += entry.executionTimeMs;
      }
      if (entry.nodesReturned) {
        totalNodesReturned += entry.nodesReturned;
      }
      if (entry.edgesReturned) {
        totalEdgesReturned += entry.edgesReturned;
      }
    }

    return {
      totalQueries: queryEntries.length,
      queriesByType,
      averageExecutionTime: queryEntries.length > 0 ? totalExecutionTime / queryEntries.length : 0,
      totalNodesReturned,
      totalEdgesReturned
    };
  }

  /**
   * Export log to JSON
   */
  exportLog(filters?: {
    entryType?: FabricLogEntry['entryType'];
    startTime?: Date;
    endTime?: Date;
    performedBy?: string;
  }): string {
    let entries = [...this.entries];

    if (filters) {
      if (filters.entryType) {
        entries = entries.filter(e => e.entryType === filters.entryType);
      }
      if (filters.startTime) {
        const startStr = filters.startTime.toISOString();
        entries = entries.filter(e => e.timestamp >= startStr);
      }
      if (filters.endTime) {
        const endStr = filters.endTime.toISOString();
        entries = entries.filter(e => e.timestamp <= endStr);
      }
      if (filters.performedBy) {
        entries = entries.filter(e => e.performedBy === filters.performedBy);
      }
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      filters,
      totalEntries: entries.length,
      entries
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Clear old entries
   */
  clearOldEntries(olderThan: Date): number {
    const timestampStr = olderThan.toISOString();
    const initialCount = this.entries.length;
    
    this.entries = this.entries.filter(e => e.timestamp > timestampStr);
    
    return initialCount - this.entries.length;
  }
}

// ============================================================================
// LOG UTILITIES
// ============================================================================

/**
 * Create fabric log instance
 */
export function createFabricLog(tenantId: string, facilityId?: string): FabricLog {
  return new FabricLog(tenantId, facilityId);
}

/**
 * Format log entry for display
 */
export function formatLogEntry(entry: FabricLogEntry): string {
  return `[${entry.timestamp}] ${entry.entryType} by ${entry.performedBy}`;
}
