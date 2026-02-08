/**
 * Phase 42: Operator Insights & Knowledge Packs — Type Definitions
 * 
 * Defines all types for the Insights system:
 * - Insight: Individual insights derived from historical data
 * - KnowledgePack: Curated bundles of related insights
 * - InsightReference: Links to source data (Phases 34, 37, 38, 39, 40)
 * - InsightQuery: Query parameters for insight generation
 * - InsightsLogEntry: Audit log for all insight operations
 */

// Insight Categories (8 types)
export type InsightCategory = 
  | 'incident-patterns'
  | 'sop-usage'
  | 'capa-recurrence'
  | 'environmental-exceptions'
  | 'training-performance'
  | 'operational-rhythms'
  | 'cross-facility-comparison'
  | 'operator-readiness';

// Insight Reference Types
export type InsightReferenceType = 
  | 'analytics-cluster'
  | 'sop'
  | 'capa'
  | 'deviation'
  | 'incident'
  | 'training-module'
  | 'timeline-event'
  | 'knowledge-graph-entity'
  | 'narrative-explanation'
  | 'pattern-pack';

// Insight Severity / Applicability
export type InsightApplicability = 'critical' | 'high' | 'medium' | 'low' | 'informational';

// Single Insight Definition
export interface Insight {
  insightId: string;
  category: InsightCategory;
  title: string;
  description: string;
  summary: string;
  key_findings: string[];
  applicability: InsightApplicability;
  tenantId: string;
  facilityId?: string;
  knowledgePackId?: string;
  createdAt: string;
  expiresAt?: string;
  sources: InsightReference[];
  rationale: string;
  safety_notes?: string[];
  actionable_recommendations?: string[];
  relatedInsightIds: string[];
}

// Insight Reference (Link to source data)
export interface InsightReference {
  referenceId: string;
  referenceType: InsightReferenceType;
  title: string;
  description: string;
  sourcePhase: number; // 34, 37, 38, 39, 40, etc.
  dataPoints?: Record<string, any>;
  url?: string;
  timestamp?: string;
  confidence?: number; // 0-1, how confident this reference is
}

// Knowledge Pack Section
export interface KnowledgePackSection {
  sectionId: string;
  title: string;
  description: string;
  content: string;
  insights: Insight[];
  references: InsightReference[];
  order: number;
}

// Knowledge Pack
export interface KnowledgePack {
  packId: string;
  name: string;
  description: string;
  category: InsightCategory | 'multi-category';
  version: string;
  publishedAt: string;
  tenantId: string;
  facilityId?: string;
  sections: KnowledgePackSection[];
  overview: string;
  key_insights: string[];
  prerequisites?: string[];
  estimated_read_time_minutes: number;
  is_featured: boolean;
  is_active: boolean;
  access_count: number;
  last_accessed_at?: string;
}

// Insight Query (Parameters for insight generation)
export interface InsightQuery {
  tenantId: string;
  facilityId?: string;
  insightCategory?: InsightCategory;
  knowledgePackId?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  limit?: number;
  offset?: number;
  includeReferences?: boolean;
  includeRelated?: boolean;
  filters?: Record<string, any>;
}

// Query Results with Metadata
export interface InsightQueryResult {
  insights: Insight[];
  knowledgePacks: KnowledgePack[];
  totalCount: number;
  filteredCount: number;
  executionTimeMs: number;
  query: InsightQuery;
  tenant_scope: {
    tenantId: string;
    facilityId?: string;
    authorized: boolean;
  };
  federation_scope?: {
    allowedTenantIds?: string[];
    crossFacilityAllowed: boolean;
  };
}

// Insight Assembly Result
export interface InsightResult {
  insightId: string;
  query: InsightQuery;
  insights: Insight[];
  primary_insight?: Insight;
  supporting_insights: Insight[];
  related_packs: KnowledgePack[];
  summary: string;
  narrative_explanation?: string;
  structured_sections: {
    title: string;
    content: string;
    references: InsightReference[];
  }[];
  all_references: InsightReference[];
  generated_at: string;
  valid_until: string;
  is_read_only: boolean;
  tenant_scoped: boolean;
}

// Log Entry Types (14 types)
export type InsightsLogEntryType = 
  | 'query-initiated'
  | 'query-completed'
  | 'pack-generated'
  | 'pack-accessed'
  | 'insight-assembled'
  | 'reference-linked'
  | 'phase-37-integrated'
  | 'phase-38-integrated'
  | 'phase-39-integrated'
  | 'phase-40-integrated'
  | 'federation-rule-applied'
  | 'tenant-isolation-enforced'
  | 'export-generated'
  | 'error';

// Insights Log Entry
export interface InsightsLogEntry {
  logId: string;
  timestamp: string;
  entryType: InsightsLogEntryType;
  tenantId: string;
  facilityId?: string;
  action: string;
  target_insight_id?: string;
  target_pack_id?: string;
  references_used: InsightReference[];
  context: Record<string, any>;
  result: 'success' | 'partial' | 'failed';
  error_message?: string;
  execution_time_ms?: number;
}

// Insights Engine Interface
export interface InsightsEngineInterface {
  queryInsights(query: InsightQuery): Promise<InsightQueryResult>;
  assembleInsight(query: InsightQuery): Promise<InsightResult>;
  getKnowledgePack(packId: string, tenantId: string): Promise<KnowledgePack | null>;
  listKnowledgePacks(tenantId: string, facilityId?: string): Promise<KnowledgePack[]>;
  getInsight(insightId: string, tenantId: string): Promise<Insight | null>;
  getInsightsByCategory(category: InsightCategory, tenantId: string): Promise<Insight[]>;
  recordInsightAccess(insightId: string | packId: string, tenantId: string): Promise<void>;
  getInsightsLog(tenantId: string, facilityId?: string, limit?: number): Promise<InsightsLogEntry[]>;
  initializeInsights(tenantIds: string[]): Promise<void>;
}

// Helper: Knowledge Pack Metadata
export interface KnowledgePackMetadata {
  packId: string;
  name: string;
  category: InsightCategory | 'multi-category';
  version: string;
  sources_phases: number[];
  is_curated: boolean;
  is_deterministic: boolean;
}

// Helper: Insight Statistics
export interface InsightStatistics {
  total_insights: number;
  by_category: Record<InsightCategory, number>;
  by_applicability: Record<InsightApplicability, number>;
  total_knowledge_packs: number;
  featured_packs: number;
  total_references: number;
  unique_source_phases: number[];
  average_pack_read_time: number;
}

// Helper: Tenant Federation Rules (for insight access)
export interface InsightAccessRule {
  tenantId: string;
  allowedCategories: InsightCategory[];
  allowedPhases: number[];
  maxFacilityScope: 'single' | 'multi';
  requiresFederationAgreement: boolean;
  compliance_level_required?: 'basic' | 'standard' | 'advanced';
}
