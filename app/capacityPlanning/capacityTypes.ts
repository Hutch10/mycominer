/**
 * CAPACITY PLANNING & RESOURCE FORECASTING TYPES
 * Phase 56: Capacity Planning
 * 
 * Deterministic, read-only capacity planning for operator workload,
 * task/alert volumes, SLA risk windows, and resource utilization.
 * 
 * NO GENERATIVE AI. NO PROBABILISTIC PREDICTION. NO SYNTHETIC DATA.
 * All projections derived from real historical and real-time data.
 */

// ============================================================================
// PROJECTION CATEGORIES
// ============================================================================

/**
 * Capacity projection categories
 */
export type CapacityProjectionCategory =
  | 'operator-workload'         // Operator load projection
  | 'task-volume'               // Task volume projection
  | 'alert-volume'              // Alert volume projection
  | 'sla-risk'                  // SLA breach risk windows
  | 'remediation-backlog'       // Backlog accumulation
  | 'cross-engine-correlation'  // Cross-engine load patterns
  | 'resource-utilization';     // Resource usage modeling

/**
 * Time window for projections
 */
export type CapacityTimeWindow =
  | 'next-1-hour'
  | 'next-4-hours'
  | 'next-8-hours'
  | 'next-12-hours'
  | 'next-24-hours'
  | 'next-48-hours'
  | 'next-7-days';

/**
 * Projection method
 */
export type ProjectionMethod =
  | 'rolling-average'    // Simple moving average
  | 'weighted-average'   // Time-weighted average
  | 'baseline-delta'     // Current vs baseline
  | 'trend-slope'        // Linear trend
  | 'moving-window';     // Sliding window analysis

// ============================================================================
// CAPACITY BASELINE
// ============================================================================

/**
 * Historical baseline for capacity planning
 */
export interface CapacityBaseline {
  baselineId: string;
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Time period
  periodStart: string;
  periodEnd: string;
  periodDurationHours: number;
  
  // Workload metrics
  averageTasksPerHour: number;
  averageAlertsPerHour: number;
  averageOperatorLoad: number;
  peakOperatorLoad: number;
  
  // Breakdown
  tasksByCategory: Record<string, number>;
  alertsBySeverity: Record<string, number>;
  workloadByOperator: Record<string, number>;
  
  // SLA metrics
  averageSLAAdherence: number;
  slaBreachCount: number;
  
  // Metadata
  computedAt: string;
  dataPoints: number;
  confidenceLevel: 'high' | 'medium' | 'low';
}

// ============================================================================
// CAPACITY PROJECTION
// ============================================================================

/**
 * Capacity projection result
 */
export interface CapacityProjection {
  projectionId: string;
  category: CapacityProjectionCategory;
  timeWindow: CapacityTimeWindow;
  method: ProjectionMethod;
  
  // Scope
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Projected values
  projectedValue: number;
  projectedMin: number;
  projectedMax: number;
  unit: string;
  
  // Baseline comparison
  baselineValue: number;
  deltaFromBaseline: number;
  deltaPercentage: number;
  
  // Trend
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  trendSlope: number;
  
  // Breakdown
  breakdown?: {
    byOperator?: Record<string, number>;
    byCategory?: Record<string, number>;
    bySeverity?: Record<string, number>;
    byHour?: Record<string, number>;
  };
  
  // Metadata
  computedAt: string;
  validUntil: string;
  dataPoints: number;
  confidenceLevel: 'high' | 'medium' | 'low';
}

// ============================================================================
// CAPACITY RISK
// ============================================================================

/**
 * Risk severity levels
 */
export type CapacityRiskLevel = 'critical' | 'high' | 'medium' | 'low';

/**
 * Capacity risk window
 */
export interface CapacityRiskWindow {
  riskId: string;
  riskType: 'sla-breach' | 'overload' | 'backlog-accumulation' | 'resource-exhaustion';
  severity: CapacityRiskLevel;
  
  // Scope
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Time window
  windowStart: string;
  windowEnd: string;
  windowDurationHours: number;
  
  // Risk details
  description: string;
  affectedEntities: {
    operatorIds?: string[];
    taskCategories?: string[];
    alertCategories?: string[];
  };
  
  // Risk metrics
  riskScore: number; // 0-100
  probabilityScore: number; // Based on historical frequency, not prediction
  impactScore: number;
  
  // Recommendations
  recommendations: string[];
  
  // Metadata
  computedAt: string;
  dataPoints: number;
}

// ============================================================================
// CAPACITY QUERY
// ============================================================================

/**
 * Capacity planning query
 */
export interface CapacityQuery {
  queryId: string;
  description: string;
  
  // Scope
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Projection parameters
  categories?: CapacityProjectionCategory[];
  timeWindows?: CapacityTimeWindow[];
  methods?: ProjectionMethod[];
  
  // Filters
  operatorIds?: string[];
  includeRiskWindows?: boolean;
  includeBaseline?: boolean;
  
  // Options
  options?: {
    includeBreakdown?: boolean;
    includeTrends?: boolean;
    includeRecommendations?: boolean;
  };
  
  // Audit
  requestedBy: string;
  requestedAt: string;
}

// ============================================================================
// CAPACITY RESULT
// ============================================================================

/**
 * Capacity planning result
 */
export interface CapacityResult {
  resultId: string;
  query: CapacityQuery;
  
  // Baseline
  baseline?: CapacityBaseline;
  
  // Projections
  projections: CapacityProjection[];
  
  // Risk windows
  riskWindows: CapacityRiskWindow[];
  
  // Summary
  summary: {
    totalProjections: number;
    totalRisks: number;
    criticalRisks: number;
    highRisks: number;
    averageConfidence: number;
    projectionRange: {
      minValue: number;
      maxValue: number;
      unit: string;
    };
  };
  
  // References
  references: {
    metricsUsed: string[];
    realTimeSignalsUsed: string[];
    tasksAnalyzed: number;
    alertsAnalyzed: number;
    timeRangeCovered: {
      start: string;
      end: string;
      durationHours: number;
    };
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
// CAPACITY LOG
// ============================================================================

/**
 * Capacity log entry types
 */
export type CapacityLogEntryType =
  | 'query-executed'
  | 'baseline-computed'
  | 'projection-computed'
  | 'risk-identified'
  | 'policy-decision'
  | 'error';

/**
 * Query executed log entry
 */
export interface QueryExecutedLogEntry {
  entryId: string;
  entryType: 'query-executed';
  timestamp: string;
  query: CapacityQuery;
  projectionsComputed: number;
  risksIdentified: number;
}

/**
 * Baseline computed log entry
 */
export interface BaselineComputedLogEntry {
  entryId: string;
  entryType: 'baseline-computed';
  timestamp: string;
  baseline: CapacityBaseline;
}

/**
 * Projection computed log entry
 */
export interface ProjectionComputedLogEntry {
  entryId: string;
  entryType: 'projection-computed';
  timestamp: string;
  projection: CapacityProjection;
}

/**
 * Risk identified log entry
 */
export interface RiskIdentifiedLogEntry {
  entryId: string;
  entryType: 'risk-identified';
  timestamp: string;
  risk: CapacityRiskWindow;
}

/**
 * Policy decision log entry
 */
export interface PolicyDecisionLogEntry {
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
export interface ErrorLogEntry {
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
export type CapacityLogEntry =
  | QueryExecutedLogEntry
  | BaselineComputedLogEntry
  | ProjectionComputedLogEntry
  | RiskIdentifiedLogEntry
  | PolicyDecisionLogEntry
  | ErrorLogEntry;

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Capacity planning statistics
 */
export interface CapacityStatistics {
  totalQueries: number;
  totalBaselines: number;
  totalProjections: number;
  totalRisks: number;
  
  byCategory: Record<CapacityProjectionCategory, number>;
  byTimeWindow: Record<CapacityTimeWindow, number>;
  byMethod: Record<ProjectionMethod, number>;
  byTenant: Record<string, number>;
  
  riskDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  
  confidenceLevels: {
    high: number;
    medium: number;
    low: number;
  };
  
  trends: {
    queriesChange: number;
    projectionsChange: number;
    risksChange: number;
  };
}

// ============================================================================
// POLICY CONTEXT
// ============================================================================

/**
 * Capacity policy context
 */
export interface CapacityPolicyContext {
  userId: string;
  userTenantId: string;
  userFederationId?: string;
  permissions: string[];
}

/**
 * Capacity policy decision
 */
export interface CapacityPolicyDecision {
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
 * Historical data input from Phase 54 (Operator Analytics)
 */
export interface HistoricalMetricsInput {
  metricsId: string;
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  timeRange: {
    start: string;
    end: string;
  };
  taskThroughput: number;
  alertVolume: number;
  operatorWorkload: Record<string, number>;
  slaAdherence: number;
}

/**
 * Real-time data input from Phase 55 (Real-Time Monitoring)
 */
export interface RealTimeSignalsInput {
  signalId: string;
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  timestamp: string;
  liveWorkload: number;
  activeTasks: number;
  activeAlerts: number;
  slaCountdowns: number;
  workloadDelta: number;
}
