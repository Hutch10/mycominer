/**
 * Phase 48: Operator Intelligence Hub - Main Engine
 * 
 * Orchestrates routing, assembly, and policy enforcement.
 * Deterministic, read-only unified cross-engine assistant.
 * 
 * CRITICAL CONSTRAINTS:
 * - No generative AI
 * - No invented content
 * - All responses grounded in real data
 * - Tenant isolation strictly enforced
 * - All operations logged
 */

import type {
  HubQuery,
  HubQueryType,
  HubResult,
  HubAssemblyConfig,
  HubPolicyContext,
  HubStatistics,
} from './hubTypes';

import { HubRouter } from './hubRouter';
import { HubAssembler } from './hubAssembler';
import { HubPolicyEngine, type PolicyDecision } from './hubPolicyEngine';
import { HubLog } from './hubLog';

// ============================================================================
// HUB ENGINE
// ============================================================================

export class HubEngine {
  private tenantId: string;
  private router: HubRouter;
  private assembler: HubAssembler;
  private policyEngine: HubPolicyEngine;
  private log: HubLog;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.router = new HubRouter(tenantId);
    this.assembler = new HubAssembler(tenantId);
    this.policyEngine = new HubPolicyEngine(tenantId);
    this.log = new HubLog(tenantId);
  }

  // ==========================================================================
  // MAIN QUERY EXECUTION
  // ==========================================================================

  /**
   * Execute hub query
   */
  public async executeQuery(query: HubQuery): Promise<HubResult> {
    const startTime = Date.now();

    try {
      // Build policy context
      const policyContext = this.buildPolicyContext(query);

      // Authorize query
      const authDecision = this.policyEngine.authorizeQuery(query, policyContext);
      
      if (authDecision.decision === 'deny') {
        throw new Error(`Query denied: ${authDecision.reason}`);
      }

      // Log query start
      this.log.logQuery(query, 'started', 0);

      // Route query to engines
      const sections = await this.router.routeQuery(query, policyContext);

      // Log routing
      this.log.logRouting(query.queryId, sections.map(s => s.sourceEngine));

      // Assemble results
      const assemblyConfig = this.buildAssemblyConfig(query);
      let result = this.assembler.assembleResult(query, sections, assemblyConfig);

      // Authorize references
      result.allReferences = this.policyEngine.authorizeReferences(
        result.allReferences,
        policyContext
      );

      // Add policy decisions to metadata
      result.metadata.policyDecisions = [authDecision.reason];

      // Log assembly
      this.log.logAssembly(
        query.queryId,
        sections.length,
        result.allReferences.length,
        result.lineageChains?.length || 0,
        result.impactMap ? 1 : 0
      );

      // Calculate final execution time
      const executionTime = Date.now() - startTime;
      result.summary.queryExecutionTime = executionTime;

      // Log query completion
      this.log.logQuery(query, 'completed', executionTime);

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log error
      this.log.logError(query.queryId, errorMessage);

      throw error;
    }
  }

  // ==========================================================================
  // EXAMPLE QUERY BUILDERS
  // ==========================================================================

  /**
   * Build entity lookup query
   */
  public buildEntityLookupQuery(
    entityId: string,
    entityType: string,
    performedBy: string
  ): HubQuery {
    return {
      queryId: this.generateQueryId(),
      queryType: 'entity-lookup',
      queryText: `Lookup entity: ${entityId}`,
      entityId,
      entityType,
      scope: {
        tenantId: this.tenantId,
      },
      options: {
        maxResultsPerEngine: 50,
        includeReferences: true,
        includeLineage: true,
        includeImpact: true,
        format: 'detailed',
      },
      performedBy,
      performedAt: new Date().toISOString(),
    };
  }

  /**
   * Build cross-engine summary query
   */
  public buildCrossEngineSummaryQuery(
    queryText: string,
    facilityId: string | undefined,
    performedBy: string
  ): HubQuery {
    return {
      queryId: this.generateQueryId(),
      queryType: 'cross-engine-summary',
      queryText,
      scope: {
        tenantId: this.tenantId,
        facilityId,
      },
      options: {
        maxResultsPerEngine: 20,
        includeReferences: true,
        includeLineage: false,
        includeImpact: false,
        format: 'summary',
      },
      performedBy,
      performedAt: new Date().toISOString(),
    };
  }

  /**
   * Build incident overview query
   */
  public buildIncidentOverviewQuery(
    incidentId: string,
    performedBy: string
  ): HubQuery {
    return {
      queryId: this.generateQueryId(),
      queryType: 'incident-overview',
      queryText: `Incident overview: ${incidentId}`,
      entityId: incidentId,
      entityType: 'incident',
      scope: {
        tenantId: this.tenantId,
      },
      options: {
        maxResultsPerEngine: 100,
        includeReferences: true,
        includeLineage: true,
        includeImpact: true,
        format: 'detailed',
      },
      performedBy,
      performedAt: new Date().toISOString(),
    };
  }

  /**
   * Build lineage trace query
   */
  public buildLineageTraceQuery(
    entityId: string,
    entityType: string,
    performedBy: string
  ): HubQuery {
    return {
      queryId: this.generateQueryId(),
      queryType: 'lineage-trace',
      queryText: `Trace lineage for: ${entityId}`,
      entityId,
      entityType,
      scope: {
        tenantId: this.tenantId,
      },
      filters: {
        engines: ['knowledge-graph', 'governance-history', 'fabric', 'health'],
      },
      options: {
        maxResultsPerEngine: 50,
        includeReferences: true,
        includeLineage: true,
        includeImpact: false,
        format: 'detailed',
      },
      performedBy,
      performedAt: new Date().toISOString(),
    };
  }

  /**
   * Build impact analysis query
   */
  public buildImpactAnalysisQuery(
    entityId: string,
    entityType: string,
    performedBy: string
  ): HubQuery {
    return {
      queryId: this.generateQueryId(),
      queryType: 'impact-analysis',
      queryText: `Analyze impact for: ${entityId}`,
      entityId,
      entityType,
      scope: {
        tenantId: this.tenantId,
      },
      filters: {
        engines: ['fabric', 'knowledge-graph', 'analytics', 'insights', 'health'],
      },
      options: {
        maxResultsPerEngine: 50,
        includeReferences: true,
        includeLineage: true,
        includeImpact: true,
        format: 'detailed',
      },
      performedBy,
      performedAt: new Date().toISOString(),
    };
  }

  /**
   * Build governance explanation query
   */
  public buildGovernanceExplanationQuery(
    decisionId: string,
    performedBy: string
  ): HubQuery {
    return {
      queryId: this.generateQueryId(),
      queryType: 'governance-explanation',
      queryText: `Explain governance decision: ${decisionId}`,
      entityId: decisionId,
      entityType: 'governance-decision',
      scope: {
        tenantId: this.tenantId,
      },
      filters: {
        engines: ['governance', 'governance-history', 'narrative', 'documentation'],
      },
      options: {
        maxResultsPerEngine: 50,
        includeReferences: true,
        includeLineage: true,
        includeImpact: false,
        format: 'detailed',
      },
      performedBy,
      performedAt: new Date().toISOString(),
    };
  }

  /**
   * Build documentation bundle query
   */
  public buildDocumentationBundleQuery(
    topic: string,
    performedBy: string
  ): HubQuery {
    return {
      queryId: this.generateQueryId(),
      queryType: 'documentation-bundle',
      queryText: `Get documentation for: ${topic}`,
      scope: {
        tenantId: this.tenantId,
      },
      filters: {
        engines: ['documentation', 'training', 'marketplace', 'narrative'],
      },
      options: {
        maxResultsPerEngine: 30,
        includeReferences: true,
        includeLineage: false,
        includeImpact: false,
        format: 'summary',
      },
      performedBy,
      performedAt: new Date().toISOString(),
    };
  }

  /**
   * Build fabric neighborhood query
   */
  public buildFabricNeighborhoodQuery(
    entityId: string,
    entityType: string,
    performedBy: string
  ): HubQuery {
    return {
      queryId: this.generateQueryId(),
      queryType: 'fabric-neighborhood',
      queryText: `Get fabric neighborhood for: ${entityId}`,
      entityId,
      entityType,
      scope: {
        tenantId: this.tenantId,
      },
      filters: {
        engines: ['fabric', 'knowledge-graph', 'search'],
      },
      options: {
        maxResultsPerEngine: 50,
        includeReferences: true,
        includeLineage: true,
        includeImpact: false,
        format: 'detailed',
      },
      performedBy,
      performedAt: new Date().toISOString(),
    };
  }

  // ==========================================================================
  // STATISTICS & LOGS
  // ==========================================================================

  /**
   * Get hub statistics
   */
  public getStatistics(): HubStatistics {
    return this.log.getStatistics();
  }

  /**
   * Get hub log entries
   */
  public getLog() {
    return this.log;
  }

  /**
   * Export log
   */
  public exportLog(filters?: any): string {
    return this.log.exportLog(filters);
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Build policy context from query
   */
  private buildPolicyContext(query: HubQuery): HubPolicyContext {
    // In production, this would fetch user roles/permissions from auth system
    // For now, create a permissive context
    return {
      tenantId: query.scope.tenantId,
      facilityId: query.scope.facilityId,
      roomId: query.scope.roomId,
      performedBy: query.performedBy,
      userRoles: ['operator', 'admin'],
      userPermissions: [
        'search.read',
        'knowledgegraph.read',
        'narrative.read',
        'timeline.read',
        'analytics.read',
        'training.read',
        'marketplace.read',
        'insights.read',
        'health.read',
        'governance.read',
        'fabric.read',
        'documentation.read',
        'facility.read',
        'room.read',
      ],
    };
  }

  /**
   * Build assembly config from query
   */
  private buildAssemblyConfig(query: HubQuery): HubAssemblyConfig {
    return {
      mergeDuplicateReferences: true,
      buildLineageChains: query.options?.includeLineage || false,
      buildImpactMaps: query.options?.includeImpact || false,
      sortReferencesByRelevance: true,
      includeMetadata: true,
      maxReferencesPerSection: query.options?.maxResultsPerEngine || 50,
    };
  }

  /**
   * Generate unique query ID
   */
  private generateQueryId(): string {
    return `hub-query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
