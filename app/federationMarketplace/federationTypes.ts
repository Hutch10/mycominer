/**
 * Phase 62: Federation Marketplace & Multi-Tenant Insights
 * 
 * Type definitions for cross-federation benchmarking, analytics, and insights.
 * Enables comparison and analysis across multiple tenants while maintaining strict
 * tenant isolation and privacy controls.
 */

/**
 * Federation represents a group of tenants that have agreed to share
 * anonymized/aggregated data for benchmarking and insights.
 */
export interface Federation {
  federationId: string;
  name: string;
  description: string;
  tenantIds: string[];
  createdAt: Date;
  privacyLevel: 'strict' | 'moderate' | 'open';
  sharingAgreement: SharingAgreement;
  status: 'active' | 'suspended' | 'inactive';
}

/**
 * Defines what data categories can be shared within a federation
 */
export interface SharingAgreement {
  allowedCategories: FederationDataCategory[];
  anonymizationLevel: 'full' | 'partial' | 'minimal';
  aggregationThreshold: number; // Minimum number of tenants before data is shared
  excludedFields: string[]; // Specific fields that should never be shared
  retentionDays: number;
}

/**
 * Categories of data that can be shared across federations
 */
export type FederationDataCategory =
  | 'performance-metrics'      // Aggregate performance data
  | 'compliance-rates'         // Anonymized compliance statistics
  | 'capacity-utilization'     // Resource utilization patterns
  | 'alert-volumes'           // Alert frequency and resolution times
  | 'workflow-efficiency'      // Workflow completion metrics
  | 'training-completion'      // Training completion rates
  | 'audit-findings-summary'   // Aggregated audit statistics
  | 'operator-productivity'    // Anonymized productivity metrics
  | 'cost-benchmarks'         // Anonymized cost data
  | 'quality-metrics';        // Product quality indicators

/**
 * Aggregated metric across a federation
 */
export interface FederationMetric {
  metricId: string;
  federationId: string;
  category: FederationDataCategory;
  metricName: string;
  value: number;
  unit: string;
  aggregationType: 'mean' | 'median' | 'p50' | 'p75' | 'p90' | 'p95' | 'p99' | 'sum' | 'count';
  contributingTenants: number; // Count only, not IDs
  timestamp: Date;
  timeRange: { start: Date; end: Date };
  metadata: Record<string, any>;
}

/**
 * Benchmark comparison between a tenant and federation average
 */
export interface FederationBenchmark {
  benchmarkId: string;
  tenantId: string;
  federationId: string;
  category: FederationDataCategory;
  metricName: string;
  tenantValue: number;
  federationMedian: number;
  federationP25: number;
  federationP75: number;
  tenantPercentile: number; // Where tenant ranks (0-100)
  comparisonStatus: 'above-average' | 'average' | 'below-average' | 'top-quartile' | 'bottom-quartile';
  gap: number; // Difference from median
  timestamp: Date;
}

/**
 * Insight derived from cross-federation analysis
 */
export interface FederationInsight {
  insightId: string;
  federationId: string;
  type: FederationInsightType;
  title: string;
  description: string;
  severity: 'info' | 'recommendation' | 'warning' | 'opportunity';
  affectedCategories: FederationDataCategory[];
  evidence: FederationMetric[];
  recommendations: string[];
  createdAt: Date;
  expiresAt?: Date;
}

export type FederationInsightType =
  | 'performance-opportunity'   // Tenant could improve in specific area
  | 'compliance-gap'           // Tenant below federation compliance norms
  | 'efficiency-leader'        // Tenant is top performer
  | 'cost-optimization'        // Cost reduction opportunity
  | 'capacity-alert'           // Capacity concerns vs peers
  | 'training-gap'             // Training completion below peers
  | 'quality-variance'         // Quality metrics differ from peers
  | 'workflow-bottleneck';     // Workflow slower than federation average

/**
 * Query to retrieve federation data
 */
export interface FederationQuery {
  queryId: string;
  queryType: FederationQueryType;
  federationId?: string;
  tenantId?: string;
  categories?: FederationDataCategory[];
  timeRange?: { start: Date; end: Date };
  aggregationLevel?: 'tenant' | 'facility' | 'federation' | 'cross-federation';
  filters?: Record<string, any>;
  includeAnonymizedData: boolean;
}

export type FederationQueryType =
  | 'list-federations'          // List all federations
  | 'get-federation-metrics'    // Get aggregated metrics for a federation
  | 'get-tenant-benchmarks'     // Get benchmarks for a specific tenant
  | 'get-federation-insights'   // Get insights for a federation
  | 'compare-tenants'           // Compare anonymized tenant data
  | 'trend-analysis'            // Analyze trends over time
  | 'cross-federation-compare'; // Compare across multiple federations

/**
 * Result of a federation query
 */
export interface FederationQueryResult {
  success: boolean;
  queryId: string;
  queryType: FederationQueryType;
  data: FederationResultData;
  metadata: {
    executionTimeMs: number;
    tenantsIncluded: number;
    federationsIncluded: number;
    dataPointsAnalyzed: number;
    timestamp: Date;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Data returned from federation queries
 */
export interface FederationResultData {
  federations?: Federation[];
  metrics?: FederationMetric[];
  benchmarks?: FederationBenchmark[];
  insights?: FederationInsight[];
  trends?: FederationTrend[];
  comparisons?: FederationComparison[];
}

/**
 * Trend analysis over time
 */
export interface FederationTrend {
  trendId: string;
  federationId: string;
  category: FederationDataCategory;
  metricName: string;
  dataPoints: Array<{ timestamp: Date; value: number; }>;
  trendDirection: 'improving' | 'stable' | 'declining';
  changeRate: number; // % change per period
  significance: 'high' | 'medium' | 'low';
}

/**
 * Comparison between entities
 */
export interface FederationComparison {
  comparisonId: string;
  entityAType: 'tenant' | 'federation';
  entityAId: string;
  entityAName?: string; // Anonymized if needed
  entityBType: 'tenant' | 'federation';
  entityBId: string;
  entityBName?: string; // Anonymized if needed
  category: FederationDataCategory;
  metrics: Array<{
    metricName: string;
    entityAValue: number;
    entityBValue: number;
    difference: number;
    differencePercent: number;
  }>;
  winner?: 'entityA' | 'entityB' | 'tie';
  timestamp: Date;
}

/**
 * Privacy-compliant anonymized tenant identifier
 */
export interface AnonymizedTenant {
  anonymizedId: string; // Hash or generated ID
  federationId: string;
  industrySegment?: string;
  facilitySize?: 'small' | 'medium' | 'large' | 'enterprise';
  region?: string;
  // NO real tenant ID, name, or identifying information
}

/**
 * Federation policy decision
 */
export interface FederationPolicyDecision {
  allowed: boolean;
  reason: string;
  requiredPermissions: string[];
  missingPermissions: string[];
  policyViolations: string[];
  timestamp: Date;
}

/**
 * Federation operation context for policy evaluation
 */
export interface FederationContext {
  performerId: string;
  performerRole: string;
  tenantId?: string;
  federationId?: string;
  permissions: string[];
  timestamp: Date;
}

/**
 * Log entry for federation operations
 */
export interface FederationLogEntry {
  logId: string;
  timestamp: Date;
  operationType: 'query' | 'benchmark' | 'insight-generation' | 'data-sharing' | 'policy-evaluation';
  performerId: string;
  tenantId?: string;
  federationId?: string;
  queryType?: FederationQueryType;
  success: boolean;
  error?: string;
  metadata: Record<string, any>;
}

/**
 * Data anonymization result
 */
export interface AnonymizationResult {
  success: boolean;
  originalRecordCount: number;
  anonymizedRecordCount: number;
  fieldsRemoved: string[];
  aggregationApplied: boolean;
  privacyLevel: 'full' | 'partial' | 'minimal';
}
