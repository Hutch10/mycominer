/**
 * Phase 44: System Governance, Roles & Permissions v2
 * TYPE DEFINITIONS
 * 
 * Defines all types for roles, permissions, policy packs, governance decisions,
 * and audit logging. All operations are explicit, auditable, and tenant-scoped.
 */

// ============================================================================
// CORE GOVERNANCE TYPES
// ============================================================================

export type PermissionScope =
  | 'tenant'
  | 'facility'
  | 'room'
  | 'engine'
  | 'asset-type'
  | 'global';

export type GovernanceEngine =
  | 'search'
  | 'knowledge-graph'
  | 'narrative'
  | 'timeline'
  | 'analytics'
  | 'training'
  | 'insights'
  | 'marketplace'
  | 'health'
  | 'compliance'
  | 'sandbox'
  | 'forecast'
  | 'workflow'
  | 'sop'
  | 'resource';

export type AssetType =
  | 'sop'
  | 'workflow'
  | 'resource'
  | 'facility'
  | 'sandbox-scenario'
  | 'training-module'
  | 'pattern-pack'
  | 'knowledge-pack'
  | 'marketplace-asset'
  | 'compliance-record'
  | 'incident'
  | 'deviation'
  | 'capa';

export type GovernanceAction =
  // Workflow permissions
  | 'workflow:execute-task'
  | 'workflow:view-status'
  | 'workflow:approve-step'
  // Compliance permissions
  | 'compliance:view-records'
  | 'compliance:modify-capa'
  | 'compliance:run-audit'
  // SOP permissions
  | 'sop:view-all'
  | 'sop:modify-version'
  | 'sop:approve-changes'
  // Timeline permissions
  | 'timeline:create-incident'
  | 'timeline:view-events'
  | 'timeline:modify-events'
  // Tenant permissions
  | 'tenant:manage-users'
  | 'tenant:manage-roles'
  | 'tenant:manage-facilities'
  | 'tenant:view-billing'
  // Analytics permissions
  | 'analytics:create-custom'
  | 'analytics:run-queries'
  | 'analytics:export-data'
  | 'analytics:view-dashboards'
  // Training permissions
  | 'training:create-modules'
  | 'training:assign-users'
  | 'training:issue-certificates'
  | 'training:view-progress'
  // Marketplace permissions
  | 'marketplace:publish-sop'
  | 'marketplace:publish-template'
  | 'marketplace:publish-analytics'
  | 'marketplace:manage-listings'
  // API permissions
  | 'api:read-data'
  | 'api:write-data'
  | 'api:export-reports'
  // Governance permissions
  | 'governance:manage-policy-packs';

// ============================================================================
// GOVERNANCE SUBJECT
// ============================================================================

export type GovernanceSubjectType = 'user' | 'service' | 'integration' | 'system';

export interface GovernanceSubject {
  id: string;
  tenantId: string;
  facilityId?: string;
  
  // Assigned roles
  roleIds: string[];
  
  // Direct permissions (bypasses roles, use sparingly)
  directPermissions?: Permission[];
}

// ============================================================================
// GOVERNANCE RESOURCE
// ============================================================================

export interface GovernanceResource {
  name: string;
  
  // Classification
  engine?: GovernanceEngine;
  assetType?: AssetType;
  
  // Scope
  tenantId: string;
  facilityId?: string;
  roomId?: string;
}

// ============================================================================
// ROLE
// ============================================================================

export interface Role {
  id: string;
  name: string;
  description: string;
  
  // Scope
  tenantId?: string;
  facilityId?: string;
  scope: PermissionScope;
  
  // Permissions
  permissions: Permission[];
  
  // Policy packs
  policyPackIds?: string[];
  
  // Metadata
  active: boolean;
}

// ============================================================================
// PERMISSION
// ============================================================================

export interface Permission {
  id: string;
  action: GovernanceAction;
  
  // Scope constraints
  scope: PermissionScope;
  tenantId?: string;
  facilityId?: string;
  roomId?: string;
  
  // Resource constraints
  engines?: GovernanceEngine[];
  assetTypes?: AssetType[];
  
  // Conditions
  conditions?: PermissionCondition[];
  
  // Metadata
  description: string;
  rationale?: string;
}

export interface PermissionCondition {
  type: 'time-window' | 'approval-required' | 'training-required' | 'compliance-status';
  params: Record<string, unknown>;
}

// ============================================================================
// POLICY PACK
// ============================================================================

export interface PolicyPackRule {
  id: string;
  action: GovernanceAction;
  requiredRoleIds: string[];
  requiredConditions?: PermissionCondition[];
  description: string;
}

export interface PolicyPack {
  id: string;
  name: string;
  description: string;
  
  // Scope
  scope: PermissionScope;
  
  // Rules
  rules: PolicyPackRule[];
  
  // Metadata
  active: boolean;
  metadata?: {
    version?: string;
    industryStandard?: string;
    createdAt?: string;
    [key: string]: unknown;
  };
}

// ============================================================================
// GOVERNANCE DECISION
// ============================================================================

export type GovernanceDecisionType = 'allow' | 'deny';

export interface GovernanceDecision {
  id: string;
  timestamp: string;
  
  // Request context
  subjectId: string;
  action: GovernanceAction;
  resourceName: string;
  
  // Decision
  allowed: boolean;
  
  // Explanation
  rationale: string;
  matchedRoles: string[];
  
  // References
  references: string[];
  
  // Performance
  evaluationTimeMs?: number;
}

export interface GovernanceReference {
  type: 'role' | 'permission' | 'policy-pack' | 'subject' | 'resource';
  id: string;
  name: string;
}

// ============================================================================
// GOVERNANCE LOG
// ============================================================================

export interface GovernanceLogEntry {
  id: string;
  timestamp: string;
  
  // Subject
  subjectId: string;
  
  // Action/Resource
  action?: GovernanceAction;
  resourceName?: string;
  
  // Decision
  allowed?: boolean;
  
  // Details
  rationale?: string;
  matchedRoles?: string[];
  references?: string[];
}

// ============================================================================
// GOVERNANCE QUERY
// ============================================================================

export interface GovernanceQuery {
  id: string;
  timestamp: string;
  
  // What to check
  subjectId: string;
  action: GovernanceAction;
  resourceId?: string;
  
  // Context
  tenantId: string;
  facilityId?: string;
  roomId?: string;
  
  // Options
  includeExplanation?: boolean;
  includeSuggestions?: boolean;
}

// ============================================================================
// GOVERNANCE AUDIT
// ============================================================================

export interface GovernanceAudit {
  id: string;
  timestamp: string;
  auditType: 'role-audit' | 'permission-audit' | 'subject-audit' | 'full-audit';
  
  tenantId: string;
  facilityId?: string;
  
  // Findings
  findings: GovernanceAuditFinding[];
  
  // Summary
  summary: {
    totalSubjects: number;
    totalRoles: number;
    totalPermissions: number;
    totalPolicyPacks: number;
    issues: number;
  };
}

export interface GovernanceAuditFinding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'orphaned-permission' | 'inactive-role' | 'unused-policy-pack' | 'excessive-permissions' | 'missing-permissions';
  description: string;
  affectedItems: string[];
  recommendation: string;
}

// ============================================================================
// ROLE TEMPLATES
// ============================================================================

export type RoleTemplate =
  | 'operator'
  | 'supervisor'
  | 'facility-admin'
  | 'tenant-admin'
  | 'compliance-officer'
  | 'read-only-auditor'
  | 'integration-service'
  | 'training-coordinator'
  | 'marketplace-publisher'
  | 'analytics-specialist';

// ============================================================================
// GOVERNANCE ENGINE CONFIG
// ============================================================================

export interface GovernanceEngineConfig {
  tenantId: string;
  facilityId?: string;
  
  // Behavior
  strictMode: boolean; // Deny by default if no explicit allow
  logAllChecks: boolean; // Log every permission check
  requireExplicitDeny: boolean; // Require explicit deny rules
  
  // Performance
  cacheDecisions: boolean;
  cacheTTL: number; // seconds
  
  // Integration
  integrateWithCompliance: boolean;
  integrateWithHealth: boolean;
  
  // Audit
  retentionDays: number;
}

// ============================================================================
// GOVERNANCE STATISTICS
// ============================================================================

export interface GovernanceStatistics {
  timestamp: string;
  tenantId: string;
  
  // Subjects
  totalSubjects: number;
  activeSubjects: number;
  subjectsByType: Record<GovernanceSubjectType, number>;
  
  // Roles
  totalRoles: number;
  activeRoles: number;
  builtInRoles: number;
  customRoles: number;
  
  // Permissions
  totalPermissions: number;
  permissionsByAction: Record<GovernanceAction, number>;
  permissionsByScope: Record<PermissionScope, number>;
  
  // Policy Packs
  totalPolicyPacks: number;
  activePolicyPacks: number;
  
  // Decisions
  totalDecisions24h: number;
  allowDecisions24h: number;
  denyDecisions24h: number;
  
  // Health
  healthScore: number; // 0-100
  issues: number;
}

// ============================================================================
// EXPORTS
// ============================================================================

export interface GovernanceDashboardState {
  tenantId: string;
  facilityId?: string;
  
  // Current stats
  statistics: GovernanceStatistics;
  
  // Recent decisions
  recentDecisions: GovernanceDecision[];
  
  // Active roles
  activeRoles: Role[];
  
  // Active policy packs
  activePolicyPacks: PolicyPack[];
}
