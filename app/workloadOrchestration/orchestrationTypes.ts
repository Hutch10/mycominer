/**
 * WORKLOAD ORCHESTRATION & SCHEDULING ENGINE TYPES
 * Phase 57: Workload Orchestration
 * 
 * Deterministic, read-only orchestration engine that sequences operator workloads,
 * aligns tasks with capacity windows, schedules remediation flows.
 * 
 * NO GENERATIVE AI. NO PREDICTIONS. NO SYNTHETIC WORKLOADS.
 * All schedules derived from real tasks, metrics, and capacity projections.
 */

// ============================================================================
// SCHEDULING CATEGORIES
// ============================================================================

/**
 * Scheduling categories
 */
export type OrchestrationCategory =
  | 'task-scheduling'               // Phase 53: Task Management
  | 'alert-follow-up'                // Phase 52: Alert Aggregation
  | 'audit-remediation'              // Phase 50: Auditor
  | 'drift-remediation'              // Phase 51: Integrity Monitor
  | 'governance-issue'               // Phases 44-45: Governance
  | 'documentation-completeness'     // Phase 47: Documentation
  | 'simulation-mismatch'            // Phase 49: Digital Twin
  | 'capacity-aligned-workload';    // Phase 56: Capacity Planning

/**
 * Scheduling priority
 */
export type OrchestrationPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Conflict type
 */
export type OrchestrationConflictType =
  | 'over-capacity'
  | 'sla-collision'
  | 'operator-overload'
  | 'resource-unavailable'
  | 'schedule-overlap';

// ============================================================================
// ORCHESTRATION SLOT
// ============================================================================

/**
 * Time slot for scheduled work
 */
export interface OrchestrationSlot {
  slotId: string;
  
  // Time window
  startTime: string;
  endTime: string;
  durationMinutes: number;
  
  // Assignment
  operatorId: string;
  operatorName?: string;
  
  // Work item
  category: OrchestrationCategory;
  workItemId: string; // Task ID, Alert ID, etc.
  workItemDescription: string;
  priority: OrchestrationPriority;
  
  // SLA
  slaDeadline?: string;
  slaBuffer?: number; // Minutes before deadline
  
  // Capacity alignment
  capacityUtilization: number; // % of operator capacity
  withinCapacityWindow: boolean;
  
  // Metadata
  scheduledAt: string;
  scheduledBy: string;
}

// ============================================================================
// ORCHESTRATION CONFLICT
// ============================================================================

/**
 * Scheduling conflict
 */
export interface OrchestrationConflict {
  conflictId: string;
  conflictType: OrchestrationConflictType;
  severity: OrchestrationPriority;
  
  // Affected slots
  affectedSlots: string[]; // Slot IDs
  
  // Details
  description: string;
  impactAnalysis: {
    operatorsAffected: string[];
    tasksDelayed: number;
    slaRisk: number; // 0-100
    capacityOverage: number; // %
  };
  
  // Resolution
  resolutionOptions: string[];
  recommendedAction: string;
  
  // Metadata
  detectedAt: string;
}

// ============================================================================
// ORCHESTRATION RECOMMENDATION
// ============================================================================

/**
 * Scheduling recommendation
 */
export interface OrchestrationRecommendation {
  recommendationId: string;
  recommendationType: 'optimize' | 'rebalance' | 'defer' | 'escalate' | 'redistribute';
  
  // Target
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Suggestion
  description: string;
  rationale: string;
  expectedBenefit: {
    capacityImprovement?: number; // %
    slaImprovement?: number; // %
    workloadBalance?: number; // %
  };
  
  // Actions
  suggestedActions: string[];
  affectedSlots: string[];
  
  // Metadata
  generatedAt: string;
  confidenceLevel: 'high' | 'medium' | 'low';
}

// ============================================================================
// ORCHESTRATION SCHEDULE
// ============================================================================

/**
 * Complete orchestration schedule
 */
export interface OrchestrationSchedule {
  scheduleId: string;
  
  // Scope
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Time range
  timeRange: {
    start: string;
    end: string;
    durationHours: number;
  };
  
  // Slots
  slots: OrchestrationSlot[];
  
  // Conflicts
  conflicts: OrchestrationConflict[];
  
  // Recommendations
  recommendations: OrchestrationRecommendation[];
  
  // Operator summary
  operatorSummary: {
    operatorId: string;
    operatorName?: string;
    totalSlots: number;
    totalWorkMinutes: number;
    capacityUtilization: number; // %
    slaRisk: number; // 0-100
  }[];
  
  // Category summary
  categorySummary: Record<OrchestrationCategory, {
    totalSlots: number;
    totalWorkMinutes: number;
    criticalCount: number;
    highCount: number;
  }>;
  
  // Metadata
  generatedAt: string;
  generatedBy: string;
  validUntil: string;
}

// ============================================================================
// ORCHESTRATION QUERY
// ============================================================================

/**
 * Orchestration query
 */
export interface OrchestrationQuery {
  queryId: string;
  description: string;
  
  // Scope
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Time range
  timeRange: {
    start: string;
    end: string;
  };
  
  // Filters
  categories?: OrchestrationCategory[];
  operatorIds?: string[];
  priorities?: OrchestrationPriority[];
  includeConflicts?: boolean;
  includeRecommendations?: boolean;
  
  // Options
  options?: {
    optimizeForCapacity?: boolean;
    optimizeForSLA?: boolean;
    balanceWorkload?: boolean;
    respectCapacityWindows?: boolean;
  };
  
  // Audit
  requestedBy: string;
  requestedAt: string;
}

// ============================================================================
// ORCHESTRATION RESULT
// ============================================================================

/**
 * Orchestration result
 */
export interface OrchestrationResult {
  resultId: string;
  query: OrchestrationQuery;
  
  // Schedule
  schedule: OrchestrationSchedule;
  
  // Summary
  summary: {
    totalSlots: number;
    totalConflicts: number;
    criticalConflicts: number;
    totalRecommendations: number;
    averageCapacityUtilization: number; // %
    slaRiskScore: number; // 0-100
  };
  
  // References
  references: {
    tasksScheduled: string[];
    alertsScheduled: string[];
    capacityProjectionsUsed: string[];
    metricsUsed: string[];
    realTimeSignalsUsed: string[];
  };
  
  // Metadata
  metadata: {
    computedAt: string;
    computationTimeMs: number;
    dataSourcesQueried: string[];
  };
  
  success: boolean;
  error?: string;
}

// ============================================================================
// ORCHESTRATION LOG
// ============================================================================

/**
 * Orchestration log entry types
 */
export type OrchestrationLogEntryType =
  | 'schedule-generated'
  | 'conflict-detected'
  | 'recommendation-generated'
  | 'policy-decision'
  | 'error';

/**
 * Schedule generated log entry
 */
export interface ScheduleGeneratedLogEntry {
  entryId: string;
  entryType: 'schedule-generated';
  timestamp: string;
  schedule: OrchestrationSchedule;
  slotsGenerated: number;
  conflictsDetected: number;
}

/**
 * Conflict detected log entry
 */
export interface ConflictDetectedLogEntry {
  entryId: string;
  entryType: 'conflict-detected';
  timestamp: string;
  conflict: OrchestrationConflict;
}

/**
 * Recommendation generated log entry
 */
export interface RecommendationGeneratedLogEntry {
  entryId: string;
  entryType: 'recommendation-generated';
  timestamp: string;
  recommendation: OrchestrationRecommendation;
}

/**
 * Policy decision log entry
 */
export interface OrchestrationPolicyDecisionLogEntry {
  entryId: string;
  entryType: 'policy-decision';
  timestamp: string;
  queryId: string;
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  allowed: boolean;
  reason: string;
  violations: string[];
  warnings: string[];
}

/**
 * Error log entry
 */
export interface OrchestrationErrorLogEntry {
  entryId: string;
  entryType: 'error';
  timestamp: string;
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  errorCode: string;
  message: string;
  details: Record<string, unknown>;
}

/**
 * Union of all log entry types
 */
export type OrchestrationLogEntry =
  | ScheduleGeneratedLogEntry
  | ConflictDetectedLogEntry
  | RecommendationGeneratedLogEntry
  | OrchestrationPolicyDecisionLogEntry
  | OrchestrationErrorLogEntry;

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Orchestration statistics
 */
export interface OrchestrationStatistics {
  totalSchedules: number;
  totalSlots: number;
  totalConflicts: number;
  totalRecommendations: number;
  
  byCategory: Record<OrchestrationCategory, number>;
  byPriority: Record<OrchestrationPriority, number>;
  byOperator: Record<string, number>;
  byTenant: Record<string, number>;
  
  conflictDistribution: {
    overCapacity: number;
    slaCollision: number;
    operatorOverload: number;
    resourceUnavailable: number;
    scheduleOverlap: number;
  };
  
  capacityMetrics: {
    averageUtilization: number;
    peakUtilization: number;
    underutilizedOperators: number;
    overutilizedOperators: number;
  };
  
  slaMetrics: {
    slotsWithinSLA: number;
    slotsAtRisk: number;
    slotsBreached: number;
  };
  
  trends: {
    schedulesChange: number;
    conflictsChange: number;
    utilizationChange: number;
  };
}

// ============================================================================
// POLICY CONTEXT
// ============================================================================

/**
 * Orchestration policy context
 */
export interface OrchestrationPolicyContext {
  userId: string;
  userTenantId: string;
  userFederationId?: string;
  permissions: string[];
}

/**
 * Orchestration policy decision
 */
export interface OrchestrationPolicyDecision {
  allowed: boolean;
  reason: string;
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  restrictions: string[];
  violations: string[];
  warnings: string[];
  evaluatedAt: string;
  policyVersion: string;
}

// ============================================================================
// DATA INPUTS
// ============================================================================

/**
 * Task input from Phase 53
 */
export interface TaskInput {
  taskId: string;
  category: string;
  priority: OrchestrationPriority;
  description: string;
  estimatedDurationMinutes: number;
  slaDeadline?: string;
  assignedOperatorId?: string;
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
}

/**
 * Alert input from Phase 52
 */
export interface AlertInput {
  alertId: string;
  severity: OrchestrationPriority;
  category: string;
  description: string;
  requiresFollowUp: boolean;
  estimatedResolutionMinutes: number;
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
}

/**
 * Operator availability input
 */
export interface OperatorAvailability {
  operatorId: string;
  operatorName: string;
  availableFrom: string;
  availableUntil: string;
  currentWorkload: number; // %
  maxCapacity: number; // tasks per hour
  specializations: string[];
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
}

/**
 * Capacity window input from Phase 56
 */
export interface CapacityWindowInput {
  windowId: string;
  windowStart: string;
  windowEnd: string;
  projectedCapacity: number; // %
  recommendedWorkload: number; // tasks
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
}
