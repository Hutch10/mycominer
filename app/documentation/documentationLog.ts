/**
 * Phase 47: Autonomous Documentation Engine - Documentation Log
 * 
 * Complete audit trail for all documentation operations.
 */

import {
  DocumentationLogEntry,
  DocumentationLogEntryType,
  DocumentationQuery,
  DocumentationResult,
  DocumentationPolicyEvaluation,
  DocumentationScopeContext,
  DocumentationEngineType
} from './documentationTypes';

// ============================================================================
// DOCUMENTATION LOG
// ============================================================================

export class DocumentationLog {
  private entries: DocumentationLogEntry[] = [];
  private maxEntries: number = 10000;

  /**
   * Log documentation query
   */
  logQuery(
    query: DocumentationQuery,
    result: DocumentationResult,
    performedBy: string,
    policyEvaluations: DocumentationPolicyEvaluation[]
  ): void {
    const entry: DocumentationLogEntry = {
      id: this.generateEntryId(),
      entryType: 'query',
      timestamp: new Date().toISOString(),
      performedBy,
      scope: query.scope,
      queryType: query.queryType,
      templateType: result.templateType,
      templateId: result.metadata.templateUsed,
      resultId: result.id,
      sectionsGenerated: result.bundle.totalSections,
      referencesGenerated: result.bundle.totalReferences,
      metadataFieldsExtracted: result.metadata.totalFieldsExtracted,
      enginesQueried: result.metadata.enginesQueried,
      executionTimeMs: result.executionTimeMs,
      policyEvaluations,
      success: true,
      details: {
        title: result.title,
        category: result.category
      }
    };

    this.addEntry(entry);
  }

  /**
   * Log template selection
   */
  logTemplateSelection(
    templateId: string,
    templateType: string,
    query: DocumentationQuery,
    performedBy: string
  ): void {
    const entry: DocumentationLogEntry = {
      id: this.generateEntryId(),
      entryType: 'template-selection',
      timestamp: new Date().toISOString(),
      performedBy,
      scope: query.scope,
      queryType: query.queryType,
      templateId,
      success: true,
      details: {
        templateType
      }
    };

    this.addEntry(entry);
  }

  /**
   * Log metadata extraction
   */
  logMetadataExtraction(
    enginesQueried: DocumentationEngineType[],
    fieldsExtracted: number,
    scope: DocumentationScopeContext,
    performedBy: string
  ): void {
    const entry: DocumentationLogEntry = {
      id: this.generateEntryId(),
      entryType: 'metadata-extraction',
      timestamp: new Date().toISOString(),
      performedBy,
      scope,
      enginesQueried,
      metadataFieldsExtracted: fieldsExtracted,
      success: true
    };

    this.addEntry(entry);
  }

  /**
   * Log assembly process
   */
  logAssembly(
    sectionsGenerated: number,
    referencesGenerated: number,
    scope: DocumentationScopeContext,
    performedBy: string
  ): void {
    const entry: DocumentationLogEntry = {
      id: this.generateEntryId(),
      entryType: 'assembly',
      timestamp: new Date().toISOString(),
      performedBy,
      scope,
      sectionsGenerated,
      referencesGenerated,
      success: true
    };

    this.addEntry(entry);
  }

  /**
   * Log policy evaluation
   */
  logPolicyEvaluation(
    query: DocumentationQuery,
    evaluations: DocumentationPolicyEvaluation[],
    performedBy: string
  ): void {
    const entry: DocumentationLogEntry = {
      id: this.generateEntryId(),
      entryType: 'policy-evaluation',
      timestamp: new Date().toISOString(),
      performedBy,
      scope: query.scope,
      queryType: query.queryType,
      policyEvaluations: evaluations,
      success: evaluations.every(e => e.decision === 'passed' || e.effect === 'allow'),
      details: {
        totalEvaluations: evaluations.length,
        passed: evaluations.filter(e => e.decision === 'passed').length,
        failed: evaluations.filter(e => e.decision === 'failed').length
      }
    };

    this.addEntry(entry);
  }

  /**
   * Log error
   */
  logError(
    errorMessage: string,
    query: DocumentationQuery,
    performedBy: string,
    details?: Record<string, any>
  ): void {
    const entry: DocumentationLogEntry = {
      id: this.generateEntryId(),
      entryType: 'error',
      timestamp: new Date().toISOString(),
      performedBy,
      scope: query.scope,
      queryType: query.queryType,
      success: false,
      errorMessage,
      details
    };

    this.addEntry(entry);
  }

  /**
   * Add entry to log
   */
  private addEntry(entry: DocumentationLogEntry): void {
    this.entries.push(entry);

    // Trim log if exceeds max entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  /**
   * Get all entries
   */
  getAllEntries(): DocumentationLogEntry[] {
    return [...this.entries];
  }

  /**
   * Get entries by type
   */
  getEntriesByType(entryType: DocumentationLogEntryType): DocumentationLogEntry[] {
    return this.entries.filter(e => e.entryType === entryType);
  }

  /**
   * Get entries in time range
   */
  getEntriesInRange(startDate: Date, endDate: Date): DocumentationLogEntry[] {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return this.entries.filter(e => {
      const entryTime = new Date(e.timestamp).getTime();
      return entryTime >= startTime && entryTime <= endTime;
    });
  }

  /**
   * Get entries by performer
   */
  getEntriesByPerformer(performedBy: string): DocumentationLogEntry[] {
    return this.entries.filter(e => e.performedBy === performedBy);
  }

  /**
   * Get entries by scope
   */
  getEntriesByScope(scope: DocumentationScopeContext): DocumentationLogEntry[] {
    return this.entries.filter(e =>
      e.scope.tenantId === scope.tenantId &&
      (!scope.facilityId || e.scope.facilityId === scope.facilityId)
    );
  }

  /**
   * Get successful queries
   */
  getSuccessfulQueries(): DocumentationLogEntry[] {
    return this.entries.filter(e => e.entryType === 'query' && e.success);
  }

  /**
   * Get failed queries
   */
  getFailedQueries(): DocumentationLogEntry[] {
    return this.entries.filter(e => e.entryType === 'query' && !e.success);
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Get query statistics
   */
  getQueryStatistics(): {
    totalQueries: number;
    successfulQueries: number;
    failedQueries: number;
    averageExecutionTimeMs: number;
    totalSectionsGenerated: number;
    totalReferencesGenerated: number;
    totalMetadataFieldsExtracted: number;
  } {
    const queryEntries = this.getEntriesByType('query');

    const totalQueries = queryEntries.length;
    const successfulQueries = queryEntries.filter(e => e.success).length;
    const failedQueries = queryEntries.filter(e => !e.success).length;

    const executionTimes = queryEntries
      .filter(e => e.executionTimeMs !== undefined)
      .map(e => e.executionTimeMs!);
    const averageExecutionTimeMs =
      executionTimes.length > 0
        ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
        : 0;

    const totalSectionsGenerated = queryEntries
      .filter(e => e.sectionsGenerated !== undefined)
      .reduce((sum, e) => sum + e.sectionsGenerated!, 0);

    const totalReferencesGenerated = queryEntries
      .filter(e => e.referencesGenerated !== undefined)
      .reduce((sum, e) => sum + e.referencesGenerated!, 0);

    const totalMetadataFieldsExtracted = queryEntries
      .filter(e => e.metadataFieldsExtracted !== undefined)
      .reduce((sum, e) => sum + e.metadataFieldsExtracted!, 0);

    return {
      totalQueries,
      successfulQueries,
      failedQueries,
      averageExecutionTimeMs,
      totalSectionsGenerated,
      totalReferencesGenerated,
      totalMetadataFieldsExtracted
    };
  }

  /**
   * Get template usage statistics
   */
  getTemplateUsageStatistics(): Record<string, number> {
    const templateUsage: Record<string, number> = {};

    const queryEntries = this.getEntriesByType('query');
    for (const entry of queryEntries) {
      if (entry.templateId) {
        templateUsage[entry.templateId] = (templateUsage[entry.templateId] || 0) + 1;
      }
    }

    return templateUsage;
  }

  /**
   * Get engine query statistics
   */
  getEngineQueryStatistics(): Record<DocumentationEngineType, number> {
    const engineQueries: Record<string, number> = {};

    const queryEntries = this.getEntriesByType('query');
    for (const entry of queryEntries) {
      if (entry.enginesQueried) {
        for (const engine of entry.enginesQueried) {
          engineQueries[engine] = (engineQueries[engine] || 0) + 1;
        }
      }
    }

    return engineQueries as Record<DocumentationEngineType, number>;
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  /**
   * Export log entries
   */
  exportLog(options?: {
    entryType?: DocumentationLogEntryType;
    startDate?: Date;
    endDate?: Date;
    performedBy?: string;
  }): string {
    let entries = this.entries;

    if (options?.entryType) {
      entries = entries.filter(e => e.entryType === options.entryType);
    }

    if (options?.startDate && options?.endDate) {
      entries = this.getEntriesInRange(options.startDate, options.endDate);
    }

    if (options?.performedBy) {
      entries = entries.filter(e => e.performedBy === options.performedBy);
    }

    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        totalEntries: entries.length,
        entries
      },
      null,
      2
    );
  }

  // ============================================================================
  // MAINTENANCE
  // ============================================================================

  /**
   * Clear old entries
   */
  clearOldEntries(olderThanDays: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffTime = cutoffDate.getTime();

    const initialLength = this.entries.length;
    this.entries = this.entries.filter(e => {
      const entryTime = new Date(e.timestamp).getTime();
      return entryTime >= cutoffTime;
    });

    return initialLength - this.entries.length;
  }

  /**
   * Clear all entries
   */
  clearAll(): void {
    this.entries = [];
  }

  // ============================================================================
  // ID GENERATION
  // ============================================================================

  private generateEntryId(): string {
    return `doc-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createDocumentationLog(): DocumentationLog {
  return new DocumentationLog();
}

export function formatLogEntry(entry: DocumentationLogEntry): string {
  return `[${entry.timestamp}] ${entry.entryType.toUpperCase()} - ${entry.performedBy}: ${
    entry.success ? 'SUCCESS' : 'FAILED'
  }`;
}
