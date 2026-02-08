/**
 * Phase 47: Autonomous Documentation Engine - Main Engine
 * 
 * Orchestrates documentation generation from real system metadata.
 * No generative AI, no invented content.
 */

import {
  DocumentationQuery,
  DocumentationResult,
  DocumentationStatistics,
  DocumentationCategory,
  DocumentationTemplateType,
  DocumentationQueryType
} from './documentationTypes';
import {
  DocumentationTemplateLibrary,
  createDocumentationTemplateLibrary
} from './documentationTemplateLibrary';
import {
  DocumentationAssembler,
  createDocumentationAssembler,
  extractMetadataFromEngines
} from './documentationAssembler';
import {
  DocumentationPolicyEngine,
  createDocumentationPolicyEngine,
  allEvaluationsPassed
} from './documentationPolicyEngine';
import {
  DocumentationLog,
  createDocumentationLog
} from './documentationLog';

// ============================================================================
// DOCUMENTATION ENGINE
// ============================================================================

export class DocumentationEngine {
  private templateLibrary: DocumentationTemplateLibrary;
  private assembler: DocumentationAssembler;
  private policyEngine: DocumentationPolicyEngine;
  private log: DocumentationLog;
  private tenantId: string;
  private facilityId?: string;

  constructor(tenantId: string, facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
    this.templateLibrary = createDocumentationTemplateLibrary();
    this.assembler = createDocumentationAssembler(this.templateLibrary);
    this.policyEngine = createDocumentationPolicyEngine();
    this.log = createDocumentationLog();
  }

  /**
   * Generate documentation
   */
  generateDocumentation(
    query: DocumentationQuery,
    performedBy: string,
    userRoles: string[] = ['operator']
  ): DocumentationResult {
    try {
      // Step 1: Evaluate policies
      const policyEvaluations = this.policyEngine.evaluateQuery(query, performedBy, userRoles);
      this.log.logPolicyEvaluation(query, policyEvaluations, performedBy);

      const failed = this.policyEngine.getFailedEvaluations(policyEvaluations);
      if (failed.length > 0) {
        const errorMsg = `Policy evaluation failed: ${failed.map(f => f.reason).join(', ')}`;
        this.log.logError(errorMsg, query, performedBy);
        throw new Error(errorMsg);
      }

      // Step 2: Select template
      const template = this.selectTemplate(query);
      if (!template) {
        const errorMsg = 'No suitable template found for query';
        this.log.logError(errorMsg, query, performedBy);
        throw new Error(errorMsg);
      }

      this.log.logTemplateSelection(template.id, template.templateType, query, performedBy);

      // Step 3: Extract metadata from engines
      const metadataSources = extractMetadataFromEngines(query, template);
      this.log.logMetadataExtraction(
        Array.from(new Set(metadataSources.map(m => m.engineType))),
        metadataSources.length,
        query.scope,
        performedBy
      );

      // Step 4: Assemble documentation
      const result = this.assembler.assembleDocumentation(
        query,
        template,
        metadataSources,
        performedBy
      );

      // Add policy evaluations to result metadata
      result.metadata.policyEvaluations = policyEvaluations;

      this.log.logAssembly(
        result.bundle.totalSections,
        result.bundle.totalReferences,
        query.scope,
        performedBy
      );

      // Step 5: Log successful query
      this.log.logQuery(query, result, performedBy, policyEvaluations);

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.log.logError(errorMsg, query, performedBy, {
        error: String(error)
      });
      throw error;
    }
  }

  /**
   * Select appropriate template for query
   */
  private selectTemplate(query: DocumentationQuery) {
    // First try to use explicit template type from filters
    if (query.filters.templateType) {
      return this.templateLibrary.getTemplateByType(query.filters.templateType);
    }

    // Otherwise, infer from query type
    const templateType = this.inferTemplateType(query);
    return this.templateLibrary.getTemplateByType(templateType);
  }

  /**
   * Infer template type from query
   */
  private inferTemplateType(query: DocumentationQuery): DocumentationTemplateType {
    switch (query.queryType) {
      case 'generate-engine-documentation':
        return 'engine-overview';
      case 'generate-asset-documentation':
        if (query.filters.assetType) {
          if (query.filters.assetType.startsWith('training-')) {
            return 'training-module-documentation';
          }
          if (query.filters.assetType === 'knowledge-pack') {
            return 'knowledge-pack-documentation';
          }
          if (query.filters.assetType.startsWith('marketplace-')) {
            return 'marketplace-asset-documentation';
          }
          if (query.filters.assetType.startsWith('governance-')) {
            return 'governance-lineage-report';
          }
          if (query.filters.assetType.startsWith('health-')) {
            return 'health-drift-summary';
          }
          if (query.filters.assetType.startsWith('analytics-')) {
            return 'analytics-pattern-documentation';
          }
          if (query.filters.assetType === 'timeline-event') {
            return 'timeline-event-summary';
          }
        }
        return 'asset-summary';
      case 'generate-lineage-documentation':
        if (query.filters.engineType === 'fabric') {
          return 'fabric-link-documentation';
        }
        return 'governance-lineage-report';
      case 'generate-compliance-documentation':
        return 'compliance-report';
      case 'generate-operational-documentation':
        return 'operational-summary';
      case 'generate-system-overview':
        return 'system-overview';
      default:
        return 'system-overview';
    }
  }

  // ============================================================================
  // TEMPLATE ACCESS
  // ============================================================================

  getAllTemplates() {
    return this.templateLibrary.getAllTemplates();
  }

  getTemplatesByCategory(category: DocumentationCategory) {
    return this.templateLibrary.getTemplatesByCategory(category);
  }

  getTemplate(id: string) {
    return this.templateLibrary.getTemplate(id);
  }

  // ============================================================================
  // POLICY ACCESS
  // ============================================================================

  getAllPolicies() {
    return this.policyEngine.getAllPolicies();
  }

  addPolicy(policy: any) {
    this.policyEngine.addPolicy(policy);
  }

  // ============================================================================
  // LOG ACCESS
  // ============================================================================

  getLog() {
    return this.log;
  }

  getRecentDocumentation(count: number = 10): DocumentationResult[] {
    // This would return actual stored results
    // For now, return empty array
    return [];
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  getStatistics(): DocumentationStatistics {
    const queryStats = this.log.getQueryStatistics();
    const templateUsage = this.log.getTemplateUsageStatistics();
    const engineUsage = this.log.getEngineQueryStatistics();

    // Count by category (inferred from query types in log)
    const documentsByCategory: Record<DocumentationCategory, number> = {
      'engine-summary': 0,
      'asset-documentation': 0,
      'lineage-documentation': 0,
      'compliance-documentation': 0,
      'operational-documentation': 0,
      'system-overview': 0,
      'cross-engine-analysis': 0
    };

    const entries = this.log.getEntriesByType('query');
    for (const entry of entries) {
      if (entry.details?.category) {
        const cat = entry.details.category as DocumentationCategory;
        documentsByCategory[cat] = (documentsByCategory[cat] || 0) + 1;
      }
    }

    // Count by template
    const documentsByTemplate: Record<DocumentationTemplateType, number> = {
      'engine-overview': templateUsage['template-engine-overview'] || 0,
      'asset-summary': templateUsage['template-asset-summary'] || 0,
      'cross-engine-link-summary': templateUsage['template-cross-engine-links'] || 0,
      'governance-lineage-report': templateUsage['template-governance-lineage'] || 0,
      'health-drift-summary': templateUsage['template-health-drift'] || 0,
      'training-module-documentation': templateUsage['template-training-module'] || 0,
      'knowledge-pack-documentation': templateUsage['template-knowledge-pack'] || 0,
      'marketplace-asset-documentation': templateUsage['template-marketplace-asset'] || 0,
      'compliance-report': templateUsage['template-compliance-report'] || 0,
      'operational-summary': templateUsage['template-operational-summary'] || 0,
      'system-overview': templateUsage['template-system-overview'] || 0,
      'timeline-event-summary': templateUsage['template-timeline-event'] || 0,
      'analytics-pattern-documentation': templateUsage['template-analytics-pattern'] || 0,
      'fabric-link-documentation': templateUsage['template-fabric-link'] || 0
    };

    // Count by engine
    const documentsByEngine: any = {};
    for (const [engine, count] of Object.entries(engineUsage)) {
      documentsByEngine[engine] = count;
    }

    // Queries in last 24h
    const oneDayAgo = new Date(Date.now() - 86400000);
    const queriesLast24h = this.log.getEntriesInRange(oneDayAgo, new Date()).filter(
      e => e.entryType === 'query'
    ).length;

    return {
      totalDocumentsGenerated: queryStats.totalQueries,
      documentsByCategory,
      documentsByTemplate,
      documentsByEngine,
      totalQueriesLast24h: queriesLast24h,
      averageExecutionTimeMs: queryStats.averageExecutionTimeMs,
      totalSectionsGenerated: queryStats.totalSectionsGenerated,
      totalReferencesGenerated: queryStats.totalReferencesGenerated,
      totalMetadataFieldsExtracted: queryStats.totalMetadataFieldsExtracted,
      timestamp: new Date().toISOString()
    };
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  exportLog(options?: any) {
    return this.log.exportLog(options);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createDocumentationEngine(tenantId: string, facilityId?: string): DocumentationEngine {
  return new DocumentationEngine(tenantId, facilityId);
}

/**
 * Initialize documentation engine with sample data
 */
export function initializeDocumentationEngineWithSampleData(engine: DocumentationEngine): void {
  // Sample data would be initialized here if needed
  // For now, the engine is ready to use with its templates
}
