/**
 * EXECUTIVE INSIGHTS & ENTERPRISE REPORTING TYPES
 * Phase 58: Executive Insights
 * 
 * Deterministic, read-only insights engine that aggregates metrics, alerts, tasks,
 * capacity projections, schedules, and performance signals across all tenants.
 * 
 * NO GENERATIVE AI. NO PREDICTIONS. NO SYNTHETIC DATA.
 * All insights derived from real engine outputs (Phases 50-57).
 */

// ============================================================================
// INSIGHT CATEGORIES
// ============================================================================

/**
 * Insight categories
 */
export type InsightCategory =
  | 'cross-engine-operational'      // All engines summary
  | 'tenant-performance'            // Tenant-level performance
  | 'facility-performance'          // Facility-level performance
  | 'sla-compliance'                // SLA & deadline compliance
  | 'risk-drift'                    // Risk & integrity drift
  | 'capacity-scheduling'           // Capacity & workload
  | 'operator-performance'          // Operator metrics
  | 'governance-documentation';     // Governance & docs

/**
 * Time period for trends
 */
export type InsightTimePeriod = '1h' | '6h' | '24h' | '7d' | '30d' | 'custom';

/**
 * Aggregation method
 */
export type AggregationMethod = 'sum' | 'average' | 'min' | 'max' | 'count' | 'percentage';

/**
 * Trend direction
 */
export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'volatile';

/**
 * Risk level
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// INSIGHT QUERY
// ============================================================================

/**
 * Insight query
 */
export interface InsightQuery {
  queryId: string;
  description: string;
  
  // Scope
  scope: {
    tenantId?: string;          // Specific tenant or all tenants
    facilityId?: string;        // Specific facility or all facilities
    federationId?: string;      // Federation scope
  };
  
  // Categories
  categories: InsightCategory[];
  
  // Time period
  timePeriod: InsightTimePeriod;
  customTimeRange?: {
    start: string;
    end: string;
  };
  
  // Options
  includeTrends?: boolean;
  includeCorrelations?: boolean;
  includeRecommendations?: boolean;
  aggregationLevel?: 'tenant' | 'facility' | 'room' | 'operator';
  
  // Audit
  requestedBy: string;
  requestedAt: string;
}

// ============================================================================
// INSIGHT SUMMARY
// ============================================================================

/**
 * Cross-engine operational summary
 */
export interface CrossEngineOperationalSummary {
  category: 'cross-engine-operational';
  
  // Counts
  totalTasks: number;                   // Phase 53
  totalAlerts: number;                  // Phase 52
  totalDriftEvents: number;             // Phase 51
  totalAuditFindings: number;           // Phase 50
  totalScheduledSlots: number;          // Phase 57
  totalOperators: number;               // Phase 54
  
  // Status
  criticalTasks: number;
  criticalAlerts: number;
  criticalDrifts: number;
  criticalAuditFindings: number;
  
  // Performance
  averageCapacityUtilization: number;   // Phase 56
  averageOperatorUtilization: number;   // Phase 57
  slaComplianceRate: number;            // Phase 57
  
  // Timestamps
  computedAt: string;
  periodStart: string;
  periodEnd: string;
}

/**
 * Tenant performance summary
 */
export interface TenantPerformanceSummary {
  category: 'tenant-performance';
  tenantId: string;
  tenantName?: string;
  
  // Tasks & Alerts
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;           // %
  totalAlerts: number;
  resolvedAlerts: number;
  alertResolutionRate: number;          // %
  
  // Quality & Compliance
  auditComplianceScore: number;         // 0-100
  driftScore: number;                   // 0-100 (lower is better)
  documentationCompleteness: number;    // %
  
  // Capacity & Scheduling
  averageCapacity: number;              // %
  scheduleEfficiency: number;           // %
  operatorUtilization: number;          // %
  
  // Risk
  overallRiskLevel: RiskLevel;
  riskScore: number;                    // 0-100
  
  // Timestamps
  computedAt: string;
  periodStart: string;
  periodEnd: string;
}

/**
 * Facility performance summary
 */
export interface FacilityPerformanceSummary {
  category: 'facility-performance';
  tenantId: string;
  facilityId: string;
  facilityName?: string;
  
  // Operations
  totalRooms: number;
  activeRooms: number;
  totalOperators: number;
  activeOperators: number;
  
  // Tasks & Workload
  totalTasks: number;
  tasksPerRoom: number;
  totalScheduledSlots: number;
  slotsPerOperator: number;
  
  // Quality Metrics
  environmentalCompliance: number;      // %
  contaminationRate: number;            // per 1000 operations
  yieldEfficiency: number;              // %
  
  // Capacity
  averageCapacityUtilization: number;   // %
  peakCapacityUtilization: number;      // %
  capacityRiskLevel: RiskLevel;
  
  // Timestamps
  computedAt: string;
  periodStart: string;
  periodEnd: string;
}

/**
 * SLA compliance summary
 */
export interface SLAComplianceSummary {
  category: 'sla-compliance';
  
  // Tasks
  totalTasksWithSLA: number;
  tasksMetSLA: number;
  tasksAtRiskSLA: number;
  tasksBreachedSLA: number;
  taskSLAComplianceRate: number;        // %
  
  // Alerts
  totalAlertsWithSLA: number;
  alertsMetSLA: number;
  alertsAtRiskSLA: number;
  alertsBreachedSLA: number;
  alertSLAComplianceRate: number;       // %
  
  // Schedules
  totalScheduledSlots: number;
  slotsWithinSLA: number;
  slotsAtRiskSLA: number;
  slotsBreachedSLA: number;
  scheduleSLAComplianceRate: number;    // %
  
  // Overall
  overallSLAComplianceRate: number;     // %
  slaRiskScore: number;                 // 0-100
  
  // Timestamps
  computedAt: string;
  periodStart: string;
  periodEnd: string;
}

/**
 * Risk & drift summary
 */
export interface RiskDriftSummary {
  category: 'risk-drift';
  
  // Drift
  totalDriftEvents: number;
  criticalDrifts: number;
  driftByCategory: Record<string, number>;
  averageDriftSeverity: number;         // 0-100
  
  // Integrity
  integrityScore: number;               // 0-100
  integrityTrend: TrendDirection;
  
  // Audit Findings
  totalAuditFindings: number;
  criticalFindings: number;
  findingsByCategory: Record<string, number>;
  auditComplianceScore: number;         // 0-100
  
  // Capacity Risk
  capacityAtRisk: number;               // %
  capacityRiskLevel: RiskLevel;
  
  // Overall
  overallRiskLevel: RiskLevel;
  overallRiskScore: number;             // 0-100
  
  // Timestamps
  computedAt: string;
  periodStart: string;
  periodEnd: string;
}

/**
 * Capacity & scheduling summary
 */
export interface CapacitySchedulingSummary {
  category: 'capacity-scheduling';
  
  // Capacity
  averageCapacityUtilization: number;   // %
  peakCapacityUtilization: number;      // %
  lowCapacityWindows: number;
  highCapacityWindows: number;
  capacityTrend: TrendDirection;
  
  // Scheduling
  totalScheduledSlots: number;
  totalConflicts: number;
  conflictRate: number;                 // %
  criticalConflicts: number;
  
  // Workload
  averageWorkloadBalance: number;       // 0-100 (100 is perfect)
  overloadedOperators: number;
  underutilizedOperators: number;
  
  // Recommendations
  totalRecommendations: number;
  rebalanceRecommendations: number;
  deferRecommendations: number;
  optimizeRecommendations: number;
  
  // Timestamps
  computedAt: string;
  periodStart: string;
  periodEnd: string;
}

/**
 * Operator performance summary
 */
export interface OperatorPerformanceSummary {
  category: 'operator-performance';
  
  // Operators
  totalOperators: number;
  activeOperators: number;
  averageUtilization: number;           // %
  
  // Top performers
  topPerformers: {
    operatorId: string;
    operatorName: string;
    utilizationRate: number;
    taskCompletionRate: number;
    slaComplianceRate: number;
  }[];
  
  // Performance distribution
  utilizationDistribution: {
    underutilized: number;              // <40%
    optimal: number;                    // 40-80%
    overutilized: number;               // >80%
  };
  
  // Workload
  totalTasksAssigned: number;
  totalTasksCompleted: number;
  averageTasksPerOperator: number;
  
  // Quality
  averageSLACompliance: number;         // %
  averageTaskQuality: number;           // 0-100
  
  // Timestamps
  computedAt: string;
  periodStart: string;
  periodEnd: string;
}

/**
 * Governance & documentation summary
 */
export interface GovernanceDocumentationSummary {
  category: 'governance-documentation';
  
  // Documentation
  totalDocuments: number;
  completeDocuments: number;
  documentationCompleteness: number;    // %
  missingDocuments: number;
  
  // Governance
  totalGovernanceChecks: number;
  passedChecks: number;
  failedChecks: number;
  governanceComplianceRate: number;     // %
  
  // Audit
  totalAudits: number;
  passedAudits: number;
  failedAudits: number;
  auditComplianceRate: number;          // %
  
  // Lineage
  totalLineageRecords: number;
  completeLineageRecords: number;
  lineageCompleteness: number;          // %
  
  // Timestamps
  computedAt: string;
  periodStart: string;
  periodEnd: string;
}

/**
 * Union of all summary types
 */
export type InsightSummary =
  | CrossEngineOperationalSummary
  | TenantPerformanceSummary
  | FacilityPerformanceSummary
  | SLAComplianceSummary
  | RiskDriftSummary
  | CapacitySchedulingSummary
  | OperatorPerformanceSummary
  | GovernanceDocumentationSummary;

// ============================================================================
// INSIGHT TREND
// ============================================================================

/**
 * Insight trend
 */
export interface InsightTrend {
  trendId: string;
  category: InsightCategory;
  metricName: string;
  
  // Trend data
  direction: TrendDirection;
  changePercentage: number;             // % change over period
  volatility: number;                   // 0-100
  
  // Data points
  dataPoints: {
    timestamp: string;
    value: number;
  }[];
  
  // Analysis
  description: string;
  significance: 'low' | 'medium' | 'high';
  
  // Timestamps
  computedAt: string;
  periodStart: string;
  periodEnd: string;
}

// ============================================================================
// INSIGHT CORRELATION
// ============================================================================

/**
 * Insight correlation
 */
export interface InsightCorrelation {
  correlationId: string;
  
  // Metrics
  metric1: {
    source: string;                     // e.g., "Phase 54: Operator Analytics"
    name: string;
    value: number;
  };
  
  metric2: {
    source: string;                     // e.g., "Phase 56: Capacity Planning"
    name: string;
    value: number;
  };
  
  // Correlation
  correlationCoefficient: number;       // -1 to 1
  correlationStrength: 'weak' | 'moderate' | 'strong';
  correlationType: 'positive' | 'negative' | 'none';
  
  // Analysis
  description: string;
  significance: 'low' | 'medium' | 'high';
  
  // Timestamps
  computedAt: string;
}

// ============================================================================
// INSIGHT RESULT
// ============================================================================

/**
 * Insight result
 */
export interface InsightResult {
  resultId: string;
  query: InsightQuery;
  
  // Summaries
  summaries: InsightSummary[];
  
  // Trends
  trends?: InsightTrend[];
  
  // Correlations
  correlations?: InsightCorrelation[];
  
  // References
  references: {
    metricsUsed: string[];              // Phase 54
    signalsUsed: string[];              // Phase 55
    projectionsUsed: string[];          // Phase 56
    schedulesUsed: string[];            // Phase 57
    tasksUsed: string[];                // Phase 53
    alertsUsed: string[];               // Phase 52
    driftsUsed: string[];               // Phase 51
    auditFindingsUsed: string[];        // Phase 50
  };
  
  // Metadata
  metadata: {
    computedAt: string;
    computationTimeMs: number;
    dataSourcesQueried: string[];
    aggregationLevel: string;
  };
  
  success: boolean;
  error?: string;
}

// ============================================================================
// POLICY CONTEXT
// ============================================================================

/**
 * Insights policy context
 */
export interface InsightsPolicyContext {
  userId: string;
  userTenantId: string;
  userFederationId?: string;
  permissions: string[];
  role: 'executive' | 'supervisor' | 'operator' | 'admin';
}

/**
 * Insights policy decision
 */
export interface InsightsPolicyDecision {
  allowed: boolean;
  reason: string;
  scope: {
    tenantId?: string;
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
// INSIGHT LOG
// ============================================================================

/**
 * Insight log entry base
 */
export interface InsightLogEntryBase {
  entryId: string;
  entryType: string;
  timestamp: string;
}

/**
 * Insight generated log entry
 */
export interface InsightGeneratedLogEntry extends InsightLogEntryBase {
  entryType: 'insight-generated';
  result: InsightResult;
  summariesGenerated: number;
  trendsGenerated: number;
  correlationsGenerated: number;
}

/**
 * Trend detected log entry
 */
export interface TrendDetectedLogEntry extends InsightLogEntryBase {
  entryType: 'trend-detected';
  trend: InsightTrend;
}

/**
 * Correlation detected log entry
 */
export interface CorrelationDetectedLogEntry extends InsightLogEntryBase {
  entryType: 'correlation-detected';
  correlation: InsightCorrelation;
}

/**
 * Insights policy decision log entry
 */
export interface InsightsPolicyDecisionLogEntry extends InsightLogEntryBase {
  entryType: 'policy-decision';
  queryId: string;
  scope: {
    tenantId?: string;
    facilityId?: string;
    federationId?: string;
  };
  allowed: boolean;
  reason: string;
  violations: string[];
  warnings: string[];
}

/**
 * Insights error log entry
 */
export interface InsightsErrorLogEntry extends InsightLogEntryBase {
  entryType: 'error';
  scope: {
    tenantId?: string;
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
export type InsightLogEntry =
  | InsightGeneratedLogEntry
  | TrendDetectedLogEntry
  | CorrelationDetectedLogEntry
  | InsightsPolicyDecisionLogEntry
  | InsightsErrorLogEntry;

// ============================================================================
// INSIGHT STATISTICS
// ============================================================================

/**
 * Insight statistics
 */
export interface InsightStatistics {
  totalInsights: number;
  totalTrends: number;
  totalCorrelations: number;
  
  byCategory: Record<InsightCategory, number>;
  byTenant: Record<string, number>;
  byTimePeriod: Record<InsightTimePeriod, number>;
  
  trendDistribution: {
    increasing: number;
    decreasing: number;
    stable: number;
    volatile: number;
  };
  
  correlationDistribution: {
    weak: number;
    moderate: number;
    strong: number;
  };
  
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  
  averageComputationTimeMs: number;
  
  trends: {
    insightsChange: number;             // % change in insights generated
    trendsChange: number;               // % change in trends detected
    correlationsChange: number;         // % change in correlations found
  };
}

// ============================================================================
// DATA INPUTS FROM OTHER PHASES
// ============================================================================

/**
 * Aggregated data input from all phases
 */
export interface AggregatedDataInput {
  // Phase 50: Compliance Auditor
  auditFindings?: {
    findingId: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    status: string;
    tenantId: string;
    facilityId?: string;
  }[];
  
  // Phase 51: Integrity Engine
  driftEvents?: {
    driftId: string;
    severity: number;
    category: string;
    detected: string;
    tenantId: string;
    facilityId?: string;
  }[];
  
  // Phase 52: Alert Aggregation
  alerts?: {
    alertId: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    status: string;
    slaDeadline?: string;
    tenantId: string;
    facilityId?: string;
  }[];
  
  // Phase 53: Task Management
  tasks?: {
    taskId: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: string;
    slaDeadline?: string;
    completedAt?: string;
    tenantId: string;
    facilityId?: string;
  }[];
  
  // Phase 54: Operator Analytics
  operatorMetrics?: {
    operatorId: string;
    operatorName: string;
    utilizationRate: number;
    taskCompletionRate: number;
    slaComplianceRate: number;
    tenantId: string;
    facilityId?: string;
  }[];
  
  // Phase 55: Real-Time Monitoring
  realTimeSignals?: {
    signalId: string;
    metric: string;
    value: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    timestamp: string;
    tenantId: string;
    facilityId?: string;
    roomId?: string;
  }[];
  
  // Phase 56: Capacity Planning
  capacityProjections?: {
    projectionId: string;
    category: string;
    projectedCapacity: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    windowStart: string;
    windowEnd: string;
    tenantId: string;
    facilityId?: string;
  }[];
  
  // Phase 57: Workload Orchestration
  schedules?: {
    scheduleId: string;
    totalSlots: number;
    totalConflicts: number;
    criticalConflicts: number;
    averageCapacityUtilization: number;
    slaRiskScore: number;
    tenantId: string;
    facilityId?: string;
  }[];
}
