/**
 * Phase 47: Autonomous Documentation Engine - Type Definitions
 * 
 * Deterministic documentation synthesis from real system metadata.
 * No generative AI, no invented content, no predictions.
 */

// ============================================================================
// DOCUMENTATION CATEGORIES
// ============================================================================

export type DocumentationCategory =
  | 'engine-summary'
  | 'asset-documentation'
  | 'lineage-documentation'
  | 'compliance-documentation'
  | 'operational-documentation'
  | 'system-overview'
  | 'cross-engine-analysis';

// ============================================================================
// ENGINE TYPES (FROM ALL PHASES)
// ============================================================================

export type DocumentationEngineType =
  | 'knowledgeGraph'        // Phase 34
  | 'search'                // Phase 35
  | 'copilot'               // Phase 36
  | 'narrative'             // Phase 37
  | 'timeline'              // Phase 38
  | 'analytics'             // Phase 39
  | 'training'              // Phase 40
  | 'marketplace'           // Phase 41
  | 'insights'              // Phase 42
  | 'health'                // Phase 43
  | 'governance'            // Phase 44
  | 'governanceHistory'     // Phase 45
  | 'fabric'                // Phase 46
  | 'compliance';           // Phase 32

// ============================================================================
// ASSET TYPES
// ============================================================================

export type DocumentationAssetType =
  | 'sop'
  | 'workflow'
  | 'training-module'
  | 'training-step'
  | 'training-certification'
  | 'knowledge-pack'
  | 'insight'
  | 'marketplace-asset'
  | 'marketplace-vendor'
  | 'governance-role'
  | 'governance-permission'
  | 'governance-policy'
  | 'governance-change'
  | 'health-finding'
  | 'health-drift'
  | 'integrity-issue'
  | 'analytics-pattern'
  | 'analytics-cluster'
  | 'analytics-trend'
  | 'timeline-event'
  | 'kg-node'
  | 'fabric-node';

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export type DocumentationTemplateType =
  | 'engine-overview'
  | 'asset-summary'
  | 'cross-engine-link-summary'
  | 'governance-lineage-report'
  | 'health-drift-summary'
  | 'training-module-documentation'
  | 'knowledge-pack-documentation'
  | 'marketplace-asset-documentation'
  | 'compliance-report'
  | 'operational-summary'
  | 'system-overview'
  | 'timeline-event-summary'
  | 'analytics-pattern-documentation'
  | 'fabric-link-documentation';

// ============================================================================
// SCOPE
// ============================================================================

export type DocumentationScope = 'global' | 'tenant' | 'facility' | 'room' | 'asset';

export interface DocumentationScopeContext {
  scope: DocumentationScope;
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  assetId?: string;
}

// ============================================================================
// DOCUMENTATION TEMPLATE
// ============================================================================

export interface DocumentationTemplate {
  id: string;
  templateType: DocumentationTemplateType;
  name: string;
  description: string;
  category: DocumentationCategory;
  sections: TemplateSection[];
  requiredMetadata: string[];
  optionalMetadata: string[];
  supportedEngines: DocumentationEngineType[];
  supportedAssetTypes: DocumentationAssetType[];
  created: string;
  version: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  order: number;
  required: boolean;
  placeholder: string;
  metadataFields: string[];
  formatting: 'text' | 'list' | 'table' | 'code' | 'json';
  subSections?: TemplateSection[];
}

// ============================================================================
// DOCUMENTATION QUERY
// ============================================================================

export interface DocumentationQuery {
  queryType: DocumentationQueryType;
  scope: DocumentationScopeContext;
  filters: DocumentationQueryFilters;
  options?: DocumentationQueryOptions;
}

export type DocumentationQueryType =
  | 'generate-engine-documentation'
  | 'generate-asset-documentation'
  | 'generate-lineage-documentation'
  | 'generate-compliance-documentation'
  | 'generate-operational-documentation'
  | 'generate-system-overview';

export interface DocumentationQueryFilters {
  engineType?: DocumentationEngineType;
  assetType?: DocumentationAssetType;
  assetId?: string;
  templateType?: DocumentationTemplateType;
  includeReferences?: boolean;
  includeMetadata?: boolean;
  includeHistory?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface DocumentationQueryOptions {
  format?: 'markdown' | 'html' | 'json' | 'pdf';
  includeTableOfContents?: boolean;
  includeTimestamp?: boolean;
  includePerformer?: boolean;
  maxDepth?: number;
}

// ============================================================================
// DOCUMENTATION RESULT
// ============================================================================

export interface DocumentationResult {
  id: string;
  queryType: DocumentationQueryType;
  templateType: DocumentationTemplateType;
  title: string;
  description: string;
  category: DocumentationCategory;
  scope: DocumentationScopeContext;
  bundle: DocumentationBundle;
  metadata: DocumentationMetadata;
  executionTimeMs: number;
  generatedAt: string;
  generatedBy: string;
}

export interface DocumentationBundle {
  sections: DocumentationSection[];
  references: DocumentationReference[];
  tableOfContents?: TableOfContentsEntry[];
  totalSections: number;
  totalReferences: number;
  totalMetadataFields: number;
}

export interface DocumentationSection {
  id: string;
  title: string;
  order: number;
  level: number;
  content: string;
  contentType: 'text' | 'list' | 'table' | 'code' | 'json';
  metadataSource: MetadataSource[];
  references: string[];
  subSections?: DocumentationSection[];
  lastUpdated: string;
}

export interface MetadataSource {
  engineType: DocumentationEngineType;
  sourcePhase: number;
  sourceAssetType?: DocumentationAssetType;
  sourceAssetId?: string;
  fieldName: string;
  fieldValue: any;
  extractedAt: string;
}

export interface DocumentationReference {
  id: string;
  referenceType: ReferenceType;
  targetEngine: DocumentationEngineType;
  targetPhase: number;
  targetAssetType?: DocumentationAssetType;
  targetAssetId: string;
  targetAssetName: string;
  description: string;
  scope: DocumentationScopeContext;
  visibility: 'public' | 'tenant' | 'facility' | 'room' | 'private';
}

export type ReferenceType =
  | 'engine-reference'
  | 'asset-reference'
  | 'lineage-reference'
  | 'compliance-reference'
  | 'cross-engine-reference'
  | 'fabric-link-reference';

export interface TableOfContentsEntry {
  id: string;
  title: string;
  level: number;
  order: number;
  sectionId: string;
}

// ============================================================================
// DOCUMENTATION METADATA
// ============================================================================

export interface DocumentationMetadata {
  templateUsed: string;
  templateVersion: string;
  metadataSources: MetadataSource[];
  totalEnginesQueried: number;
  enginesQueried: DocumentationEngineType[];
  totalFieldsExtracted: number;
  policyEvaluations: DocumentationPolicyEvaluation[];
  generatedAt: string;
  generatedBy: string;
  scope: DocumentationScopeContext;
}

// ============================================================================
// POLICY ENFORCEMENT
// ============================================================================

export interface DocumentationPolicy {
  id: string;
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  conditions: DocumentationPolicyConditions;
  created: string;
  createdBy: string;
}

export interface DocumentationPolicyConditions {
  scope?: DocumentationScope;
  tenantId?: string;
  facilityId?: string;
  category?: DocumentationCategory;
  engineType?: DocumentationEngineType;
  assetType?: DocumentationAssetType;
  requiresFederation?: boolean;
  requiredRole?: string;
}

export interface DocumentationPolicyEvaluation {
  policyId: string;
  policyName: string;
  effect: 'allow' | 'deny';
  decision: 'passed' | 'failed';
  reason: string;
  evaluatedAt: string;
}

// ============================================================================
// DOCUMENTATION LOG
// ============================================================================

export interface DocumentationLogEntry {
  id: string;
  entryType: DocumentationLogEntryType;
  timestamp: string;
  performedBy: string;
  scope: DocumentationScopeContext;
  queryType?: DocumentationQueryType;
  templateType?: DocumentationTemplateType;
  templateId?: string;
  resultId?: string;
  sectionsGenerated?: number;
  referencesGenerated?: number;
  metadataFieldsExtracted?: number;
  enginesQueried?: DocumentationEngineType[];
  executionTimeMs?: number;
  policyEvaluations?: DocumentationPolicyEvaluation[];
  success: boolean;
  errorMessage?: string;
  details?: Record<string, any>;
}

export type DocumentationLogEntryType =
  | 'query'
  | 'template-selection'
  | 'metadata-extraction'
  | 'assembly'
  | 'policy-evaluation'
  | 'error';

// ============================================================================
// STATISTICS
// ============================================================================

export interface DocumentationStatistics {
  totalDocumentsGenerated: number;
  documentsByCategory: Record<DocumentationCategory, number>;
  documentsByTemplate: Record<DocumentationTemplateType, number>;
  documentsByEngine: Record<DocumentationEngineType, number>;
  totalQueriesLast24h: number;
  averageExecutionTimeMs: number;
  totalSectionsGenerated: number;
  totalReferencesGenerated: number;
  totalMetadataFieldsExtracted: number;
  timestamp: string;
}

// ============================================================================
// DASHBOARD STATE
// ============================================================================

export interface DocumentationDashboardState {
  activeTab: 'overview' | 'query' | 'bundles' | 'history';
  selectedQuery: DocumentationQuery | null;
  selectedResult: DocumentationResult | null;
  selectedSection: DocumentationSection | null;
  selectedReference: DocumentationReference | null;
  statistics: DocumentationStatistics;
}
