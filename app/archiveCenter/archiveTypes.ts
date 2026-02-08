/**
 * Phase 61: Enterprise Archive & Retention Center
 * 
 * Type definitions for deterministic, read-only archival system.
 * 
 * Key Features:
 * - 11 archive categories from Phases 50-60
 * - Versioning support (v1, v2, v3...)
 * - Retention policies with legal hold flags
 * - Tenant isolation and federation rules
 * - Complete audit trail
 * 
 * NO GENERATIVE AI • NO SYNTHETIC DATA • DETERMINISTIC ONLY
 */

/**
 * Archive Categories
 * Each category corresponds to content from specific phases
 */
export type ArchiveCategory =
  | 'reports'                  // Phase 59: Enterprise Reporting
  | 'export-bundles'           // Phase 60: Export Hub
  | 'compliance-packs'         // Phases 32+59+60: Compliance documents
  | 'executive-insights'       // Phase 58: Executive Insights
  | 'capacity-projections'     // Phase 56: Capacity Forecasting
  | 'schedules'                // Phase 57: Workload Orchestration
  | 'performance-snapshots'    // Phases 54-55: Operator & Real-Time metrics
  | 'audit-logs'               // Phase 50: Audit & Governance
  | 'drift-logs'               // Phase 51: Drift Detection
  | 'alert-snapshots'          // Phase 52: Alert & Notification
  | 'task-snapshots';          // Phase 53: Task & Workflow

/**
 * Retention Action Types
 */
export type RetentionAction = 'expiry' | 'legal-hold' | 'restored' | 'deleted';

/**
 * Archive Item
 * Represents a single archived item with full metadata and versioning
 */
export interface ArchiveItem {
  archiveId: string;
  category: ArchiveCategory;
  version: number;
  scope: {
    tenantId: string;
    facilityId?: string;
    roomId?: string;
    federationId?: string;
  };
  content: {
    originalId: string;        // ID from source engine (reportId, exportId, etc.)
    originalType: string;       // Type from source engine
    data: Record<string, any>;  // Original data snapshot
    format?: string;            // Optional format (json, html, pdf, etc.)
    sizeBytes: number;
  };
  metadata: ArchiveMetadata;
  retention: {
    policyId: string;
    policyName: string;
    retentionDays: number;
    expiresAt: string;          // ISO timestamp when archive expires
    legalHold: boolean;         // Prevents deletion if true
    legalHoldReason?: string;
    legalHoldBy?: string;
    legalHoldAt?: string;
  };
  references: ArchiveReference;
  createdAt: string;
  archivedAt: string;
  archivedBy: string;
  softDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deletedReason?: string;
}

/**
 * Archive Metadata
 * Descriptive information about the archived item
 */
export interface ArchiveMetadata {
  title: string;
  description?: string;
  tags: string[];
  sourcePhase: string;         // e.g., "Phase 59: Enterprise Reporting"
  sourceEngine: string;         // e.g., "reportingEngine"
  originalTimestamp: string;    // When item was created in source engine
  dataQuality: {
    complete: boolean;
    validated: boolean;
    checksumMD5?: string;
  };
  accessCount: number;          // Number of times retrieved
  lastAccessedAt?: string;
  lastAccessedBy?: string;
}

/**
 * Archive Version
 * Represents a specific version of an archived item
 */
export interface ArchiveVersion {
  versionId: string;
  archiveId: string;
  version: number;
  archivedAt: string;
  archivedBy: string;
  changeDescription?: string;
  contentSizeBytes: number;
  metadata: {
    title: string;
    tags: string[];
  };
}

/**
 * Archive Reference
 * Cross-references to related items in source engines (Phases 50-60)
 */
export interface ArchiveReference {
  reportIds?: string[];              // Phase 59
  exportIds?: string[];              // Phase 60
  compliancePackIds?: string[];      // Phases 32+59+60
  insightIds?: string[];             // Phase 58
  capacityProjectionIds?: string[];  // Phase 56
  scheduleIds?: string[];            // Phase 57
  operatorMetricIds?: string[];      // Phase 54
  realTimeSignalIds?: string[];      // Phase 55
  taskIds?: string[];                // Phase 53
  alertIds?: string[];               // Phase 52
  driftEventIds?: string[];          // Phase 51
  auditFindingIds?: string[];        // Phase 50
}

/**
 * Archive Query
 * Request to archive, retrieve, or list archived items
 */
export interface ArchiveQuery {
  queryId: string;
  queryType: 'create' | 'retrieve' | 'list' | 'versions' | 'retention-check';
  description: string;
  
  // Filtering criteria
  filters?: {
    archiveIds?: string[];
    categories?: ArchiveCategory[];
    tenantId?: string;
    facilityId?: string;
    roomId?: string;
    federationId?: string;
    timeRange?: {
      start: string;
      end: string;
    };
    referenceIds?: {
      type: string;  // 'reportId', 'exportId', etc.
      ids: string[];
    };
    includeDeleted?: boolean;
    onlyLegalHold?: boolean;
  };
  
  // For create operations
  createData?: {
    category: ArchiveCategory;
    originalId: string;
    originalType: string;
    data: Record<string, any>;
    format?: string;
    metadata: {
      title: string;
      description?: string;
      tags: string[];
      sourcePhase: string;
      sourceEngine: string;
      originalTimestamp: string;
    };
    references?: ArchiveReference;
    retentionPolicyId: string;
  };
  
  requestedBy: string;
  requestedAt: string;
}

/**
 * Archive Result
 * Response from archive operations
 */
export interface ArchiveResult {
  resultId: string;
  query: ArchiveQuery;
  success: boolean;
  
  // Single item result (for retrieve, create)
  item?: ArchiveItem;
  
  // Multiple items result (for list)
  items?: ArchiveItem[];
  
  // Version history result
  versions?: ArchiveVersion[];
  
  // Retention evaluation result
  retentionStatus?: {
    evaluated: number;
    expired: number;
    active: number;
    legalHold: number;
    daysUntilExpiry?: number;
  };
  
  error?: string;
  
  metadata: {
    executedAt: string;
    executionTimeMs: number;
    itemsReturned: number;
    totalMatching?: number;
  };
}

/**
 * Archive Retention Policy
 * Defines retention rules for archive categories
 */
export interface ArchiveRetentionPolicy {
  policyId: string;
  policyName: string;
  category: ArchiveCategory;
  tenantId?: string;           // If tenant-specific, otherwise global
  retentionDays: number;
  description: string;
  autoDelete: boolean;         // Auto-delete expired items
  requiresApproval: boolean;   // Requires approval before deletion
  createdAt: string;
  createdBy: string;
  active: boolean;
}

/**
 * Archive Policy Context
 * User context for policy evaluation
 */
export interface ArchivePolicyContext {
  userId: string;
  userTenantId: string;
  userFederationId?: string;
  permissions: string[];
  role: 'executive' | 'admin' | 'manager' | 'operator' | 'auditor' | 'compliance-officer';
}

/**
 * Archive Policy Decision
 * Result of policy evaluation
 */
export interface ArchivePolicyDecision {
  allowed: boolean;
  reason: string;
  violations: string[];
  warnings: string[];
  restrictions: string[];
}

/**
 * Archive Policy Audit Entry
 * Complete audit record of policy decision
 */
export interface ArchivePolicyAudit {
  auditId: string;
  timestamp: string;
  userId: string;
  userRole: string;
  tenantId: string;
  queryId: string;
  queryDescription: string;
  queryType: string;
  queryScope: {
    tenantId?: string;
    facilityId?: string;
    federationId?: string;
    categories?: ArchiveCategory[];
  };
  decision: ArchivePolicyDecision;
  policyVersion: string;
}

/**
 * Archive Log Entry Types
 */

export interface ArchiveCreatedLogEntry {
  entryType: 'archive-created';
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  archive: {
    archiveId: string;
    category: ArchiveCategory;
    version: number;
    originalId: string;
    originalType: string;
    sizeBytes: number;
    retentionDays: number;
    expiresAt: string;
  };
  createdBy: string;
}

export interface ArchiveRetrievedLogEntry {
  entryType: 'archive-retrieved';
  timestamp: string;
  tenantId: string;
  retrieval: {
    archiveId: string;
    category: ArchiveCategory;
    version: number;
    accessMethod: string;  // 'direct', 'search', 'reference'
  };
  retrievedBy: string;
}

export interface ArchiveRetentionActionLogEntry {
  entryType: 'archive-retention-action';
  timestamp: string;
  tenantId: string;
  action: {
    archiveId: string;
    category: ArchiveCategory;
    actionType: RetentionAction;
    reason: string;
    previousState?: string;
    newState?: string;
  };
  performedBy: string;
}

export interface ArchivePolicyDecisionLogEntry {
  entryType: 'archive-policy-decision';
  timestamp: string;
  decision: {
    queryId: string;
    queryType: string;
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

export interface ArchiveErrorLogEntry {
  entryType: 'archive-error';
  timestamp: string;
  tenantId?: string;
  error: {
    queryId: string;
    errorCode: string;
    message: string;
    details?: any;
  };
  userId: string;
}

export type ArchiveLogEntry =
  | ArchiveCreatedLogEntry
  | ArchiveRetrievedLogEntry
  | ArchiveRetentionActionLogEntry
  | ArchivePolicyDecisionLogEntry
  | ArchiveErrorLogEntry;

/**
 * Archive Statistics
 * Aggregate statistics about archived items
 */
export interface ArchiveStatistics {
  totalArchives: number;
  totalRetrievals: number;
  totalSizeBytes: number;
  byCategory: Record<ArchiveCategory, number>;
  byTenant: Record<string, number>;
  byRetentionStatus: {
    active: number;
    expiring: number;      // Expires within 30 days
    expired: number;
    legalHold: number;
    deleted: number;
  };
  averageSizeBytes: number;
  averageRetentionDays: number;
  trends: {
    archivesChange: string;    // "+12.5%" or "-5.2%" (24h change)
    retrievalsChange: string;
    storageChange: string;     // Storage size change
  };
}

/**
 * Archive Search Result
 * Result from archive search operations
 */
export interface ArchiveSearchResult {
  searchId: string;
  query: string;
  matches: {
    archiveId: string;
    category: ArchiveCategory;
    title: string;
    description?: string;
    relevance: number;        // 0-100 relevance score
    matchedFields: string[];
  }[];
  totalMatches: number;
  executionTimeMs: number;
}
