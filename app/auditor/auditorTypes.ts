/**
 * Phase 50: Autonomous System Auditor - Type Definitions
 * 
 * Deterministic, read-only compliance auditing engine.
 * Evaluates cross-engine consistency, workflow/SOP alignment, governance correctness,
 * health drift, documentation completeness, and system compliance.
 * 
 * CRITICAL CONSTRAINTS:
 * - Auditor is fully read-only and deterministic
 * - No biological inference or prediction
 * - All findings derived from real system data
 * - No invented violations, no synthetic examples
 * - Tenant isolation strictly enforced
 */

// ============================================================================
// AUDIT SEVERITY
// ============================================================================

export type AuditSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

// ============================================================================
// AUDIT CATEGORIES
// ============================================================================

export type AuditCategory =
  | 'workflow-sop-alignment'        // Workflow references valid SOPs
  | 'governance-correctness'        // Governance decisions follow rules
  | 'governance-lineage'            // Governance lineage is consistent
  | 'health-drift-validation'       // Health drift matches timeline
  | 'analytics-consistency'         // Analytics patterns are consistent
  | 'documentation-completeness'    // Documentation bundles complete
  | 'fabric-integrity'              // Fabric links resolve correctly
  | 'cross-engine-consistency'      // Metadata consistent across engines
  | 'compliance-pack-validation';   // Compliance packs are valid

// ============================================================================
// AUDIT SCOPE
// ============================================================================

export interface AuditScope {
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  includeArchived?: boolean;
  timePeriod?: {
    startDate: string;
    endDate: string;
  };
}

// ============================================================================
// AUDIT RULE
// ============================================================================

export interface AuditRule {
  ruleId: string;
  ruleName: string;
  ruleDescription: string;
  category: AuditCategory;
  severity: AuditSeverity;
  
  // Rule condition (deterministic only)
  condition: {
    field: string;           // e.g., "workflow.sopReference"
    operator: 'exists' | 'not-exists' | 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'matches-pattern' | 'resolved' | 'not-resolved';
    value?: string | number | boolean;
    pattern?: string;
  };
  
  // Remediation guidance (non-generative)
  remediation?: {
    description: string;
    actionType: 'update-reference' | 'add-metadata' | 'fix-link' | 'complete-documentation' | 'align-workflow' | 'review-governance';
    targetEngine?: string;
  };
  
  metadata: {
    sourceEngine?: string;
    tags: string[];
    enabled: boolean;
    createdAt: string;
    lastModified: string;
  };
}

// ============================================================================
// AUDIT REFERENCE
// ============================================================================

export interface AuditReference {
  referenceId: string;
  referenceType: 'sop' | 'workflow' | 'incident' | 'decision' | 'pattern' | 'module' | 'document' | 'link' | 'entity' | 'compliance-pack';
  entityId: string;
  entityType: string;
  title: string;
  sourceEngine: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// AUDIT FINDING
// ============================================================================

export interface AuditFinding {
  findingId: string;
  rule: AuditRule;
  severity: AuditSeverity;
  category: AuditCategory;
  
  // Finding details
  title: string;
  description: string;
  affectedEntities: AuditReference[];
  relatedReferences: AuditReference[];
  
  // Context
  scope: AuditScope;
  detectedAt: string;
  
  // Evidence (real data only)
  evidence: {
    field: string;
    expectedValue?: unknown;
    actualValue?: unknown;
    additionalContext?: string;
  }[];
  
  // Remediation
  remediation?: {
    description: string;
    actionType: string;
    targetEngine?: string;
    estimatedEffort?: 'low' | 'medium' | 'high';
  };
  
  // Status
  status: 'open' | 'acknowledged' | 'resolved' | 'false-positive';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  
  metadata: Record<string, unknown>;
}

// ============================================================================
// AUDIT QUERY
// ============================================================================

export interface AuditQuery {
  queryId: string;
  queryType: 'full-system' | 'facility' | 'category' | 'rule' | 'entity';
  queryText: string;
  
  scope: AuditScope;
  
  // Filters
  categories?: AuditCategory[];
  severities?: AuditSeverity[];
  ruleIds?: string[];
  entityIds?: string[];
  
  // Options
  options?: {
    includeResolved?: boolean;
    includeFalsePositives?: boolean;
    maxFindings?: number;
    sortBy?: 'severity' | 'category' | 'detectedAt';
    sortOrder?: 'asc' | 'desc';
  };
  
  performedBy: string;
  performedAt: string;
}

// ============================================================================
// AUDIT RESULT
// ============================================================================

export interface AuditResult {
  resultId: string;
  query: AuditQuery;
  
  // Findings
  findings: AuditFinding[];
  totalFindings: number;
  
  // Summary
  summary: {
    findingsByCategory: Record<AuditCategory, number>;
    findingsBySeverity: Record<AuditSeverity, number>;
    affectedEntitiesCount: number;
    rulesEvaluated: number;
    rulesPassed: number;
    rulesFailed: number;
  };
  
  // Metadata
  metadata: {
    executionTime: number;
    evaluatedEngines: string[];
    scope: AuditScope;
    generatedAt: string;
  };
  
  performedBy: string;
}

// ============================================================================
// AUDIT BUNDLE
// ============================================================================

export interface AuditBundle {
  bundleId: string;
  bundleName: string;
  description: string;
  
  // Rules in this bundle
  rules: AuditRule[];
  
  // Compliance context
  complianceFramework?: string; // e.g., "ISO 9001", "GMP"
  regulatoryBody?: string;
  
  metadata: {
    version: string;
    tags: string[];
    enabled: boolean;
    createdAt: string;
    lastModified: string;
  };
}

// ============================================================================
// AUDIT LOG ENTRY
// ============================================================================

export type AuditLogEntryType = 'query' | 'evaluation' | 'finding' | 'policy-decision' | 'error';

export interface AuditLogEntry {
  entryId: string;
  entryType: AuditLogEntryType;
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  
  // Query details
  query?: {
    queryId: string;
    queryType: string;
    queryText: string;
    scope: AuditScope;
  };
  
  // Evaluation details
  evaluation?: {
    ruleId: string;
    ruleName: string;
    category: AuditCategory;
    passed: boolean;
    executionTime: number;
  };
  
  // Finding details
  finding?: {
    findingId: string;
    severity: AuditSeverity;
    category: AuditCategory;
    affectedEntitiesCount: number;
  };
  
  // Policy decision
  policyDecision?: {
    decision: 'allow' | 'deny' | 'partial';
    reason: string;
  };
  
  // Error details
  error?: {
    message: string;
    stack?: string;
  };
  
  performedBy: string;
  executionTime?: number;
  success: boolean;
}

// ============================================================================
// AUDIT STATISTICS
// ============================================================================

export interface AuditStatistics {
  totalAudits: number;
  totalFindings: number;
  
  // By category
  findingsByCategory: Record<AuditCategory, number>;
  
  // By severity
  findingsBySeverity: Record<AuditSeverity, number>;
  
  // Trends
  auditsLast24Hours: number;
  findingsLast24Hours: number;
  averageFindingsPerAudit: number;
  
  // Status distribution
  openFindings: number;
  acknowledgedFindings: number;
  resolvedFindings: number;
  falsePositiveFindings: number;
  
  // Most common
  mostCommonCategory: AuditCategory;
  mostCommonSeverity: AuditSeverity;
  
  // By engine
  findingsByEngine: Record<string, number>;
}

// ============================================================================
// AUDIT POLICY CONTEXT
// ============================================================================

export interface AuditPolicyContext {
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  performedBy: string;
  userRoles: string[];
  userPermissions: string[];
  federationTenants?: string[];
}

// ============================================================================
// AUDIT POLICY DECISION
// ============================================================================

export interface AuditPolicyDecision {
  decision: 'allow' | 'deny' | 'partial';
  reason: string;
  allowedCategories?: AuditCategory[];
  deniedCategories?: AuditCategory[];
}
