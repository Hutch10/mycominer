/**
 * Phase 43: System Health, Drift Detection & Integrity Monitoring
 * TYPE DEFINITIONS
 * 
 * Defines all types for health checks, drift detection, integrity scanning,
 * policy enforcement, and logging. All operations are read-only and deterministic.
 */

// ============================================================================
// HEALTH CATEGORIES
// ============================================================================

export type HealthCategory =
  | 'configuration-drift'
  | 'sop-workflow-mismatch'
  | 'stale-orphaned-references'
  | 'kg-link-integrity'
  | 'sandbox-scenario-staleness'
  | 'forecast-metadata-drift'
  | 'compliance-record-consistency'
  | 'cross-engine-schema-alignment'
  | 'tenant-federation-policy-violations';

export type HealthSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

// ============================================================================
// DRIFT DETECTION
// ============================================================================

export interface DriftFinding {
  id: string;
  category: 'configuration-drift';
  severity: HealthSeverity;
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  
  // What drifted
  assetType: 'sop' | 'workflow' | 'resource' | 'facility' | 'sandbox-scenario' | 'forecast-metadata' | 'other';
  assetId: string;
  assetName: string;
  
  // Drift details
  driftType: 'modified' | 'added' | 'removed' | 'version-mismatch';
  fieldsDrifted: string[];
  
  // Comparison
  baseline: Record<string, unknown>;
  current: Record<string, unknown>;
  diff: DriftDiff[];
  
  // Context
  lastKnownGoodTimestamp?: string;
  lastModifiedBy?: string;
  rationale: string;
  
  // References
  references: HealthReference[];
}

export interface DriftDiff {
  field: string;
  baselineValue: unknown;
  currentValue: unknown;
  changeType: 'added' | 'removed' | 'modified';
}

// ============================================================================
// INTEGRITY SCANNING
// ============================================================================

export interface IntegrityFinding {
  id: string;
  category: Exclude<HealthCategory, 'configuration-drift'>;
  severity: HealthSeverity;
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  
  // Issue details
  issueType: 
    | 'missing-kg-node'
    | 'broken-kg-edge'
    | 'stale-timeline-reference'
    | 'orphaned-capa-link'
    | 'orphaned-deviation-link'
    | 'missing-sop-asset'
    | 'outdated-sandbox-workflow'
    | 'inconsistent-schema'
    | 'policy-violation'
    | 'stale-forecast-metadata'
    | 'compliance-record-mismatch';
  
  assetType: string;
  assetId: string;
  assetName: string;
  
  // Problem description
  description: string;
  rationale: string;
  
  // Affected items
  affectedItems: AffectedItem[];
  
  // References
  references: HealthReference[];
  
  // Recommendation (read-only suggestion)
  recommendation?: string;
}

export interface AffectedItem {
  type: string;
  id: string;
  name: string;
  issue: string;
}

// ============================================================================
// HEALTH REFERENCES
// ============================================================================

export interface HealthReference {
  type: 
    | 'sop'
    | 'workflow'
    | 'resource'
    | 'facility'
    | 'kg-node'
    | 'kg-edge'
    | 'timeline-event'
    | 'sandbox-scenario'
    | 'forecast'
    | 'compliance-record'
    | 'capa'
    | 'deviation'
    | 'training-module'
    | 'knowledge-pack'
    | 'incident'
    | 'pattern';
  id: string;
  name: string;
  timestamp?: string;
}

// ============================================================================
// HEALTH CHECKS
// ============================================================================

export interface HealthCheck {
  id: string;
  name: string;
  description: string;
  category: HealthCategory;
  enabled: boolean;
  priority: number;
  
  // Scope
  tenantScoped: boolean;
  facilityScoped: boolean;
  
  // Check configuration
  checkInterval?: number; // minutes
  lastRun?: string;
  nextRun?: string;
}

// ============================================================================
// HEALTH QUERIES
// ============================================================================

export interface HealthQuery {
  id: string;
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  userId: string;
  
  // Query parameters
  queryType: 'full-scan' | 'drift-only' | 'integrity-only' | 'category-specific' | 'asset-specific';
  categories?: HealthCategory[];
  assetTypes?: string[];
  assetIds?: string[];
  
  // Filters
  severityThreshold?: HealthSeverity;
  timeRange?: {
    start: string;
    end: string;
  };
  
  // Description
  description: string;
}

export interface HealthResult {
  queryId: string;
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  
  // Overall status
  overallStatus: HealthStatus;
  
  // Findings
  driftFindings: DriftFinding[];
  integrityFindings: IntegrityFinding[];
  
  // Summary
  summary: HealthSummary;
  
  // References
  references: HealthReference[];
  
  // Metadata
  scanDuration: number; // milliseconds
  checksRun: number;
  
  // Logs
  logEntryIds: string[];
}

export interface HealthSummary {
  totalFindings: number;
  findingsBySeverity: Record<HealthSeverity, number>;
  findingsByCategory: Record<HealthCategory, number>;
  criticalIssues: string[];
  healthScore: number; // 0-100
}

// ============================================================================
// HEALTH LOG
// ============================================================================

export interface HealthLogEntry {
  id: string;
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  userId: string;
  
  // Entry type
  entryType: 'query' | 'drift-finding' | 'integrity-finding' | 'policy-evaluation';
  
  // Content
  queryId?: string;
  findingId?: string;
  
  // Details
  category?: HealthCategory;
  severity?: HealthSeverity;
  description: string;
  
  // Context
  context: Record<string, unknown>;
  
  // References
  references: HealthReference[];
}

// ============================================================================
// HEALTH POLICY
// ============================================================================

export interface HealthPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // Policy type
  policyType: 
    | 'tenant-isolation'
    | 'federation-rule'
    | 'asset-type-constraint'
    | 'cross-engine-consistency'
    | 'compliance-alignment';
  
  // Scope
  tenantIds?: string[];
  facilityIds?: string[];
  assetTypes?: string[];
  
  // Rules
  rules: HealthPolicyRule[];
}

export interface HealthPolicyRule {
  id: string;
  description: string;
  severity: HealthSeverity;
  
  // Evaluation
  evaluationType: 'presence' | 'absence' | 'value-match' | 'relationship' | 'consistency';
  field?: string;
  expectedValue?: unknown;
  
  // Violation message
  violationMessage: string;
}

export interface HealthPolicyEvaluation {
  policyId: string;
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  
  // Result
  passed: boolean;
  violatedRules: HealthPolicyRuleViolation[];
  
  // Context
  evaluatedAssets: number;
  context: Record<string, unknown>;
}

export interface HealthPolicyRuleViolation {
  ruleId: string;
  severity: HealthSeverity;
  violationMessage: string;
  affectedAssets: AffectedItem[];
}

// ============================================================================
// HEALTH DASHBOARD
// ============================================================================

export interface HealthDashboardState {
  tenantId: string;
  facilityId?: string;
  
  // Current status
  currentStatus: HealthStatus;
  lastScan?: string;
  nextScan?: string;
  
  // Recent findings
  recentDriftFindings: DriftFinding[];
  recentIntegrityFindings: IntegrityFinding[];
  
  // Stats
  stats: HealthStats;
  
  // Active checks
  activeChecks: HealthCheck[];
}

export interface HealthStats {
  totalScans: number;
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  healthScore: number;
  
  // By category
  driftFindings: number;
  integrityFindings: number;
  policyViolations: number;
}

// ============================================================================
// BASELINE MANAGEMENT
// ============================================================================

export interface HealthBaseline {
  id: string;
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  
  // Baseline type
  baselineType: 'sop' | 'workflow' | 'resource' | 'facility' | 'sandbox-scenario' | 'forecast-metadata';
  assetId: string;
  assetName: string;
  
  // Snapshot
  snapshot: Record<string, unknown>;
  
  // Metadata
  createdBy: string;
  approved: boolean;
  approvedBy?: string;
  approvalTimestamp?: string;
  
  // Versioning
  version: string;
  previousBaselineId?: string;
}

// ============================================================================
// EXPORTS
// ============================================================================

export interface HealthEngineConfig {
  tenantId: string;
  facilityId?: string;
  enabledCategories: HealthCategory[];
  autoScanInterval?: number; // minutes
  retentionDays: number;
}
