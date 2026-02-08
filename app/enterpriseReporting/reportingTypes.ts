/**
 * ENTERPRISE REPORTING & COMPLIANCE PACK GENERATOR - TYPES
 * Phase 59: Expansion Track
 * 
 * Deterministic report generation from real engine outputs.
 * 
 * NO GENERATIVE AI. Reports derived from Phases 50-58.
 */

// ============================================================================
// REPORT CATEGORIES
// ============================================================================

export type ReportCategory =
  | 'executive-summary'          // C-level overview report
  | 'sla-compliance'             // SLA tracking and compliance
  | 'capacity-scheduling'        // Capacity and workload reports
  | 'operator-performance'       // Workforce analytics
  | 'risk-drift'                 // Risk and integrity reports
  | 'audit-governance'           // Audit and compliance reports
  | 'documentation-completeness' // Documentation status reports
  | 'cross-engine-operational'   // Multi-engine operational report
  | 'compliance-pack';           // Full compliance bundle (Phase 32 integration)

export type ReportFormat =
  | 'json'        // Structured JSON
  | 'markdown'    // Markdown document
  | 'html'        // HTML document
  | 'csv';        // Tabular CSV

export type ReportTimePeriod =
  | 'daily'       // Last 24 hours
  | 'weekly'      // Last 7 days
  | 'monthly'     // Last 30 days
  | 'quarterly'   // Last 90 days
  | 'custom';     // Custom date range

// ============================================================================
// REPORT QUERY
// ============================================================================

export interface ReportQuery {
  queryId: string;
  description: string;
  
  // Scope
  scope: {
    tenantId?: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Report configuration
  category: ReportCategory;
  timePeriod: ReportTimePeriod;
  customTimeRange?: {
    start: string; // ISO 8601
    end: string;   // ISO 8601
  };
  format: ReportFormat;
  
  // Options
  includeSummary: boolean;
  includeDetails: boolean;
  includeRecommendations: boolean;
  includeReferences: boolean;
  includeMetadata: boolean;
  
  // Request info
  requestedBy: string;
  requestedAt: string; // ISO 8601
}

// ============================================================================
// REPORT SECTIONS
// ============================================================================

export interface ReportSection {
  sectionId: string;
  title: string;
  sectionType: 
    | 'executive-summary'
    | 'kpi-overview'
    | 'detailed-metrics'
    | 'trend-analysis'
    | 'compliance-status'
    | 'risk-assessment'
    | 'recommendations'
    | 'references';
  
  content: {
    summary?: string;
    metrics?: Record<string, number | string>;
    tables?: ReportTable[];
    charts?: ReportChart[];
    text?: string;
  };
  
  // Data sources
  dataSources: string[]; // Phase references
  computedAt: string;    // ISO 8601
}

export interface ReportTable {
  tableId: string;
  title: string;
  headers: string[];
  rows: (string | number)[][];
  footer?: string;
}

export interface ReportChart {
  chartId: string;
  title: string;
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color?: string;
    }[];
  };
}

// ============================================================================
// REPORT BUNDLE
// ============================================================================

export interface ReportBundle {
  bundleId: string;
  reportId: string;
  
  // Metadata
  title: string;
  category: ReportCategory;
  timePeriod: ReportTimePeriod;
  periodStart: string; // ISO 8601
  periodEnd: string;   // ISO 8601
  
  // Scope
  scope: {
    tenantId?: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Content
  sections: ReportSection[];
  
  // Executive summary (always included)
  executiveSummary: {
    overview: string;
    keyFindings: string[];
    criticalIssues: string[];
    recommendations: string[];
  };
  
  // References to source data
  references: ReportReferences;
  
  // Metadata
  metadata: {
    generatedAt: string;   // ISO 8601
    generatedBy: string;
    format: ReportFormat;
    pageCount?: number;
    wordCount?: number;
    dataSourcesUsed: string[];
    computationTimeMs: number;
  };
}

export interface ReportReferences {
  // Phase 58: Executive Insights
  insightIds: string[];
  
  // Phase 54: Operator Analytics
  metricIds: string[];
  
  // Phase 55: Real-Time Monitoring
  signalIds: string[];
  
  // Phase 56: Capacity Planning
  projectionIds: string[];
  
  // Phase 57: Workload Orchestration
  scheduleIds: string[];
  
  // Phase 53: Action Center
  taskIds: string[];
  
  // Phase 52: Alert Center
  alertIds: string[];
  
  // Phase 51: Integrity Monitor
  driftIds: string[];
  
  // Phase 50: Auditor
  auditFindingIds: string[];
}

// ============================================================================
// REPORT RESULT
// ============================================================================

export interface ReportResult {
  resultId: string;
  query: ReportQuery;
  
  // Output
  bundle?: ReportBundle;
  
  // Export
  exportedContent?: {
    format: ReportFormat;
    content: string;     // JSON, Markdown, HTML, or CSV
    filename: string;
    sizeBytes: number;
  };
  
  // Status
  success: boolean;
  error?: string;
  
  // Metadata
  metadata: {
    generatedAt: string;
    generationTimeMs: number;
    sectionsGenerated: number;
    referencesIncluded: number;
  };
}

// ============================================================================
// POLICY CONTEXT
// ============================================================================

export interface ReportingPolicyContext {
  userId: string;
  userTenantId: string;
  userFederationId?: string;
  permissions: string[];
  role: 'executive' | 'admin' | 'manager' | 'operator' | 'auditor';
}

export interface ReportingPolicyDecision {
  allowed: boolean;
  reason: string;
  violations: string[];
  warnings: string[];
  restrictions: string[];
}

export interface ReportingPolicyAudit {
  auditId: string;
  timestamp: string;
  userId: string;
  userRole: string;
  tenantId: string;
  queryId: string;
  queryDescription: string;
  queryScope: {
    tenantId?: string;
    facilityId?: string;
    federationId?: string;
  };
  decision: ReportingPolicyDecision;
  policyVersion: string;
}

// ============================================================================
// REPORT LOG
// ============================================================================

export type ReportLogEntryType =
  | 'report-generated'
  | 'report-exported'
  | 'policy-decision'
  | 'error';

export interface ReportGeneratedLogEntry {
  entryId: string;
  entryType: 'report-generated';
  timestamp: string;
  tenantId?: string;
  facilityId?: string;
  
  report: {
    bundleId: string;
    category: ReportCategory;
    timePeriod: ReportTimePeriod;
    sectionsGenerated: number;
    format: ReportFormat;
  };
  
  generatedBy: string;
}

export interface ReportExportedLogEntry {
  entryId: string;
  entryType: 'report-exported';
  timestamp: string;
  tenantId?: string;
  
  export: {
    bundleId: string;
    format: ReportFormat;
    filename: string;
    sizeBytes: number;
  };
  
  exportedBy: string;
}

export interface ReportPolicyDecisionLogEntry {
  entryId: string;
  entryType: 'policy-decision';
  timestamp: string;
  
  decision: {
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
  };
  
  userId: string;
}

export interface ReportErrorLogEntry {
  entryId: string;
  entryType: 'error';
  timestamp: string;
  tenantId?: string;
  
  error: {
    queryId: string;
    errorCode: string;
    message: string;
    details?: string;
  };
  
  userId: string;
}

export type ReportLogEntry =
  | ReportGeneratedLogEntry
  | ReportExportedLogEntry
  | ReportPolicyDecisionLogEntry
  | ReportErrorLogEntry;

// ============================================================================
// REPORT STATISTICS
// ============================================================================

export interface ReportStatistics {
  totalReports: number;
  totalExports: number;
  
  // By category
  byCategory: Record<ReportCategory, number>;
  
  // By tenant
  byTenant: Record<string, number>;
  
  // By time period
  byTimePeriod: Record<ReportTimePeriod, number>;
  
  // By format
  byFormat: Record<ReportFormat, number>;
  
  // Performance
  averageGenerationTimeMs: number;
  
  // Recent activity (last 24 hours vs previous 24 hours)
  trends: {
    reportsChange: string;   // "+12%"
    exportsChange: string;   // "-5%"
  };
}

// ============================================================================
// DATA INPUT (from Phases 50-58)
// ============================================================================

export interface ReportingDataInput {
  // Phase 58: Executive Insights
  insights?: {
    resultId: string;
    summaries: any[]; // InsightSummary from Phase 58
    trends: any[];
    correlations: any[];
  }[];
  
  // Phase 54: Operator Analytics
  operatorMetrics?: {
    operatorId: string;
    operatorName: string;
    utilizationRate: number;
    taskCompletionRate: number;
    slaComplianceRate: number;
    tenantId: string;
    facilityId: string;
  }[];
  
  // Phase 55: Real-Time Monitoring
  realTimeSignals?: {
    signalId: string;
    metric: string;
    value: number;
    severity: string;
    timestamp: string;
    tenantId: string;
    facilityId: string;
    roomId?: string;
  }[];
  
  // Phase 56: Capacity Planning
  capacityProjections?: {
    projectionId: string;
    category: string;
    projectedCapacity: number;
    riskLevel: string;
    windowStart: string;
    windowEnd: string;
    tenantId: string;
    facilityId: string;
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
    facilityId: string;
  }[];
  
  // Phase 53: Action Center
  tasks?: {
    taskId: string;
    priority: string;
    status: string;
    completedAt?: string;
    slaDeadline?: string;
    tenantId: string;
    facilityId: string;
  }[];
  
  // Phase 52: Alert Center
  alerts?: {
    alertId: string;
    severity: string;
    category: string;
    status: string;
    slaDeadline?: string;
    tenantId: string;
    facilityId: string;
  }[];
  
  // Phase 51: Integrity Monitor
  driftEvents?: {
    driftId: string;
    severity: number;
    category: string;
    detected: string;
    tenantId: string;
    facilityId: string;
  }[];
  
  // Phase 50: Auditor
  auditFindings?: {
    findingId: string;
    severity: string;
    category: string;
    status: string;
    tenantId: string;
    facilityId: string;
  }[];
}
