/**
 * ACTION CENTER TYPES
 * Phase 53: Operator Action Center
 * 
 * Deterministic, read-only operator tasking system that converts alerts,
 * audit findings, integrity drift, and cross-engine issues into structured
 * remediation tasks.
 * 
 * NO GENERATIVE AI. NO INVENTED TASKS. NO PREDICTIONS.
 * All tasks originate from real alerts, findings, or drift events.
 */

// ============================================================================
// TASK CATEGORIES
// ============================================================================

/**
 * Task categories derived from engine outputs
 */
export type ActionCategory =
  | 'alert-remediation'          // From Alert Center (Phase 52)
  | 'audit-remediation'          // From Auditor (Phase 50)
  | 'integrity-drift-remediation' // From Integrity Monitor (Phase 51)
  | 'governance-lineage-issue'   // From Governance (Phases 44-45)
  | 'documentation-completeness' // From Documentation Engine (Phase 47)
  | 'fabric-link-breakage'       // From Fabric (Phase 46)
  | 'compliance-pack-issue'      // From Compliance Engine (Phase 32)
  | 'simulation-mismatch';       // From Simulation Mode (Phase 49)

/**
 * Task severity levels
 */
export type ActionSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Task status lifecycle
 */
export type ActionStatus = 'new' | 'acknowledged' | 'assigned' | 'in-progress' | 'resolved' | 'dismissed';

/**
 * Task sources (originating engines)
 */
export type ActionSource =
  | 'alert-center'           // Phase 52
  | 'auditor'                // Phase 50
  | 'integrity-monitor'      // Phase 51
  | 'governance-system'      // Phase 44
  | 'governance-lineage'     // Phase 45
  | 'documentation-bundler'  // Phase 47
  | 'knowledge-fabric'       // Phase 46
  | 'compliance-engine'      // Phase 32
  | 'simulation-engine';     // Phase 49

// ============================================================================
// TASK SCOPE
// ============================================================================

/**
 * Tenant/facility/room scope for task isolation
 */
export interface ActionScope {
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  includeArchived?: boolean;
}

// ============================================================================
// TASK REFERENCES
// ============================================================================

/**
 * Reference to source alert, finding, or drift event
 */
export interface ActionReference {
  referenceId: string;
  referenceType: 'alert' | 'finding' | 'drift' | 'decision' | 'link' | 'bundle' | 'scenario' | 'pattern';
  entityId?: string;
  entityType?: string;
  title: string;
  sourceEngine: ActionSource;
  url?: string;
}

/**
 * Entity affected by the task
 */
export interface AffectedEntity {
  entityId: string;
  entityType: string;
  title: string;
  status?: string;
}

// ============================================================================
// REMEDIATION METADATA
// ============================================================================

/**
 * Non-generative remediation suggestions based on engine rules
 */
export interface RemediationMetadata {
  suggestedAction: string;       // Deterministic action description
  estimatedEffort: 'low' | 'medium' | 'high';
  requiredPermissions: string[]; // Permissions needed to execute
  relatedDocumentation?: string; // Link to relevant docs
  relatedSOP?: string;           // Link to relevant SOP
  prerequisiteTasks?: string[];  // IDs of tasks that must complete first
}

// ============================================================================
// ACTION TASK
// ============================================================================

/**
 * Core task object
 */
export interface ActionTask {
  taskId: string;
  category: ActionCategory;
  severity: ActionSeverity;
  source: ActionSource;
  title: string;
  description: string;
  scope: ActionScope;
  
  // Entities and references
  affectedEntities: AffectedEntity[];
  relatedReferences: ActionReference[];
  
  // Remediation
  remediation?: RemediationMetadata;
  
  // Lifecycle
  status: ActionStatus;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  assignedTo?: string;
  assignedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  dismissedAt?: string;
  dismissedBy?: string;
  dismissalReason?: string;
  
  // Metadata
  metadata: {
    sourceAlertId?: string;
    sourceFindingId?: string;
    sourceDriftId?: string;
    tags?: string[];
    priority?: number;
    [key: string]: unknown;
  };
}

// ============================================================================
// TASK GROUPING
// ============================================================================

/**
 * Group type for task aggregation
 */
export type ActionGroupType = 'category' | 'severity' | 'entity' | 'source' | 'status';

/**
 * Grouped tasks with summary
 */
export interface ActionGroup {
  groupId: string;
  groupType: ActionGroupType;
  groupKey: string;
  tasks: ActionTask[];
  summary: {
    totalTasks: number;
    newTasks: number;
    acknowledgedTasks: number;
    assignedTasks: number;
    inProgressTasks: number;
    resolvedTasks: number;
    dismissedTasks: number;
    bySeverity: Record<ActionSeverity, number>;
    byCategory: Record<string, number>;
  };
  references: ActionReference[];
  metadata: {
    createdAt: string;
    [key: string]: unknown;
  };
}

// ============================================================================
// TASK QUERIES
// ============================================================================

/**
 * Query options for task retrieval
 */
export interface ActionQueryOptions {
  includeDismissed?: boolean;
  includeResolved?: boolean;
  maxTasks?: number;
  sortBy?: 'severity' | 'createdAt' | 'category' | 'status';
  sortOrder?: 'asc' | 'desc';
  groupBy?: ActionGroupType;
}

/**
 * Task query object
 */
export interface ActionQuery {
  queryId: string;
  description: string;
  scope: ActionScope;
  
  // Filters
  categories?: ActionCategory[];
  severities?: ActionSeverity[];
  sources?: ActionSource[];
  statuses?: ActionStatus[];
  entityId?: string;
  entityType?: string;
  assignedTo?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  
  // Options
  options?: ActionQueryOptions;
  
  // Audit
  triggeredBy: string;
  triggeredAt: string;
}

/**
 * Task query result
 */
export interface ActionResult {
  resultId: string;
  query: ActionQuery;
  tasks: ActionTask[];
  groups?: ActionGroup[];
  totalTasks: number;
  newTasks: number;
  summary: {
    byCategory: Record<string, number>;
    bySeverity: Record<ActionSeverity, number>;
    bySource: Record<string, number>;
    byStatus: Record<ActionStatus, number>;
    affectedEntities: { entityId: string; entityType: string; title: string; taskCount: number }[];
  };
  metadata: {
    executedAt: string;
    [key: string]: unknown;
  };
  success: boolean;
  error?: string;
}

// ============================================================================
// ACTION LOG
// ============================================================================

/**
 * Log entry types
 */
export type ActionLogEntryType = 
  | 'task'
  | 'query'
  | 'group'
  | 'routing'
  | 'policy-decision'
  | 'lifecycle-change'
  | 'error';

/**
 * Base log entry
 */
export interface ActionLogEntryBase {
  entryId: string;
  entryType: ActionLogEntryType;
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  performedBy: string;
  success: boolean;
  error?: string;
}

/**
 * Task log entry
 */
export interface TaskLogEntry extends ActionLogEntryBase {
  entryType: 'task';
  task: ActionTask;
}

/**
 * Query log entry
 */
export interface QueryLogEntry extends ActionLogEntryBase {
  entryType: 'query';
  query: ActionQuery;
  resultCount: number;
}

/**
 * Group log entry
 */
export interface GroupLogEntry extends ActionLogEntryBase {
  entryType: 'group';
  group: ActionGroup;
}

/**
 * Routing log entry
 */
export interface RoutingLogEntry extends ActionLogEntryBase {
  entryType: 'routing';
  sourceEngine: ActionSource;
  tasksRouted: number;
  tasksFiltered: number;
}

/**
 * Policy decision log entry
 */
export interface PolicyDecisionLogEntry extends ActionLogEntryBase {
  entryType: 'policy-decision';
  decision: ActionPolicyDecision;
}

/**
 * Lifecycle change log entry
 */
export interface LifecycleChangeLogEntry extends ActionLogEntryBase {
  entryType: 'lifecycle-change';
  taskId: string;
  oldStatus: ActionStatus;
  newStatus: ActionStatus;
  reason?: string;
}

/**
 * Error log entry
 */
export interface ErrorLogEntry extends ActionLogEntryBase {
  entryType: 'error';
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
}

/**
 * Union of all log entry types
 */
export type ActionLogEntry =
  | TaskLogEntry
  | QueryLogEntry
  | GroupLogEntry
  | RoutingLogEntry
  | PolicyDecisionLogEntry
  | LifecycleChangeLogEntry
  | ErrorLogEntry;

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Action center statistics
 */
export interface ActionStatistics {
  totalTasks: number;
  newTasks: number;
  acknowledgedTasks: number;
  assignedTasks: number;
  inProgressTasks: number;
  resolvedTasks: number;
  dismissedTasks: number;
  
  byCategory: Record<string, number>;
  bySeverity: Record<ActionSeverity, number>;
  bySource: Record<string, number>;
  byStatus: Record<ActionStatus, number>;
  
  trends: {
    tasksCreatedToday: number;
    tasksResolvedToday: number;
    tasksCreatedThisWeek: number;
    tasksResolvedThisWeek: number;
    averageResolutionTimeHours: number;
  };
  
  mostCommonCategory: string;
  mostCommonSeverity: ActionSeverity;
  mostCommonSource: string;
}

// ============================================================================
// POLICY ENFORCEMENT
// ============================================================================

/**
 * Policy context for authorization
 */
export interface ActionPolicyContext {
  tenantId: string;
  facilityId?: string;
  performedBy: string;
  userRoles: string[];
  userPermissions: string[];
  federationEnabled?: boolean;
}

/**
 * Policy decision result
 */
export interface ActionPolicyDecision {
  authorized: boolean;
  reason?: string;
  deniedCategories?: ActionCategory[];
  deniedSources?: ActionSource[];
  restrictedOperations?: string[];
}

// ============================================================================
// ENGINE INPUTS
// ============================================================================

/**
 * Alert input from Alert Center (Phase 52)
 */
export interface AlertInput {
  alertId: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  scope: ActionScope;
  affectedEntities: AffectedEntity[];
  relatedReferences: ActionReference[];
  detectedAt: string;
  status: string;
  metadata: Record<string, unknown>;
}

/**
 * Audit finding input from Auditor (Phase 50)
 */
export interface AuditFindingInput {
  findingId: string;
  severity: string;
  title: string;
  description: string;
  scope: ActionScope;
  affectedEntities: AffectedEntity[];
  relatedReferences: ActionReference[];
  auditedAt: string;
  status: string;
  auditId: string;
}

/**
 * Integrity drift input from Integrity Monitor (Phase 51)
 */
export interface IntegrityDriftInput {
  alertId: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  scope: ActionScope;
  affectedEntities: AffectedEntity[];
  relatedReferences: ActionReference[];
  evidence: { field: string; baselineValue?: unknown; currentValue?: unknown; drift?: unknown }[];
  detectedAt: string;
  status: string;
  rule: { ruleId: string };
}

/**
 * Governance issue input (Phases 44-45)
 */
export interface GovernanceIssueInput {
  issueId: string;
  issueType: 'drift' | 'lineage-break';
  severity: string;
  title: string;
  description: string;
  scope: ActionScope;
  affectedEntities: AffectedEntity[];
  relatedReferences: ActionReference[];
  detectedAt: string;
  status: string;
}

/**
 * Documentation issue input (Phase 47)
 */
export interface DocumentationIssueInput {
  issueId: string;
  issueType: 'completeness' | 'drift';
  severity: string;
  title: string;
  description: string;
  scope: ActionScope;
  affectedEntities: AffectedEntity[];
  relatedReferences: ActionReference[];
  detectedAt: string;
  status: string;
}

/**
 * Fabric link issue input (Phase 46)
 */
export interface FabricLinkIssueInput {
  linkId: string;
  issueType: 'breakage' | 'unresolved';
  severity: string;
  title: string;
  description: string;
  scope: ActionScope;
  affectedEntities: AffectedEntity[];
  relatedReferences: ActionReference[];
  detectedAt: string;
  status: string;
}

/**
 * Compliance issue input (Phase 32)
 */
export interface ComplianceIssueInput {
  packId: string;
  issueType: 'configuration' | 'control-missing';
  severity: string;
  title: string;
  description: string;
  scope: ActionScope;
  affectedEntities: AffectedEntity[];
  relatedReferences: ActionReference[];
  timestamp: string;
  status: string;
}

/**
 * Simulation mismatch input (Phase 49)
 */
export interface SimulationMismatchInput {
  scenarioId: string;
  mismatchType: 'forecast-drift' | 'parameter-drift';
  severity: string;
  title: string;
  description: string;
  scope: ActionScope;
  affectedEntities: AffectedEntity[];
  relatedReferences: ActionReference[];
  detectedAt: string;
  status: string;
}

/**
 * All engine inputs combined
 */
export interface EngineInputs {
  alerts?: AlertInput[];
  auditFindings?: AuditFindingInput[];
  integrityDrift?: IntegrityDriftInput[];
  governanceIssues?: GovernanceIssueInput[];
  documentationIssues?: DocumentationIssueInput[];
  fabricLinkIssues?: FabricLinkIssueInput[];
  complianceIssues?: ComplianceIssueInput[];
  simulationMismatches?: SimulationMismatchInput[];
}
