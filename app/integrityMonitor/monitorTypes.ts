/**
 * Phase 51: Continuous Integrity Monitor - Type Definitions
 * 
 * Deterministic monitoring types for continuous system integrity checks.
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type MonitorSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type MonitorCategory = 
  | 'governance-drift'
  | 'governance-lineage-breakage'
  | 'workflow-sop-drift'
  | 'documentation-completeness-drift'
  | 'fabric-link-breakage'
  | 'cross-engine-metadata-mismatch'
  | 'health-drift'
  | 'analytics-pattern-drift'
  | 'compliance-pack-drift';

export type MonitorFrequency = 'hourly' | 'daily' | 'weekly' | 'manual';

// ============================================================================
// MONITOR SCOPE
// ============================================================================

export interface MonitorScope {
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
// MONITOR RULE
// ============================================================================

export interface MonitorRule {
  ruleId: string;
  ruleName: string;
  ruleDescription: string;
  category: MonitorCategory;
  severity: MonitorSeverity;
  
  // Deterministic condition
  condition: {
    field: string;
    operator: 'exists' | 'not-exists' | 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'matches-pattern' | 'resolved' | 'not-resolved' | 'changed-from' | 'drift-detected';
    value?: string | number | boolean;
    pattern?: string;
    baseline?: unknown; // For drift detection
  };
  
  // Remediation guidance (non-generative)
  remediation?: {
    description: string;
    actionType: string;
    targetEngine?: string;
    estimatedEffort?: 'low' | 'medium' | 'high';
  };
  
  metadata: {
    sourceEngine?: string;
    tags: string[];
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// ============================================================================
// MONITOR REFERENCE
// ============================================================================

export interface MonitorReference {
  referenceId: string;
  referenceType: 'governance-decision' | 'lineage-chain' | 'workflow' | 'sop' | 'document' | 'fabric-link' | 'health-metric' | 'pattern' | 'compliance-pack' | 'entity';
  entityId: string;
  entityType: string;
  title: string;
  sourceEngine: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// MONITOR ALERT
// ============================================================================

export interface MonitorAlert {
  alertId: string;
  rule: MonitorRule;
  severity: MonitorSeverity;
  category: MonitorCategory;
  
  // Alert details
  title: string;
  description: string;
  affectedEntities: MonitorReference[];
  relatedReferences: MonitorReference[];
  
  // Context
  scope: MonitorScope;
  detectedAt: string;
  
  // Evidence (drift detection)
  evidence: {
    field: string;
    baselineValue?: unknown;
    currentValue?: unknown;
    drift?: {
      type: 'added' | 'removed' | 'modified' | 'broken';
      details: string;
    };
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
  status: 'new' | 'acknowledged' | 'resolved' | 'false-positive' | 'suppressed';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  
  metadata: Record<string, unknown>;
}

// ============================================================================
// MONITOR CHECK
// ============================================================================

export interface MonitorCheck {
  checkId: string;
  checkType: 'full-system' | 'facility' | 'category' | 'rule';
  description: string;
  scope: MonitorScope;
  categories?: MonitorCategory[];
  severities?: MonitorSeverity[];
  ruleIds?: string[];
  options?: {
    includeSuppressed?: boolean;
    maxAlerts?: number;
    sortBy?: 'severity' | 'detectedAt' | 'category';
    sortOrder?: 'asc' | 'desc';
  };
  triggeredBy: 'scheduler' | 'manual';
  triggeredAt: string;
}

// ============================================================================
// MONITOR CYCLE
// ============================================================================

export interface MonitorCycle {
  cycleId: string;
  frequency: MonitorFrequency;
  check: MonitorCheck;
  
  // Results
  alerts: MonitorAlert[];
  totalAlerts: number;
  newAlerts: number;
  
  // Summary
  summary: {
    alertsByCategory: Record<MonitorCategory, number>;
    alertsBySeverity: Record<MonitorSeverity, number>;
    affectedEntitiesCount: number;
    rulesEvaluated: number;
    rulesPassed: number;
    rulesFailed: number;
  };
  
  // Metadata
  metadata: {
    executionTime: number;
    evaluatedEngines: string[];
    scope: MonitorScope;
    startedAt: string;
    completedAt: string;
  };
  
  performedBy: string;
}

// ============================================================================
// MONITOR RESULT
// ============================================================================

export interface MonitorResult {
  resultId: string;
  cycle: MonitorCycle;
  success: boolean;
  error?: string;
}

// ============================================================================
// MONITOR LOG ENTRY
// ============================================================================

export interface MonitorLogEntry {
  entryId: string;
  entryType: 'cycle' | 'check' | 'alert' | 'evaluation' | 'policy-decision' | 'error';
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  
  // Entry details (one populated based on type)
  cycle?: {
    cycleId: string;
    frequency: MonitorFrequency;
    totalAlerts: number;
    newAlerts: number;
  };
  check?: {
    checkId: string;
    checkType: string;
    scope: MonitorScope;
  };
  alert?: {
    alertId: string;
    severity: MonitorSeverity;
    category: MonitorCategory;
    affectedEntitiesCount: number;
  };
  evaluation?: {
    ruleId: string;
    ruleName: string;
    category: MonitorCategory;
    passed: boolean;
    executionTime: number;
  };
  policyDecision?: {
    decision: 'allow' | 'deny' | 'partial';
    reason: string;
  };
  error?: {
    message: string;
    stack?: string;
  };
  
  performedBy: string;
  executionTime?: number;
  success: boolean;
}

// ============================================================================
// MONITOR STATISTICS
// ============================================================================

export interface MonitorStatistics {
  // Totals
  totalCycles: number;
  totalAlerts: number;
  
  // By category
  alertsByCategory: Record<MonitorCategory, number>;
  
  // By severity
  alertsBySeverity: Record<MonitorSeverity, number>;
  
  // Trends
  cyclesLast24Hours: number;
  alertsLast24Hours: number;
  averageAlertsPerCycle: number;
  
  // Status distribution
  newAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;
  falsePositiveAlerts: number;
  suppressedAlerts: number;
  
  // Most common
  mostCommonCategory: MonitorCategory;
  mostCommonSeverity: MonitorSeverity;
  
  // By engine
  alertsByEngine: Record<string, number>;
}

// ============================================================================
// MONITOR POLICY CONTEXT
// ============================================================================

export interface MonitorPolicyContext {
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  performedBy: string;
  userRoles: string[];
  userPermissions: string[];
  federationTenants?: string[];
}

// ============================================================================
// MONITOR POLICY DECISION
// ============================================================================

export interface MonitorPolicyDecision {
  decision: 'allow' | 'deny' | 'partial';
  reason: string;
  allowedCategories?: MonitorCategory[];
  deniedCategories?: MonitorCategory[];
}

// ============================================================================
// MONITOR SCHEDULE
// ============================================================================

export interface MonitorSchedule {
  scheduleId: string;
  frequency: MonitorFrequency;
  categories?: MonitorCategory[];
  scope: MonitorScope;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  createdBy: string;
  createdAt: string;
}
