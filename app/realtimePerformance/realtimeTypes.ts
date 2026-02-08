/**
 * REAL-TIME PERFORMANCE MONITORING TYPES
 * Phase 55: Real-Time Performance Monitoring
 * 
 * Deterministic, read-only real-time monitoring for operator performance,
 * SLA adherence, workload changes, and cross-engine operational signals.
 * 
 * NO GENERATIVE AI. NO PREDICTIONS. NO SYNTHETIC EVENTS.
 * All metrics derived from real system events.
 */

// ============================================================================
// EVENT CATEGORIES
// ============================================================================

/**
 * Real-time event categories from integrated systems
 */
export type RealTimeEventCategory =
  | 'task-lifecycle'           // Phase 53: Action Center
  | 'alert-lifecycle'          // Phase 52: Alert Center
  | 'audit-finding'            // Phase 50: Auditor
  | 'drift-detection'          // Phase 51: Integrity Monitor
  | 'governance-lineage'       // Phase 44-45: Governance
  | 'documentation-drift'      // Phase 47: Documentation
  | 'simulation-mismatch'      // Phase 49: Simulation
  | 'performance-signal';      // Phase 54: Operator Analytics

/**
 * Event types per category
 */
export type TaskLifecycleEventType = 'created' | 'acknowledged' | 'assigned' | 'in-progress' | 'resolved' | 'dismissed';
export type AlertLifecycleEventType = 'detected' | 'acknowledged' | 'escalated' | 'resolved' | 'dismissed';
export type AuditFindingEventType = 'finding-created' | 'finding-acknowledged' | 'remediation-started' | 'remediation-completed';
export type DriftDetectionEventType = 'drift-detected' | 'drift-acknowledged' | 'drift-remediated';
export type GovernanceLineageEventType = 'lineage-updated' | 'policy-violation' | 'policy-resolved';
export type DocumentationDriftEventType = 'doc-outdated' | 'doc-updated' | 'doc-validated';
export type SimulationMismatchEventType = 'mismatch-detected' | 'mismatch-analyzed' | 'mismatch-resolved';
export type PerformanceSignalEventType = 'metric-computed' | 'sla-breached' | 'workload-changed';

// ============================================================================
// REAL-TIME EVENTS
// ============================================================================

/**
 * Base real-time event
 */
export interface RealTimeEvent {
  eventId: string;
  category: RealTimeEventCategory;
  eventType: string;
  timestamp: string;
  
  // Scope
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
    roomId?: string;
  };
  
  // Severity
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  
  // Entity references
  entityId: string;
  entityType: string;
  relatedEntities?: {
    id: string;
    type: string;
  }[];
  
  // Actor
  operatorId?: string;
  operatorName?: string;
  
  // Metadata
  metadata: {
    sourceSystem: string;
    sourcePhase: number;
    [key: string]: unknown;
  };
  
  // Payload
  payload: Record<string, unknown>;
}

// ============================================================================
// REAL-TIME METRICS
// ============================================================================

/**
 * Real-time metric categories
 */
export type RealTimeMetricCategory =
  | 'live-workload'            // Current operator workload
  | 'active-tasks'             // Tasks in progress
  | 'sla-countdown'            // SLA time remaining
  | 'response-latency'         // Alert response time
  | 'remediation-timeline'     // Active remediation progress
  | 'cross-engine-performance' // Cross-engine signals
  | 'workload-delta'           // Workload changes
  | 'trend-signal';            // Performance trends

/**
 * Real-time metric
 */
export interface RealTimeMetric {
  metricId: string;
  category: RealTimeMetricCategory;
  name: string;
  value: number;
  unit: string;
  
  // Scope
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Time context
  computedAt: string;
  validUntil: string;
  
  // Breakdown
  breakdown?: {
    bySeverity?: Record<string, number>;
    byCategory?: Record<string, number>;
    byOperator?: Record<string, number>;
    byStatus?: Record<string, number>;
  };
  
  // Trend
  trend?: {
    direction: 'increasing' | 'decreasing' | 'stable';
    changeRate: number;
    previousValue: number;
  };
  
  // Metadata
  metadata: {
    sampleSize: number;
    dataSource: string[];
    confidenceLevel: 'high' | 'medium' | 'low';
  };
}

// ============================================================================
// STREAM STATE
// ============================================================================

/**
 * Real-time stream state
 */
export interface RealTimeStreamState {
  stateId: string;
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Event buffer
  recentEvents: RealTimeEvent[];
  maxEventBufferSize: number;
  
  // Rolling metrics
  rollingMetrics: {
    totalEventsReceived: number;
    eventsPerMinute: number;
    eventsByCategory: Record<RealTimeEventCategory, number>;
    eventsBySeverity: Record<string, number>;
  };
  
  // SLA countdowns
  slaCountdowns: {
    entityId: string;
    entityType: string;
    severity: string;
    startTime: string;
    slaThresholdHours: number;
    timeRemainingHours: number;
    status: 'ok' | 'warning' | 'breach';
  }[];
  
  // Workload state
  workloadState: {
    operatorId: string;
    operatorName: string;
    activeTasks: number;
    criticalTasks: number;
    highTasks: number;
    mediumTasks: number;
    lowTasks: number;
    lastUpdated: string;
  }[];
  
  // Stream health
  streamHealth: {
    isActive: boolean;
    lastEventReceived: string;
    eventLag: number;
    missedEvents: number;
  };
  
  // Metadata
  createdAt: string;
  lastUpdated: string;
}

// ============================================================================
// REAL-TIME QUERY
// ============================================================================

/**
 * Real-time query
 */
export interface RealTimeQuery {
  queryId: string;
  description: string;
  
  // Scope
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Filters
  categories?: RealTimeMetricCategory[];
  operatorIds?: string[];
  severityFilter?: ('critical' | 'high' | 'medium' | 'low' | 'info')[];
  
  // Options
  options?: {
    includeHistory?: boolean;
    historyLimitMinutes?: number;
    includeBreakdown?: boolean;
    includeTrends?: boolean;
  };
  
  // Audit
  requestedBy: string;
  requestedAt: string;
}

// ============================================================================
// REAL-TIME RESULT
// ============================================================================

/**
 * Real-time result
 */
export interface RealTimeResult {
  resultId: string;
  query: RealTimeQuery;
  
  // Metrics
  metrics: RealTimeMetric[];
  
  // Stream state
  streamState: RealTimeStreamState;
  
  // References
  references: {
    taskIds: string[];
    alertIds: string[];
    auditFindingIds: string[];
    driftEventIds: string[];
    governanceLineageIds: string[];
    documentationBundleIds: string[];
    simulationScenarioIds: string[];
    analyticsMetricIds: string[];
  };
  
  // Summary
  summary: {
    totalMetrics: number;
    activeAlerts: number;
    activeTasks: number;
    operatorsOnline: number;
    avgResponseTime: number;
    slaAdherence: number;
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
// REAL-TIME REFERENCE
// ============================================================================

/**
 * Cross-engine reference
 */
export interface RealTimeReference {
  referenceId: string;
  referenceType: string;
  targetSystem: string;
  targetPhase: number;
  targetId: string;
  targetPath: string;
  description: string;
}

// ============================================================================
// REAL-TIME LOG
// ============================================================================

/**
 * Real-time log entry types
 */
export type RealTimeLogEntryType =
  | 'event-received'
  | 'metric-computed'
  | 'policy-decision'
  | 'stream-state-update'
  | 'error';

/**
 * Event received log entry
 */
export interface EventReceivedLogEntry {
  entryId: string;
  entryType: 'event-received';
  timestamp: string;
  event: RealTimeEvent;
}

/**
 * Metric computed log entry
 */
export interface MetricComputedLogEntry {
  entryId: string;
  entryType: 'metric-computed';
  timestamp: string;
  metric: RealTimeMetric;
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
 * Stream state update log entry
 */
export interface StreamStateUpdateLogEntry {
  entryId: string;
  entryType: 'stream-state-update';
  timestamp: string;
  stateId: string;
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  eventsProcessed: number;
  metricsComputed: number;
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
export type RealTimeLogEntry =
  | EventReceivedLogEntry
  | MetricComputedLogEntry
  | PolicyDecisionLogEntry
  | StreamStateUpdateLogEntry
  | ErrorLogEntry;

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Real-time statistics
 */
export interface RealTimeStatistics {
  totalEventsReceived: number;
  totalMetricsComputed: number;
  totalPolicyDecisions: number;
  
  byCategory: Record<RealTimeEventCategory, number>;
  bySeverity: Record<string, number>;
  byOperator: Record<string, number>;
  byTenant: Record<string, number>;
  
  streamHealth: {
    averageEventLag: number;
    missedEventsTotal: number;
    uptime: number;
  };
  
  trends: {
    eventsPerMinuteChange: number;
    metricsPerMinuteChange: number;
    slaAdherenceChange: number;
  };
}

// ============================================================================
// POLICY CONTEXT
// ============================================================================

/**
 * Real-time policy context
 */
export interface RealTimePolicyContext {
  userId: string;
  userTenantId: string;
  userFederationId?: string;
  permissions: string[];
}

/**
 * Real-time policy decision
 */
export interface RealTimePolicyDecision {
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
// EVENT SOURCES
// ============================================================================

/**
 * Event source configuration
 */
export interface EventSourceConfig {
  sourceId: string;
  sourceName: string;
  sourcePhase: number;
  enabled: boolean;
  eventCategories: RealTimeEventCategory[];
  pollingIntervalMs?: number;
  webhookUrl?: string;
}

/**
 * Event subscription
 */
export interface EventSubscription {
  subscriptionId: string;
  scope: {
    tenantId: string;
    facilityId?: string;
    federationId?: string;
  };
  categories: RealTimeEventCategory[];
  callback: (event: RealTimeEvent) => void;
  createdAt: string;
  lastEventReceived?: string;
}

// ============================================================================
// SLA CONFIGURATION
// ============================================================================

/**
 * SLA thresholds for real-time monitoring
 */
export interface RealTimeSLAThresholds {
  bySeverity: {
    critical: number; // Hours
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  byCategory?: Record<string, number>;
}
