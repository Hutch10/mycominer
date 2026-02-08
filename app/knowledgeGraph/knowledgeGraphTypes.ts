// Phase 34: Global Knowledge Graph & Semantic Federation types
// Deterministic, read-only semantic layer respecting tenant boundaries

export type KGNodeType =
  | 'workflow'
  | 'resource'
  | 'facility'
  | 'room'
  | 'equipment'
  | 'sop'
  | 'complianceEvent'
  | 'deviation'
  | 'capa'
  | 'telemetryStream'
  | 'forecast'
  | 'sandboxScenario'
  | 'plugin'
  | 'digitalTwinSnapshot';

export type KGEdgeType =
  | 'dependsOn'
  | 'locatedIn'
  | 'usesResource'
  | 'implements'
  | 'observes'
  | 'covers'
  | 'relatesTo'
  | 'resolves'
  | 'feeds'
  | 'simulatedBy'
  | 'providedBy'
  | 'mirrors'
  | 'federatedShare';

export interface KGNode {
  id: string;
  type: KGNodeType;
  name: string;
  tenantId: string;
  facilityId?: string;
  tags?: string[];
  relatedIds?: string[];
  sourceSystem: string;
  metadata?: Record<string, unknown>;
}

export interface KGEdge {
  id: string;
  from: string;
  to: string;
  type: KGEdgeType;
  label?: string;
  tenantId: string;
  federated?: boolean;
  metadata?: Record<string, unknown>;
}

export interface KGContext {
  tenantId: string;
  federatedTenantIds?: string[];
  scope: 'tenant' | 'federated';
}

export interface KGQuery {
  scope: 'tenant' | 'federated';
  tenantId: string;
  federatedTenantIds?: string[];
  nodeTypes?: KGNodeType[];
  facilities?: string[];
  tenants?: string[];
  tags?: string[];
  anchorId?: string;
  relationships?: KGEdgeType[];
  maxDepth?: number;
  maxNodes?: number;
}

export interface KGResult {
  nodes: KGNode[];
  edges: KGEdge[];
  scope: 'tenant' | 'federated';
  context: KGContext;
  summary?: string;
}

export type KnowledgeGraphLogCategory = 'build' | 'query' | 'access' | 'federation';

export interface KnowledgeGraphLogEntry {
  entryId: string;
  timestamp: string;
  category: KnowledgeGraphLogCategory;
  message: string;
  context?: Record<string, unknown>;
}
