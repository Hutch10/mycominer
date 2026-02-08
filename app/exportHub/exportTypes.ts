/**
 * Export Hub Types
 * Phase 60: Enterprise Export Hub & External Compliance Distribution Center
 * 
 * Deterministic export system for packaging operational data into external-ready bundles.
 * 
 * CONSTRAINTS:
 * - NO generative AI or synthetic data
 * - Read-only operations (no modifications to source data)
 * - Strict tenant isolation and federation rules
 * - Complete audit trail for all exports
 * - Deterministic bundle assembly from real engine outputs
 */

// ============================================================================
// EXPORT CATEGORIES
// ============================================================================

/**
 * Export category types
 * 
 * Categories determine which data sources are included in the export bundle.
 */
export type ExportCategory =
  | 'compliance-pack'          // Full compliance bundle (audit findings, drift logs, SLA reports, documentation)
  | 'executive-summary'        // Executive insights and reports from Phase 58-59
  | 'operational-snapshot'     // Tasks, alerts, schedules, capacity from Phases 52-57
  | 'audit-findings'           // Phase 50 audit findings only
  | 'drift-logs'               // Phase 51 drift events only
  | 'alert-logs'               // Phase 52 alerts only
  | 'task-logs'                // Phase 53 tasks only
  | 'operator-analytics'       // Phase 54 operator metrics only
  | 'real-time-metrics'        // Phase 55 real-time signals only
  | 'capacity-forecasts'       // Phase 56 capacity projections only
  | 'schedules'                // Phase 57 schedules only
  | 'insights'                 // Phase 58 insights only
  | 'reports'                  // Phase 59 reports only
  | 'full-operational';        // Everything from Phases 50-59

/**
 * Export format types
 * 
 * Formats determine how the export bundle is serialized and packaged.
 */
export type ExportFormat =
  | 'json'                     // Single JSON file with complete bundle
  | 'csv'                      // CSV files (metrics only, tabular)
  | 'html'                     // Single styled HTML document
  | 'markdown'                 // Markdown documentation file
  | 'zip'                      // ZIP archive with multiple files (JSON + CSV + HTML)
  | 'auditor-package';         // Compliance package with structured folders and metadata

// ============================================================================
// EXPORT QUERY
// ============================================================================

/**
 * Export query
 * 
 * Describes what to export, for whom, and in what format.
 */
export interface ExportQuery {
  queryId: string;
  description: string;
  
  // Scope
  scope: {
    tenantId?: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Category and format
  category: ExportCategory;
  format: ExportFormat;
  
  // Time range (optional - uses default if not specified)
  timeRange?: {
    start: string;  // ISO 8601
    end: string;    // ISO 8601
  };
  
  // Options
  includeMetadata: boolean;        // Include export metadata
  includeReferences: boolean;      // Include references to source data
  includeRawData: boolean;         // Include raw data (not just summaries)
  compressOutput: boolean;         // Compress large exports
  
  // Requester
  requestedBy: string;
  requestedAt: string;
}

// ============================================================================
// EXPORT CONTENT
// ============================================================================

/**
 * Export content section
 * 
 * A section of content within the export bundle.
 */
export interface ExportContentSection {
  sectionId: string;
  title: string;
  description: string;
  dataSource: string;  // e.g., "Phase 50: Audit & Governance Engine"
  
  // Content
  summary?: string;
  items: ExportContentItem[];
  
  // Metadata
  itemCount: number;
  generatedAt: string;
}

/**
 * Export content item
 * 
 * An individual item within a content section.
 */
export interface ExportContentItem {
  itemId: string;
  itemType: string;  // e.g., "audit-finding", "drift-event", "task", "alert"
  timestamp: string;
  data: Record<string, any>;  // Raw data from source engine
  references?: string[];      // References to related items
}

// ============================================================================
// EXPORT BUNDLE
// ============================================================================

/**
 * Export bundle
 * 
 * Complete export package ready for serialization and distribution.
 */
export interface ExportBundle {
  bundleId: string;
  exportId: string;
  title: string;
  description: string;
  
  // Classification
  category: ExportCategory;
  format: ExportFormat;
  
  // Scope
  scope: {
    tenantId?: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Time range
  timeRange: {
    start: string;
    end: string;
  };
  
  // Content
  sections: ExportContentSection[];
  
  // References to source data
  references: ExportReferences;
  
  // Metadata
  metadata: ExportMetadata;
}

/**
 * Export references
 * 
 * References to all source data included in the export.
 */
export interface ExportReferences {
  // Phase 50: Audit & Governance
  auditFindingIds: string[];
  
  // Phase 51: Drift Detection
  driftEventIds: string[];
  
  // Phase 52: Alert & Notification
  alertIds: string[];
  
  // Phase 53: Task & Workflow
  taskIds: string[];
  
  // Phase 54: Operator & Team Performance
  operatorMetricIds: string[];
  
  // Phase 55: Real-Time Telemetry
  realTimeSignalIds: string[];
  
  // Phase 56: Capacity Forecasting
  capacityProjectionIds: string[];
  
  // Phase 57: Workload Orchestration
  scheduleIds: string[];
  
  // Phase 58: Executive Insights
  insightIds: string[];
  
  // Phase 59: Enterprise Reporting
  reportIds: string[];
}

/**
 * Export metadata
 * 
 * Metadata about the export bundle.
 */
export interface ExportMetadata {
  generatedAt: string;
  generatedBy: string;
  format: ExportFormat;
  
  // Size information
  totalSections: number;
  totalItems: number;
  estimatedSizeBytes: number;
  
  // Data sources
  dataSourcesUsed: string[];  // e.g., ["Phase 50", "Phase 51", ...]
  timeRange: {
    start: string;
    end: string;
  };
  
  // Computation
  computationTimeMs: number;
  
  // Compression (if applicable)
  compressed: boolean;
  compressionRatio?: number;  // e.g., 0.6 means 60% of original size
}

// ============================================================================
// EXPORT RESULT
// ============================================================================

/**
 * Export result
 * 
 * Result of an export operation.
 */
export interface ExportResult {
  resultId: string;
  query: ExportQuery;
  
  // Bundle (if successful)
  bundle?: ExportBundle;
  
  // Exported content (serialized)
  exportedContent?: {
    format: ExportFormat;
    content: string | Uint8Array;  // String for text formats, Uint8Array for binary (ZIP)
    filename: string;
    sizeBytes: number;
    mimeType: string;
  };
  
  // Status
  success: boolean;
  error?: string;
  
  // Metadata
  metadata: {
    generatedAt: string;
    generationTimeMs: number;
    sectionsGenerated: number;
    itemsIncluded: number;
    referencesIncluded: number;
  };
}

// ============================================================================
// POLICY TYPES
// ============================================================================

/**
 * Export policy context
 * 
 * User context for policy evaluation.
 */
export interface ExportPolicyContext {
  userId: string;
  userTenantId: string;
  userFederationId?: string;
  permissions: string[];  // e.g., ["export:cross-tenant", "export:compliance-pack"]
  role: 'executive' | 'admin' | 'manager' | 'operator' | 'auditor';
}

/**
 * Export policy decision
 * 
 * Result of policy evaluation.
 */
export interface ExportPolicyDecision {
  allowed: boolean;
  reason: string;
  violations: string[];
  warnings: string[];
  restrictions: string[];
}

/**
 * Export policy audit entry
 * 
 * Audit record of a policy decision.
 */
export interface ExportPolicyAudit {
  auditId: string;
  timestamp: string;
  userId: string;
  userRole: string;
  tenantId: string;
  
  // Query
  queryId: string;
  queryDescription: string;
  queryScope: {
    tenantId?: string;
    facilityId?: string;
    federationId?: string;
  };
  
  // Decision
  decision: ExportPolicyDecision;
  policyVersion: string;
}

// ============================================================================
// LOG ENTRY TYPES
// ============================================================================

/**
 * Base log entry
 */
interface BaseLogEntry {
  entryId: string;
  entryType: 'export-generated' | 'export-downloaded' | 'policy-decision' | 'error';
  timestamp: string;
}

/**
 * Export generated log entry
 */
export interface ExportGeneratedLogEntry extends BaseLogEntry {
  entryType: 'export-generated';
  tenantId: string;
  facilityId?: string;
  export: {
    bundleId: string;
    category: ExportCategory;
    format: ExportFormat;
    sectionsGenerated: number;
    itemsIncluded: number;
    sizeBytes: number;
  };
  generatedBy: string;
}

/**
 * Export downloaded log entry
 */
export interface ExportDownloadedLogEntry extends BaseLogEntry {
  entryType: 'export-downloaded';
  tenantId: string;
  download: {
    bundleId: string;
    format: ExportFormat;
    filename: string;
    sizeBytes: number;
  };
  downloadedBy: string;
}

/**
 * Policy decision log entry
 */
export interface ExportPolicyDecisionLogEntry extends BaseLogEntry {
  entryType: 'policy-decision';
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

/**
 * Error log entry
 */
export interface ExportErrorLogEntry extends BaseLogEntry {
  entryType: 'error';
  tenantId?: string;
  error: {
    queryId: string;
    errorCode: string;
    message: string;
    details?: any;
  };
  userId: string;
}

/**
 * Union type for all log entries
 */
export type ExportLogEntry =
  | ExportGeneratedLogEntry
  | ExportDownloadedLogEntry
  | ExportPolicyDecisionLogEntry
  | ExportErrorLogEntry;

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Export statistics
 * 
 * Aggregate statistics for export operations.
 */
export interface ExportStatistics {
  totalExports: number;
  totalDownloads: number;
  
  // By category
  byCategory: Record<ExportCategory, number>;
  
  // By tenant
  byTenant: Record<string, number>;
  
  // By format
  byFormat: Record<ExportFormat, number>;
  
  // Average metrics
  averageGenerationTimeMs: number;
  averageSizeBytes: number;
  
  // Trends (24-hour change)
  trends: {
    exportsChange: string;     // e.g., "+12.5%" or "-5.2%"
    downloadsChange: string;
  };
}

// ============================================================================
// DATA INPUT (from Phases 50-59)
// ============================================================================

/**
 * Export data input
 * 
 * Data from all operational engines (Phases 50-59).
 */
export interface ExportDataInput {
  // Phase 50: Audit & Governance
  auditFindings?: Array<{
    auditFindingId: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    status: 'open' | 'in-progress' | 'resolved';
    description: string;
    foundAt: string;
    resolvedAt?: string;
    tenantId: string;
    facilityId?: string;
    roomId?: string;
  }>;
  
  // Phase 51: Drift Detection
  driftEvents?: Array<{
    driftId: string;
    severity: number;  // 0-100
    category: string;
    detectedAt: string;
    resolvedAt?: string;
    tenantId: string;
    facilityId?: string;
    roomId?: string;
  }>;
  
  // Phase 52: Alert & Notification
  alerts?: Array<{
    alertId: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    status: 'active' | 'acknowledged' | 'resolved';
    createdAt: string;
    resolvedAt?: string;
    slaDeadline?: string;
    tenantId: string;
    facilityId?: string;
    roomId?: string;
  }>;
  
  // Phase 53: Task & Workflow
  tasks?: Array<{
    taskId: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    createdAt: string;
    completedAt?: string;
    slaDeadline?: string;
    assignedTo?: string;
    tenantId: string;
    facilityId?: string;
  }>;
  
  // Phase 54: Operator & Team Performance
  operatorMetrics?: Array<{
    metricId: string;
    operatorId: string;
    operatorName: string;
    utilizationRate: number;
    taskCompletionRate: number;
    slaComplianceRate: number;
    timestamp: string;
    tenantId: string;
    facilityId?: string;
  }>;
  
  // Phase 55: Real-Time Telemetry
  realTimeSignals?: Array<{
    signalId: string;
    metric: string;
    value: number;
    unit: string;
    severity?: 'critical' | 'high' | 'medium' | 'low';
    timestamp: string;
    tenantId: string;
    facilityId?: string;
    roomId?: string;
  }>;
  
  // Phase 56: Capacity Forecasting
  capacityProjections?: Array<{
    projectionId: string;
    category: string;
    projectedCapacity: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    windowStart: string;
    windowEnd: string;
    tenantId: string;
    facilityId?: string;
  }>;
  
  // Phase 57: Workload Orchestration
  schedules?: Array<{
    scheduleId: string;
    totalSlots: number;
    totalConflicts: number;
    criticalConflicts: number;
    averageCapacityUtilization: number;
    slaRiskScore: number;
    timestamp: string;
    tenantId: string;
    facilityId?: string;
  }>;
  
  // Phase 58: Executive Insights
  insights?: Array<{
    insightId: string;
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    summary: string;
    metrics: Record<string, number>;
    timestamp: string;
    tenantId: string;
  }>;
  
  // Phase 59: Enterprise Reporting
  reports?: Array<{
    reportId: string;
    category: string;
    title: string;
    sectionsCount: number;
    generatedAt: string;
    tenantId: string;
    facilityId?: string;
  }>;
}
