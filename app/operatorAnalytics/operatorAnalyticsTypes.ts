/**
 * OPERATOR ANALYTICS TYPES
 * Phase 54: Operator Performance & Workflow Analytics Center
 * 
 * Deterministic, read-only analytics engine for measuring operator performance,
 * task throughput, SLA adherence, workload distribution, and remediation timelines.
 * 
 * NO GENERATIVE AI. NO INVENTED METRICS. NO PREDICTIONS.
 * All metrics derived from real system data.
 */

// ============================================================================
// METRIC CATEGORIES
// ============================================================================

/**
 * Operator metric categories
 */
export type OperatorMetricCategory =
  | 'task-throughput'              // Tasks completed per time period
  | 'alert-response-time'          // Time from alert to task acknowledgement
  | 'audit-remediation-timeline'   // Time to remediate audit findings
  | 'drift-remediation-timeline'   // Time to remediate integrity drift
  | 'governance-resolution-time'   // Time to resolve governance issues
  | 'documentation-remediation'    // Time to fix documentation issues
  | 'simulation-resolution'        // Time to resolve simulation mismatches
  | 'cross-engine-efficiency'      // Cross-engine operational KPIs
  | 'sla-adherence'                // SLA compliance metrics
  | 'workload-distribution';       // Operator workload metrics

/**
 * Time period for metrics
 */
export type MetricTimePeriod = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Aggregation method
 */
export type MetricAggregation = 'average' | 'median' | 'min' | 'max' | 'sum' | 'count' | 'percentile';

// ============================================================================
// METRIC SCOPE
// ============================================================================

/**
 * Scope for analytics queries
 */
export interface OperatorAnalyticsScope {
  tenantId: string;
  facilityId?: string;
  federationId?: string;
  roomId?: string;
  operatorId?: string;
  includeArchived?: boolean;
}

// ============================================================================
// OPERATOR METRICS
// ============================================================================

/**
 * Base metric interface
 */
export interface OperatorMetric {
  metricId: string;
  category: OperatorMetricCategory;
  name: string;
  description: string;
  value: number;
  unit: string;
  scope: OperatorAnalyticsScope;
  timeRange: {
    startDate: string;
    endDate: string;
  };
  metadata: {
    sampleSize: number;
    aggregation: MetricAggregation;
    dataSource: string[];
    [key: string]: unknown;
  };
  computedAt: string;
}

/**
 * Throughput metric
 */
export interface ThroughputMetric extends OperatorMetric {
  category: 'task-throughput';
  breakdown: {
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

/**
 * Response time metric
 */
export interface ResponseTimeMetric extends OperatorMetric {
  category: 'alert-response-time';
  breakdown: {
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    percentiles: {
      p50: number;
      p75: number;
      p90: number;
      p95: number;
      p99: number;
    };
  };
}

/**
 * Remediation timeline metric
 */
export interface RemediationTimelineMetric extends OperatorMetric {
  category: 'audit-remediation-timeline' | 'drift-remediation-timeline' | 'governance-resolution-time' | 'documentation-remediation' | 'simulation-resolution';
  breakdown: {
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    percentiles: {
      p50: number;
      p75: number;
      p90: number;
      p95: number;
      p99: number;
    };
  };
}

/**
 * SLA adherence metric
 */
export interface SLAMetric extends OperatorMetric {
  category: 'sla-adherence';
  breakdown: {
    totalTasks: number;
    withinSLA: number;
    outsideSLA: number;
    adherencePercentage: number;
    bySeverity: Record<string, { total: number; withinSLA: number; percentage: number }>;
    byCategory: Record<string, { total: number; withinSLA: number; percentage: number }>;
  };
}

/**
 * Workload distribution metric
 */
export interface WorkloadMetric extends OperatorMetric {
  category: 'workload-distribution';
  breakdown: {
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    averageTasksPerOperator: number;
    byOperator: Record<string, {
      totalTasks: number;
      activeTasks: number;
      completedTasks: number;
      completionRate: number;
    }>;
  };
}

/**
 * Cross-engine efficiency metric
 */
export interface CrossEngineMetric extends OperatorMetric {
  category: 'cross-engine-efficiency';
  breakdown: {
    byEngine: Record<string, {
      totalTasks: number;
      averageResolutionTime: number;
      completionRate: number;
    }>;
    correlations: {
      engine1: string;
      engine2: string;
      correlation: number;
      description: string;
    }[];
  };
}

/**
 * Union of all metric types
 */
export type AnyOperatorMetric =
  | ThroughputMetric
  | ResponseTimeMetric
  | RemediationTimelineMetric
  | SLAMetric
  | WorkloadMetric
  | CrossEngineMetric;

// ============================================================================
// PERFORMANCE SNAPSHOT
// ============================================================================

/**
 * Operator performance snapshot
 */
export interface OperatorPerformanceSnapshot {
  snapshotId: string;
  operatorId: string;
  operatorName: string;
  scope: OperatorAnalyticsScope;
  timeRange: {
    startDate: string;
    endDate: string;
  };
  
  // Core metrics
  tasksCompleted: number;
  tasksActive: number;
  averageResolutionTimeHours: number;
  slaAdherencePercentage: number;
  
  // Breakdown by category
  byCategory: Record<string, {
    completed: number;
    active: number;
    averageResolutionTimeHours: number;
  }>;
  
  // Breakdown by severity
  bySeverity: Record<string, {
    completed: number;
    active: number;
    averageResolutionTimeHours: number;
  }>;
  
  // Trends
  trends: {
    throughputChange: number; // Percentage change
    resolutionTimeChange: number;
    slaAdherenceChange: number;
  };
  
  computedAt: string;
}

// ============================================================================
// WORKLOAD PROFILE
// ============================================================================

/**
 * Operator workload profile
 */
export interface OperatorWorkloadProfile {
  profileId: string;
  scope: OperatorAnalyticsScope;
  timeRange: {
    startDate: string;
    endDate: string;
  };
  
  // Overall workload
  totalOperators: number;
  totalTasks: number;
  averageTasksPerOperator: number;
  
  // Operator breakdown
  operators: {
    operatorId: string;
    operatorName: string;
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    taskPercentage: number; // Percentage of total workload
    completionRate: number; // Percentage of tasks completed
    averageResolutionTimeHours: number;
  }[];
  
  // Workload balance
  workloadBalance: {
    minTasksPerOperator: number;
    maxTasksPerOperator: number;
    standardDeviation: number;
    balanceScore: number; // 0-100, higher is more balanced
  };
  
  computedAt: string;
}

// ============================================================================
// SLA CONFIGURATION
// ============================================================================

/**
 * SLA thresholds by severity and category
 */
export interface SLAThresholds {
  bySeverity: {
    critical: number; // Hours
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  byCategory?: Record<string, number>; // Optional category-specific overrides
}

// ============================================================================
// METRIC QUERY
// ============================================================================

/**
 * Query options
 */
export interface OperatorMetricQueryOptions {
  aggregation?: MetricAggregation;
  timePeriod?: MetricTimePeriod;
  includeBreakdown?: boolean;
  includeTrends?: boolean;
  maxResults?: number;
}

/**
 * Metric query
 */
export interface OperatorMetricQuery {
  queryId: string;
  description: string;
  scope: OperatorAnalyticsScope;
  
  // Filters
  categories: OperatorMetricCategory[];
  operatorIds?: string[];
  timeRange: {
    startDate: string;
    endDate: string;
  };
  
  // SLA configuration
  slaThresholds?: SLAThresholds;
  
  // Options
  options?: OperatorMetricQueryOptions;
  
  // Audit
  triggeredBy: string;
  triggeredAt: string;
}

// ============================================================================
// METRIC RESULT
// ============================================================================

/**
 * Metric query result
 */
export interface OperatorMetricResult {
  resultId: string;
  query: OperatorMetricQuery;
  metrics: AnyOperatorMetric[];
  performanceSnapshots?: OperatorPerformanceSnapshot[];
  workloadProfile?: OperatorWorkloadProfile;
  
  // Summary
  summary: {
    totalMetrics: number;
    byCategory: Record<string, number>;
    overallSLAAdherence: number | undefined;
    overallAverageResolutionTime: number | undefined;
    overallThroughput: number | undefined;
  };
  
  metadata: {
    executedAt: string;
    dataSourceCounts: Record<string, number>;
    [key: string]: unknown;
  };
  
  success: boolean;
  error?: string;
}

// ============================================================================
// ANALYTICS LOG
// ============================================================================

/**
 * Log entry types
 */
export type OperatorAnalyticsLogEntryType =
  | 'query'
  | 'metric'
  | 'snapshot'
  | 'workload-profile'
  | 'policy-decision'
  | 'error';

/**
 * Query log entry
 */
export interface QueryLogEntry {
  entryId: string;
  entryType: 'query';
  timestamp: string;
  queryId: string;
  description: string;
  scope: OperatorAnalyticsScope;
  categories: OperatorMetricCategory[];
  operatorIds: string[];
  timeRange: {
    startDate: string;
    endDate: string;
  };
  triggeredBy: string;
}

/**
 * Metric log entry
 */
export interface MetricLogEntry {
  entryId: string;
  entryType: 'metric';
  timestamp: string;
  metricId: string;
  category: OperatorMetricCategory;
  scope: OperatorAnalyticsScope;
  value: number;
  unit: string;
}

/**
 * Snapshot log entry
 */
export interface SnapshotLogEntry {
  entryId: string;
  entryType: 'snapshot';
  timestamp: string;
  snapshotId: string;
  operatorId: string;
  operatorName: string;
  scope: OperatorAnalyticsScope;
  tasksCompleted: number;
  tasksActive: number;
}

/**
 * Workload profile log entry
 */
export interface WorkloadProfileLogEntry {
  entryId: string;
  entryType: 'workload-profile';
  timestamp: string;
  profileId: string;
  scope: OperatorAnalyticsScope;
  totalOperators: number;
  totalTasks: number;
}

/**
 * Policy decision log entry
 */
export interface PolicyDecisionLogEntry {
  entryId: string;
  entryType: 'policy-decision';
  timestamp: string;
  queryId: string;
  scope: OperatorAnalyticsScope;
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
  scope: OperatorAnalyticsScope;
  errorCode: string;
  message: string;
  details: Record<string, any>;
}

/**
 * Union of all log entry types
 */
export type OperatorAnalyticsLogEntry =
  | QueryLogEntry
  | MetricLogEntry
  | SnapshotLogEntry
  | WorkloadProfileLogEntry
  | PolicyDecisionLogEntry
  | ErrorLogEntry;

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Analytics statistics
 */
export interface OperatorAnalyticsStatistics {
  totalQueries: number;
  totalMetrics: number;
  totalSnapshots: number;
  totalWorkloadProfiles: number;
  
  byCategory: Record<OperatorMetricCategory, number>;
  byOperator: Record<string, number>;
  byTenant: Record<string, number>;
  
  trends: {
    queriesChange: number;
    metricsChange: number;
    snapshotsChange: number;
  };
}

// ============================================================================
// POLICY ENFORCEMENT
// ============================================================================

/**
 * Policy context for authorization
 */
export interface OperatorAnalyticsPolicyContext {
  userId: string;
  userTenantId: string;
  userFederationId?: string;
  permissions: string[];
}

/**
 * Policy decision result
 */
export interface OperatorAnalyticsPolicyDecision {
  allowed: boolean;
  reason: string;
  scope: OperatorAnalyticsScope;
  restrictions: string[];
  violations: string[];
  warnings: string[];
  evaluatedAt: string;
  policyVersion: string;
}

// ============================================================================
// DATA SOURCES
// ============================================================================

/**
 * Task data from Action Center (Phase 53)
 */
export interface TaskDataInput {
  taskId: string;
  category: string;
  severity: string;
  status: string;
  createdAt: string;
  acknowledgedAt?: string;
  assignedTo?: string;
  assignedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
    roomId?: string;
  };
}

/**
 * Alert data from Alert Center (Phase 52)
 */
export interface AlertDataInput {
  alertId: string;
  category: string;
  severity: string;
  detectedAt: string;
  acknowledgedAt?: string;
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
}

/**
 * All data source inputs
 */
export interface AnalyticsDataInputs {
  tasks?: TaskDataInput[];
  alerts?: AlertDataInput[];
  // Can extend with more sources as needed
}
