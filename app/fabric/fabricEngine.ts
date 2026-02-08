/**
 * Phase 46: Multi-Tenant Data Fabric - Fabric Engine
 * 
 * Orchestrates linking, resolution, and policy evaluation. Central coordination
 * point for all fabric operations.
 */

import {
  FabricQuery,
  FabricResult,
  FabricNode,
  FabricEdge,
  FabricEntityType,
  FabricScopeContext,
  FabricLinkRequest,
  FabricLinkResult,
  FabricStatistics
} from './fabricTypes';
import { FabricLinker } from './fabricLinker';
import { FabricResolver } from './fabricResolver';
import { FabricPolicyEngine } from './fabricPolicyEngine';
import { FabricLog } from './fabricLog';

// ============================================================================
// FABRIC ENGINE CLASS
// ============================================================================

export class FabricEngine {
  private linker: FabricLinker;
  private resolver: FabricResolver;
  private policyEngine: FabricPolicyEngine;
  private log: FabricLog;
  private tenantId: string;
  private facilityId?: string;

  constructor(tenantId: string, facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
    this.linker = new FabricLinker(tenantId, facilityId);
    this.resolver = new FabricResolver(this.linker, tenantId, facilityId);
    this.policyEngine = new FabricPolicyEngine(tenantId);
    this.log = new FabricLog(tenantId, facilityId);
  }

  /**
   * Register a new entity in the fabric
   */
  registerEntity(
    entityId: string,
    entityType: FabricEntityType,
    sourceEngine: string,
    sourcePhase: number,
    name: string,
    scope: FabricScopeContext,
    metadata: Record<string, any> = {},
    performedBy: string = 'system'
  ): FabricNode {
    const node = this.linker.registerNode(
      entityId,
      entityType,
      sourceEngine,
      sourcePhase,
      name,
      scope,
      metadata
    );

    // Generate automatic links
    const autoLinks = this.linker.generateAutomaticLinks(node.id);
    
    if (autoLinks.length > 0) {
      this.log.logLinkGeneration(
        entityId,
        'auto',
        'auto-generated',
        true,
        'system',
        scope
      );
    }

    return node;
  }

  /**
   * Create a link between two entities
   */
  createLink(request: FabricLinkRequest, performedBy: string = 'system'): FabricLinkResult {
    const fromNode = this.linker.getNode(
      this.linker['generateNodeId'](request.fromEntityId, request.fromEntityType)
    );
    const toNode = this.linker.getNode(
      this.linker['generateNodeId'](request.toEntityId, request.toEntityType)
    );

    if (!fromNode || !toNode) {
      this.log.logError(
        'Link creation failed: nodes not found',
        { request },
        performedBy,
        { scope: 'tenant', tenantId: this.tenantId }
      );
      
      return {
        success: false,
        error: 'One or both nodes not found',
        policyEvaluations: []
      };
    }

    // Evaluate policies
    const policyEvaluations = this.policyEngine.evaluateLinkCreation(
      fromNode,
      toNode,
      request.edgeType
    );

    // Check if all policies passed
    const allowed = policyEvaluations.every(e => e.allowed);
    
    if (!allowed) {
      this.log.logLinkGeneration(
        request.fromEntityId,
        request.toEntityId,
        request.edgeType,
        false,
        performedBy,
        fromNode.scope
      );
      
      return {
        success: false,
        error: 'Policy evaluation failed',
        policyEvaluations
      };
    }

    // Create the link
    const result = this.linker.createLink({ ...request, requestedBy: performedBy });
    
    this.log.logLinkGeneration(
      request.fromEntityId,
      request.toEntityId,
      request.edgeType,
      result.success,
      performedBy,
      fromNode.scope
    );

    return result;
  }

  /**
   * Execute a fabric query
   */
  executeQuery(query: FabricQuery, performedBy: string = 'system'): FabricResult {
    // Evaluate query permissions
    const queryEvaluation = this.policyEngine.evaluateQuery(query.scope);
    
    if (!queryEvaluation.allowed) {
      this.log.logError(
        'Query execution denied',
        { query, evaluation: queryEvaluation },
        performedBy,
        query.scope
      );
      
      return {
        queryId: `denied-${Date.now()}`,
        timestamp: new Date().toISOString(),
        queryType: query.queryType,
        nodes: [],
        edges: [],
        totalNodes: 0,
        totalEdges: 0,
        executionTimeMs: 0,
        references: [],
        policyEvaluations: [queryEvaluation]
      };
    }

    // Execute the query
    const result = this.resolver.resolve(query);
    
    // Log the query
    this.log.logQuery(query, result, performedBy);
    
    return result;
  }

  /**
   * Get all nodes
   */
  getAllNodes(): FabricNode[] {
    return this.linker.getAllNodes();
  }

  /**
   * Get all edges
   */
  getAllEdges(): FabricEdge[] {
    return this.linker.getAllEdges();
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: string): FabricNode | undefined {
    return this.linker.getNode(nodeId);
  }

  /**
   * Get edges for a node
   */
  getEdgesForNode(nodeId: string): FabricEdge[] {
    return this.linker.getEdgesForNode(nodeId);
  }

  /**
   * Get statistics
   */
  getStatistics(): FabricStatistics {
    const nodes = this.linker.getAllNodes();
    const edges = this.linker.getAllEdges();
    
    const nodesByType: Record<FabricEntityType, number> = {} as any;
    const nodesByEngine: Record<string, number> = {};
    
    for (const node of nodes) {
      nodesByType[node.entityType] = (nodesByType[node.entityType] || 0) + 1;
      nodesByEngine[node.sourceEngine] = (nodesByEngine[node.sourceEngine] || 0) + 1;
    }
    
    const edgesByType: Record<string, number> = {};
    for (const edge of edges) {
      edgesByType[edge.edgeType] = (edgesByType[edge.edgeType] || 0) + 1;
    }

    const queryStats = this.log.getQueryStatistics();

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodesByType,
      edgesByType: edgesByType as any,
      nodesByEngine,
      queriesLast24h: queryStats.totalQueries,
      linksGeneratedLast24h: this.log.getEntriesByType('link-generated').length
    };
  }

  /**
   * Get log
   */
  getLog(): FabricLog {
    return this.log;
  }

  /**
   * Export fabric data
   */
  exportFabric(): {
    nodes: FabricNode[];
    edges: FabricEdge[];
    statistics: FabricStatistics;
  } {
    return {
      nodes: this.linker.getAllNodes(),
      edges: this.linker.getAllEdges(),
      statistics: this.getStatistics()
    };
  }
}

// ============================================================================
// ENGINE UTILITIES
// ============================================================================

/**
 * Create fabric engine instance
 */
export function createFabricEngine(tenantId: string, facilityId?: string): FabricEngine {
  return new FabricEngine(tenantId, facilityId);
}

/**
 * Initialize fabric with sample data from all engines
 */
export function initializeFabricWithSampleData(engine: FabricEngine): void {
  const tenantId = (engine as any).tenantId;
  const facilityId = (engine as any).facilityId;

  const scope: FabricScopeContext = {
    scope: 'facility',
    tenantId,
    facilityId
  };

  // Register sample entities from various engines
  
  // Knowledge Graph (Phase 34)
  engine.registerEntity(
    'kg-species-001',
    'kg-node',
    'knowledgeGraph',
    34,
    'Pleurotus ostreatus',
    scope,
    { category: 'species', domain: 'mycology' }
  );

  // Training (Phase 40)
  engine.registerEntity(
    'training-module-001',
    'training-module',
    'training',
    40,
    'Sterile Technique Basics',
    scope,
    { level: 'beginner', duration: '45min' }
  );

  // Knowledge Pack (Phase 42)
  engine.registerEntity(
    'kp-contamination-001',
    'knowledge-pack',
    'insights',
    42,
    'Contamination Prevention Guide',
    scope,
    { category: 'troubleshooting', priority: 'high' }
  );

  // Health Finding (Phase 43)
  engine.registerEntity(
    'health-drift-001',
    'health-drift',
    'health',
    43,
    'Temperature Configuration Drift',
    scope,
    { severity: 'medium', engine: 'environment' }
  );

  // Governance Role (Phase 44)
  engine.registerEntity(
    'role-operator-001',
    'governance-role',
    'governance',
    44,
    'Facility Operator',
    scope,
    { permissions: 12, scope: 'facility' }
  );

  // Timeline Event (Phase 38)
  engine.registerEntity(
    'event-harvest-001',
    'timeline-event',
    'timeline',
    38,
    'First Harvest Completed',
    scope,
    { eventType: 'milestone', date: '2026-01-15' }
  );

  // Analytics Pattern (Phase 39)
  engine.registerEntity(
    'pattern-yield-001',
    'analytics-pattern',
    'analytics',
    39,
    'Seasonal Yield Pattern',
    scope,
    { confidence: 0.89, frequency: 'quarterly' }
  );

  console.log('Fabric initialized with sample data from 7 engines');
}
