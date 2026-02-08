/**
 * Phase 52: Unified Alerting & Notification Center — Type Definitions
 * 
 * Deterministic, cross-engine alert aggregation with tenant isolation.
 * NO generative AI, NO invented alerts, NO predictions.
 */

// ============================================================================
// ALERT SEVERITY & CATEGORY
// ============================================================================

/**
 * Alert severity levels (consistent with Phase 51 MonitorSeverity).
 */
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Alert categories covering all system engines.
 */
export type AlertCategory =
  | 'integrity-drift'           // Phase 51: Integrity Monitor
  | 'audit-finding'             // Phase 50: Autonomous Auditor
  | 'governance-drift'          // Phase 44: Governance System
  | 'governance-lineage-break'  // Phase 45: Governance Lineage
  | 'fabric-link-break'         // Phase 46: Knowledge Fabric
  | 'documentation-drift'       // Phase 47: Documentation Bundler
  | 'health-drift'              // Phase 43: Health Engine (non-biological)
  | 'analytics-anomaly'         // Phase 39: Pattern Recognition
  | 'timeline-incident'         // Phase 38: Incident Tracker / Phase 35: Timeline
  | 'compliance-issue'          // Phase 32: Compliance Engine
  | 'simulation-mismatch'       // Phase 49: Simulation Engine
  | 'intelligence-finding';     // Phase 48: Intelligence Hub

/**
 * Alert source engines (Phases 32-51).
 */
export type AlertSource =
  | 'integrity-monitor'         // Phase 51
  | 'auditor'                   // Phase 50
  | 'health-engine'             // Phase 43
  | 'governance-system'         // Phase 44
  | 'governance-lineage'        // Phase 45
  | 'knowledge-fabric'          // Phase 46
  | 'documentation-bundler'     // Phase 47
  | 'intelligence-hub'          // Phase 48
  | 'simulation-engine'         // Phase 49
  | 'timeline-system'           // Phase 35 / Phase 38
  | 'analytics-engine'          // Phase 39
  | 'compliance-engine';        // Phase 32

// ============================================================================
// ALERT SCOPE
// ============================================================================

/**
 * Scope defines tenant/facility/room boundaries for alerts.
 */
export interface AlertScope {
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  includeArchived?: boolean;
}

// ============================================================================
// ALERT REFERENCE
// ============================================================================

/**
 * Reference to related entities across engines.
 */
export interface AlertReference {
  referenceId: string;
  referenceType:
    | 'governance-decision'
    | 'lineage-chain'
    | 'workflow'
    | 'sop'
    | 'document'
    | 'fabric-link'
    | 'health-metric'
    | 'pattern'
    | 'compliance-pack'
    | 'entity'
    | 'incident'
    | 'audit-result'
    | 'integrity-alert'
    | 'simulation-scenario'
    | 'intelligence-result';
  entityId: string;
  entityType: string;
  title: string;
  sourceEngine: AlertSource;
  url?: string; // Optional deep link
}

// ============================================================================
// ALERT EVIDENCE
// ============================================================================

/**
 * Evidence supporting an alert (drift detection, validation failure, etc.).
 */
export interface AlertEvidence {
  field: string;
  baselineValue?: any;
  currentValue?: any;
  drift?: {
    type: 'added' | 'removed' | 'modified' | 'broken';
    details: string;
  };
  additionalContext?: string;
}

// ============================================================================
// ALERT
// ============================================================================

/**
 * Core alert object (normalized from all engines).
 */
export interface Alert {
  alertId: string;
  category: AlertCategory;
  severity: AlertSeverity;
  source: AlertSource;
  title: string;
  description: string;
  scope: AlertScope;
  affectedEntities: AlertReference[];
  relatedReferences: AlertReference[];
  evidence?: AlertEvidence[];
  detectedAt: string; // ISO timestamp
  status: 'new' | 'acknowledged' | 'resolved' | 'false-positive' | 'suppressed';
  assignedTo?: string; // User ID
  metadata: {
    sourceAlertId?: string; // Original alert ID from source engine
    ruleId?: string;
    checkId?: string;
    auditId?: string;
    incidentId?: string;
    tags?: string[];
  };
}

// ============================================================================
// ALERT GROUP
// ============================================================================

/**
 * Group of related alerts (by category, severity, entity, or engine).
 */
export interface AlertGroup {
  groupId: string;
  groupType: 'category' | 'severity' | 'entity' | 'engine' | 'custom';
  groupKey: string; // e.g., "governance-drift", "critical", "workflow-wf-12"
  alerts: Alert[];
  summary: {
    totalAlerts: number;
    newAlerts: number;
    alertsByCategory: Record<AlertCategory, number>;
    alertsBySeverity: Record<AlertSeverity, number>;
    affectedEntitiesCount: number;
  };
  evidence: AlertEvidence[]; // Merged evidence from all alerts
  references: AlertReference[]; // Merged references from all alerts
  metadata: {
    createdAt: string;
    updatedAt: string;
    groupedBy: string; // User ID or 'system'
  };
}

// ============================================================================
// ALERT QUERY
// ============================================================================

/**
 * Query object for retrieving alerts.
 */
export interface AlertQuery {
  queryId: string;
  description: string;
  scope: AlertScope;
  categories?: AlertCategory[];
  severities?: AlertSeverity[];
  sources?: AlertSource[];
  status?: ('new' | 'acknowledged' | 'resolved' | 'false-positive' | 'suppressed')[];
  entityId?: string; // Filter by affected entity
  entityType?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  options?: {
    includeSuppressed?: boolean;
    maxAlerts?: number;
    sortBy?: 'severity' | 'detectedAt' | 'category' | 'source';
    sortOrder?: 'asc' | 'desc';
    groupBy?: 'category' | 'severity' | 'entity' | 'engine';
  };
  triggeredBy: string; // User ID
  triggeredAt: string; // ISO timestamp
}

// ============================================================================
// ALERT RESULT
// ============================================================================

/**
 * Result from an alert query.
 */
export interface AlertResult {
  resultId: string;
  query: AlertQuery;
  alerts: Alert[];
  groups?: AlertGroup[];
  totalAlerts: number;
  newAlerts: number;
  summary: {
    alertsByCategory: Record<AlertCategory, number>;
    alertsBySeverity: Record<AlertSeverity, number>;
    alertsBySource: Record<AlertSource, number>;
    affectedEntitiesCount: number;
  };
  metadata: {
    executionTime: number; // milliseconds
    evaluatedEngines: AlertSource[];
    scope: AlertScope;
    queriedAt: string;
    completedAt: string;
  };
  success: boolean;
  error?: string;
}

// ============================================================================
// ALERT LOG ENTRY
// ============================================================================

/**
 * Log entry for alert center operations.
 */
export type AlertLogEntry =
  | {
      entryId: string;
      entryType: 'alert';
      timestamp: string;
      tenantId: string;
      facilityId?: string;
      performedBy: string;
      success: boolean;
      details: {
        alert: Alert;
      };
    }
  | {
      entryId: string;
      entryType: 'query';
      timestamp: string;
      tenantId: string;
      facilityId?: string;
      performedBy: string;
      success: boolean;
      details: {
        query: AlertQuery;
        resultId: string;
        totalAlerts: number;
      };
    }
  | {
      entryId: string;
      entryType: 'group';
      timestamp: string;
      tenantId: string;
      facilityId?: string;
      performedBy: string;
      success: boolean;
      details: {
        group: AlertGroup;
      };
    }
  | {
      entryId: string;
      entryType: 'routing';
      timestamp: string;
      tenantId: string;
      facilityId?: string;
      performedBy: string;
      success: boolean;
      details: {
        sourceEngine: AlertSource;
        alertsRouted: number;
        alertsFiltered: number;
      };
    }
  | {
      entryId: string;
      entryType: 'policy-decision';
      timestamp: string;
      tenantId: string;
      facilityId?: string;
      performedBy: string;
      success: boolean;
      details: {
        decision: 'authorized' | 'denied';
        reason?: string;
        queryId?: string;
        alertId?: string;
      };
    }
  | {
      entryId: string;
      entryType: 'error';
      timestamp: string;
      tenantId: string;
      facilityId?: string;
      performedBy: string;
      success: false;
      details: {
        operation: string;
        error: string;
      };
    };

// ============================================================================
// ALERT STATISTICS
// ============================================================================

/**
 * Statistics for alert center operations.
 */
export interface AlertStatistics {
  totalAlerts: number;
  totalGroups: number;
  totalQueries: number;
  alertsLast24Hours: number;
  queriesLast24Hours: number;
  alertsByCategory: Record<AlertCategory, number>;
  alertsBySeverity: Record<AlertSeverity, number>;
  alertsBySource: Record<AlertSource, number>;
  alertsByStatus: Record<string, number>;
  mostCommonCategory: AlertCategory;
  mostCommonSeverity: AlertSeverity;
  mostCommonSource: AlertSource;
}

// ============================================================================
// ALERT POLICY CONTEXT
// ============================================================================

/**
 * Policy context for authorization.
 */
export interface AlertPolicyContext {
  tenantId: string;
  facilityId?: string;
  performedBy: string;
  userRoles: string[];
  userPermissions: string[];
  federatedTenants?: string[]; // For cross-tenant visibility
}

/**
 * Policy decision result.
 */
export interface AlertPolicyDecision {
  authorized: boolean;
  reason?: string;
  deniedCategories?: AlertCategory[];
  deniedSources?: AlertSource[];
}

// ============================================================================
// ALERT POLICY STATISTICS
// ============================================================================

/**
 * Statistics for policy enforcement.
 */
export interface AlertPolicyStatistics {
  totalChecks: number;
  authorizedChecks: number;
  deniedChecks: number;
  checksLast24Hours: number;
}
