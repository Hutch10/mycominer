/**
 * Phase 46: Multi-Tenant Data Fabric & Federated Knowledge Mesh
 * TYPE DEFINITIONS
 * 
 * Defines all types for the unified knowledge fabric that spans
 * KG, Search, Timeline, Analytics, Training, Insights, Governance, Health, Marketplace.
 */

// ============================================================================
// FABRIC ENTITY TYPES
// ============================================================================

export type FabricEntityType =
  // Knowledge Graph (Phase 34)
  | 'kg-node'
  | 'kg-relationship'
  
  // Search (Phase 35)
  | 'search-entity'
  | 'search-result'
  
  // Narrative (Phase 37)
  | 'narrative-reference'
  | 'narrative-explanation'
  
  // Timeline (Phase 38)
  | 'timeline-event'
  | 'timeline-milestone'
  
  // Analytics (Phase 39)
  | 'analytics-cluster'
  | 'analytics-pattern'
  | 'analytics-trend'
  
  // Training (Phase 40)
  | 'training-module'
  | 'training-step'
  | 'training-certification'
  
  // Marketplace (Phase 41)
  | 'marketplace-asset'
  | 'marketplace-vendor'
  
  // Insights (Phase 42)
  | 'knowledge-pack'
  | 'insight'
  
  // Health (Phase 43)
  | 'health-finding'
  | 'health-drift'
  | 'integrity-issue'
  
  // Governance (Phase 44)
  | 'governance-role'
  | 'governance-permission'
  | 'governance-policy'
  
  // Governance History (Phase 45)
  | 'governance-change'
  | 'governance-lineage';

// ============================================================================
// FABRIC SCOPE
// ============================================================================

export type FabricScope =
  | 'global'
  | 'tenant'
  | 'facility'
  | 'room'
  | 'engine'
  | 'asset-type';

export interface FabricScopeContext {
  scope: FabricScope;
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  engineId?: string;
  assetTypeId?: string;
}

// ============================================================================
// FABRIC NODE
// ============================================================================

export interface FabricNode {
  id: string;
  entityType: FabricEntityType;
  entityId: string;
  
  // Source engine
  sourceEngine: string; // 'knowledgeGraph', 'search', 'timeline', etc.
  sourcePhase: number;   // 34, 35, 38, etc.
  
  // Scope
  scope: FabricScopeContext;
  
  // Metadata
  name: string;
  description?: string;
  metadata: Record<string, any>;
  
  // Timestamps
  created: string;
  lastModified: string;
  
  // Access control
  visibility: 'public' | 'tenant' | 'facility' | 'restricted';
  federationAllowed: boolean;
}

// ============================================================================
// FABRIC EDGE
// ============================================================================

export type FabricEdgeType =
  | 'derived-from'
  | 'references'
  | 'explains'
  | 'is-related-to'
  | 'is-sourced-from'
  | 'contains'
  | 'uses'
  | 'produces'
  | 'affects'
  | 'triggers';

export interface FabricEdge {
  id: string;
  edgeType: FabricEdgeType;
  
  // Nodes
  fromNodeId: string;
  toNodeId: string;
  fromEntityType: FabricEntityType;
  toEntityType: FabricEntityType;
  
  // Relationship details
  relationshipStrength: number; // 0.0 to 1.0
  relationshipRationale: string;
  
  // Scope
  scope: FabricScopeContext;
  
  // Metadata
  created: string;
  createdBy: string; // 'system' or user ID
  
  // Access control
  visibility: 'public' | 'tenant' | 'facility' | 'restricted';
}

// ============================================================================
// FABRIC QUERY
// ============================================================================

export type FabricQueryType =
  | 'node-by-id'
  | 'nodes-by-type'
  | 'edges-by-node'
  | 'knowledge-for-entity'
  | 'cross-engine-search'
  | 'lineage-trace'
  | 'impact-analysis';

export interface FabricQuery {
  queryType: FabricQueryType;
  
  // Scope
  scope: FabricScopeContext;
  
  // Filters
  filters?: {
    entityId?: string;
    entityType?: FabricEntityType;
    sourceEngine?: string;
    edgeType?: FabricEdgeType;
    minStrength?: number;
    maxDepth?: number;
    includeHidden?: boolean;
  };
  
  // Options
  maxResults?: number;
  includeMetadata?: boolean;
  includeReferences?: boolean;
}

export interface FabricResult {
  queryId: string;
  timestamp: string;
  queryType: FabricQueryType;
  
  // Results
  nodes: FabricNode[];
  edges: FabricEdge[];
  
  // Metadata
  totalNodes: number;
  totalEdges: number;
  executionTimeMs: number;
  
  // References
  references: FabricReference[];
  
  // Policy
  policyEvaluations: FabricPolicyEvaluation[];
}

// ============================================================================
// FABRIC REFERENCE
// ============================================================================

export interface FabricReference {
  referenceType: 'external-link' | 'cross-engine' | 'documentation' | 'related-entity';
  targetEngine: string;
  targetPhase: number;
  targetEntityId: string;
  targetEntityType: FabricEntityType;
  description: string;
  url?: string;
}

// ============================================================================
// FABRIC POLICY
// ============================================================================

export interface FabricPolicy {
  id: string;
  name: string;
  scope: FabricScope;
  
  // Rules
  allowedEntityTypes: FabricEntityType[];
  allowedEdgeTypes: FabricEdgeType[];
  
  // Tenant/Federation
  tenantIsolationRequired: boolean;
  federationAllowed: boolean;
  crossTenantLinks: boolean;
  
  // Visibility
  defaultVisibility: 'public' | 'tenant' | 'facility' | 'restricted';
  
  // Metadata
  created: string;
  createdBy: string;
  active: boolean;
}

export interface FabricPolicyEvaluation {
  policyId: string;
  policyName: string;
  allowed: boolean;
  reason: string;
  timestamp: string;
}

// ============================================================================
// FABRIC LOG
// ============================================================================

export interface FabricLogEntry {
  id: string;
  timestamp: string;
  entryType: 'query' | 'link-generated' | 'policy-evaluation' | 'error';
  
  // Scope
  scope: FabricScopeContext;
  
  // Details
  performedBy: string;
  details: Record<string, any>;
  
  // Query info
  queryId?: string;
  queryType?: FabricQueryType;
  
  // Results
  nodesReturned?: number;
  edgesReturned?: number;
  
  // Performance
  executionTimeMs?: number;
}

// ============================================================================
// FABRIC LINK GENERATION
// ============================================================================

export interface FabricLinkRequest {
  fromEntityId: string;
  fromEntityType: FabricEntityType;
  toEntityId: string;
  toEntityType: FabricEntityType;
  edgeType: FabricEdgeType;
  rationale: string;
  requestedBy: string;
}

export interface FabricLinkResult {
  success: boolean;
  edge?: FabricEdge;
  error?: string;
  policyEvaluations: FabricPolicyEvaluation[];
}

// ============================================================================
// FABRIC STATISTICS
// ============================================================================

export interface FabricStatistics {
  totalNodes: number;
  totalEdges: number;
  nodesByType: Record<FabricEntityType, number>;
  edgesByType: Record<FabricEdgeType, number>;
  nodesByEngine: Record<string, number>;
  queriesLast24h: number;
  linksGeneratedLast24h: number;
}

// ============================================================================
// FABRIC DASHBOARD STATE
// ============================================================================

export interface FabricDashboardState {
  scope: FabricScopeContext;
  activeQuery?: FabricQuery;
  queryResult?: FabricResult;
  selectedNode?: FabricNode;
  selectedEdge?: FabricEdge;
  statistics: FabricStatistics;
}
