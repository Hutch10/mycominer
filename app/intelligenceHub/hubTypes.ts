/**
 * Phase 48: Operator Intelligence Hub - Type Definitions
 * 
 * Deterministic, read-only unified cross-engine assistant.
 * Queries 13 engines and assembles comprehensive responses.
 * 
 * CRITICAL CONSTRAINTS:
 * - No generative AI content
 * - No invented examples or synthetic data
 * - All responses grounded in real system data
 * - Tenant isolation strictly enforced
 * - All operations logged
 */

// ============================================================================
// SOURCE ENGINES
// ============================================================================

export type HubSourceEngine =
  | 'search'           // Phase 35: Search Engine
  | 'knowledge-graph'  // Phase 34: Knowledge Graph
  | 'narrative'        // Phase 37: Narrative Engine
  | 'timeline'         // Phase 38: Timeline Engine
  | 'analytics'        // Phase 39: Analytics Engine
  | 'training'         // Phase 40: Training Engine
  | 'marketplace'      // Phase 41: Marketplace Engine
  | 'insights'         // Phase 42: Insights Engine
  | 'health'           // Phase 43: Health & Integrity Monitoring
  | 'governance'       // Phase 44: Governance Engine
  | 'governance-history' // Phase 45: Governance History
  | 'fabric'           // Phase 46: Data Fabric
  | 'documentation';   // Phase 47: Documentation Engine

// ============================================================================
// QUERY TYPES
// ============================================================================

export type HubQueryType =
  | 'entity-lookup'          // Find all info about a specific entity
  | 'cross-engine-summary'   // Summarize across all engines
  | 'incident-overview'      // Full incident details with related data
  | 'lineage-trace'          // Trace lineage across engines
  | 'impact-analysis'        // Analyze impact of changes/decisions
  | 'governance-explanation' // Explain governance decisions
  | 'documentation-bundle'   // Retrieve all docs for a topic
  | 'fabric-neighborhood';   // Get fabric-connected entities

// ============================================================================
// QUERY SCOPE
// ============================================================================

export interface HubQueryScope {
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  includeArchived?: boolean;
  includeDrafts?: boolean;
}

// ============================================================================
// QUERY FILTERS
// ============================================================================

export interface HubQueryFilters {
  engines?: HubSourceEngine[];      // Limit to specific engines
  entityTypes?: string[];            // Filter by entity type
  timeRange?: {                      // Time-based filtering
    startDate: string;
    endDate: string;
  };
  severity?: string[];               // Filter by severity (incidents, alerts)
  status?: string[];                 // Filter by status
  authors?: string[];                // Filter by author/performer
  tags?: string[];                   // Filter by tags
}

// ============================================================================
// HUB QUERY
// ============================================================================

export interface HubQuery {
  queryId: string;
  queryType: HubQueryType;
  queryText: string;                 // Natural language query
  entityId?: string;                 // Target entity ID (if applicable)
  entityType?: string;               // Target entity type
  scope: HubQueryScope;
  filters?: HubQueryFilters;
  options?: {
    maxResultsPerEngine?: number;    // Limit results per engine
    includeReferences?: boolean;     // Include cross-references
    includeLineage?: boolean;        // Include lineage data
    includeImpact?: boolean;         // Include impact analysis
    format?: 'summary' | 'detailed'; // Result format
  };
  performedBy: string;
  performedAt: string;
}

// ============================================================================
// HUB REFERENCE
// ============================================================================

export interface HubReference {
  referenceId: string;
  referenceType: 'entity' | 'incident' | 'pattern' | 'training' | 'asset' | 'decision' | 'document';
  entityId: string;
  entityType: string;
  title: string;
  description?: string;
  sourceEngine: HubSourceEngine;
  relationshipType?: string;         // How it relates to the query
  metadata: {
    createdAt?: string;
    updatedAt?: string;
    author?: string;
    status?: string;
    severity?: string;
    [key: string]: any;
  };
}

// ============================================================================
// HUB SECTION
// ============================================================================

export interface HubSection {
  sectionId: string;
  sourceEngine: HubSourceEngine;
  title: string;
  summary: string;
  data: any;                         // Engine-specific data
  references: HubReference[];
  metadata: {
    queryTime: number;               // milliseconds
    resultCount: number;
    hasMoreResults: boolean;
    errors?: string[];
  };
}

// ============================================================================
// HUB LINEAGE CHAIN
// ============================================================================

export interface HubLineageNode {
  entityId: string;
  entityType: string;
  title: string;
  sourceEngine: HubSourceEngine;
  relationshipType: string;
  metadata: Record<string, any>;
}

export interface HubLineageChain {
  chainId: string;
  startEntity: HubLineageNode;
  endEntity: HubLineageNode;
  intermediateNodes: HubLineageNode[];
  totalDepth: number;
}

// ============================================================================
// HUB IMPACT MAP
// ============================================================================

export interface HubImpactNode {
  entityId: string;
  entityType: string;
  title: string;
  sourceEngine: HubSourceEngine;
  impactType: 'upstream' | 'downstream' | 'peer';
  impactSeverity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

export interface HubImpactMap {
  mapId: string;
  targetEntity: {
    entityId: string;
    entityType: string;
    title: string;
  };
  upstreamImpacts: HubImpactNode[];
  downstreamImpacts: HubImpactNode[];
  peerImpacts: HubImpactNode[];
  totalImpactScore: number;          // 0-100
}

// ============================================================================
// HUB RESULT
// ============================================================================

export interface HubResult {
  resultId: string;
  query: HubQuery;
  sections: HubSection[];
  
  // Unified cross-engine data
  allReferences: HubReference[];
  lineageChains?: HubLineageChain[];
  impactMap?: HubImpactMap;
  
  // Summary
  summary: {
    totalEnginesQueried: number;
    enginesWithResults: HubSourceEngine[];
    totalReferences: number;
    totalLineageChains: number;
    queryExecutionTime: number;      // milliseconds
  };
  
  // Metadata
  metadata: {
    policyDecisions: string[];       // Policy enforcement log
    errors: Array<{
      engine: HubSourceEngine;
      error: string;
    }>;
    warnings: string[];
  };
  
  performedAt: string;
  performedBy: string;
}

// ============================================================================
// HUB LOG ENTRY
// ============================================================================

export interface HubLogEntry {
  entryId: string;
  entryType: 'query' | 'routing' | 'assembly' | 'policy-decision' | 'error';
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  
  // Query details
  query?: {
    queryId: string;
    queryType: HubQueryType;
    queryText: string;
    scope: HubQueryScope;
  };
  
  // Routing details
  routing?: {
    routedEngines: HubSourceEngine[];
    routingDecisions: string[];
  };
  
  // Assembly details
  assembly?: {
    sectionsAssembled: number;
    referencesCollected: number;
    lineageChainsBuilt: number;
    impactMapsGenerated: number;
  };
  
  // Policy details
  policyDecision?: {
    decision: 'allow' | 'deny' | 'partial';
    reason: string;
    affectedEngines: HubSourceEngine[];
  };
  
  // Error details
  error?: {
    engine?: HubSourceEngine;
    message: string;
    stack?: string;
  };
  
  performedBy: string;
  executionTime?: number;
  success: boolean;
}

// ============================================================================
// HUB STATISTICS
// ============================================================================

export interface HubStatistics {
  totalQueries: number;
  queriesByType: Record<HubQueryType, number>;
  queriesByEngine: Record<HubSourceEngine, number>;
  averageQueryTime: number;
  averageSectionsPerQuery: number;
  averageReferencesPerQuery: number;
  totalPolicyDenials: number;
  totalErrors: number;
  mostQueriedEngine: HubSourceEngine;
  mostUsedQueryType: HubQueryType;
  queriesLast24Hours: number;
}

// ============================================================================
// HUB POLICY CONTEXT
// ============================================================================

export interface HubPolicyContext {
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  performedBy: string;
  userRoles: string[];
  userPermissions: string[];
  federationTenants?: string[];      // For federated queries
}

// ============================================================================
// HUB ROUTING DECISION
// ============================================================================

export interface HubRoutingDecision {
  engine: HubSourceEngine;
  shouldRoute: boolean;
  reason: string;
  policyAllowed: boolean;
  hasRelevantData: boolean;
}

// ============================================================================
// HUB ASSEMBLY CONFIG
// ============================================================================

export interface HubAssemblyConfig {
  mergeDuplicateReferences: boolean;
  buildLineageChains: boolean;
  buildImpactMaps: boolean;
  sortReferencesByRelevance: boolean;
  includeMetadata: boolean;
  maxReferencesPerSection: number;
}

// ============================================================================
// ENGINE QUERY PARAMS (for routing)
// ============================================================================

export interface EngineQueryParams {
  engine: HubSourceEngine;
  params: Record<string, any>;
  scope: HubQueryScope;
  filters?: HubQueryFilters;
}

// ============================================================================
// EXPORTS
// ============================================================================

// Types are already exported via individual export declarations above
