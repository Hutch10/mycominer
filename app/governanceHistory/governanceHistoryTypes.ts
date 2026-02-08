/**
 * Phase 45: Governance Change Control, Audit Trails & Policy Lineage
 * TYPE DEFINITIONS
 * 
 * Defines all types for governance change tracking, role evolution,
 * permission diffs, policy lineage, and historical queries.
 */

import {
  Role,
  Permission,
  PolicyPack,
  PermissionScope,
  GovernanceAction
} from '../governance/governanceTypes';

// ============================================================================
// GOVERNANCE CHANGE TYPES
// ============================================================================

export type GovernanceChangeType =
  | 'roleCreated'
  | 'roleUpdated'
  | 'roleDeactivated'
  | 'permissionAdded'
  | 'permissionRemoved'
  | 'scopeExpanded'
  | 'scopeRestricted'
  | 'policyPackAssigned'
  | 'policyPackRevoked'
  | 'policyPackCreated'
  | 'policyPackUpdated'
  | 'policyPackDeactivated'
  | 'governanceDecisionOverride';

export interface GovernanceChange {
  id: string;
  timestamp: string;
  changeType: GovernanceChangeType;
  entityId: string;
  entityType: 'role' | 'permission' | 'policyPack' | 'governance';
  tenantId: string;
  facilityId?: string;
  performedBy: string;
  approvedBy?: string;
  rationale: string;
  before: any;
  after: any;
  diff?: any;
  relatedChanges: string[];
  metadata?: Record<string, any>;
}

export interface ChangeDetail {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: 'added' | 'removed' | 'modified';
}

// ============================================================================
// ROLE EVOLUTION
// ============================================================================

export interface RoleEvolutionRecord {
  roleId: string;
  roleName: string;
  tenantId: string;
  facilityId?: string;
  
  // Version history
  versions: RoleVersion[];
  
  // Summary
  created: string;
  lastModified: string;
  totalChanges: number;
  currentlyActive: boolean;
}

export interface RoleVersion {
  version: number;
  timestamp: string;
  changeType: GovernanceChangeType;
  
  // Snapshot
  snapshot: Role;
  
  // Change details
  changes: ChangeDetail[];
  performedBy: string;
  approvedBy?: string;
  rationale: string;
  
  // Diff from previous version
  permissionsAdded: Permission[];
  permissionsRemoved: Permission[];
  scopeChanged: boolean;
  policyPacksChanged: boolean;
}

// ============================================================================
// PERMISSION DIFF
// ============================================================================

export interface PermissionDiff {
  id: string;
  roleId: string;
  roleName: string;
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  performedBy: string;
  approvedBy?: string;
  rationale: string;
  modifications: PermissionModification[];
  scopeChanges: ScopeChange[];
  policyPacksAdded: string[];
  policyPacksRemoved: string[];
  impactSummary: string;
  relatedDecisionIds: string[];
}

export interface PermissionModification {
  permissionId: string;
  action: GovernanceAction;
  modificationType: 'added' | 'removed' | 'modified';
  before: Permission | null;
  after: Permission | null;
  scopeImpact: string;
  rationale: string;
}

export interface ScopeChange {
  changeType: 'expanded' | 'restricted';
  oldScope: PermissionScope;
  newScope: PermissionScope;
  affectedResources: string[];
  impactAssessment: string;
}

// ============================================================================
// POLICY LINEAGE
// ============================================================================

export interface PolicyLineage {
  policyPackId: string;
  policyPackName: string;
  tenantId: string;
  facilityId?: string;
  nodes: PolicyLineageNode[];
  created: string;
  lastModified: string;
  totalChanges: number;
  currentlyActive: boolean;
}

export interface PolicyLineageNode {
  nodeId: string;
  timestamp: string;
  changeType: GovernanceChangeType;
  snapshot: PolicyPack;
  performedBy: string;
  approvedBy?: string;
  rationale: string;
  affectedRoles: Array<{ roleId: string; roleName: string }>;
  previousNodeId?: string;
  nextNodeId?: string;
}

// ============================================================================
// GOVERNANCE HISTORY QUERY
// ============================================================================

export type GovernanceHistoryQueryType =
  | 'roleEvolution'
  | 'permissionDiff'
  | 'policyLineage'
  | 'auditTrail'
  | 'changeLog';

export type QueryAction = 'query_executed' | 'export_generated' | 'change_logged' | 'lineage_traced' | 'diff_computed';

export interface GovernanceHistoryQuery {
  queryType: GovernanceHistoryQueryType;
  filters?: {
    roleId?: string;
    policyPackId?: string;
    entityId?: string;
    entityType?: 'role' | 'permission' | 'policyPack' | 'governance';
    changeType?: GovernanceChangeType;
    performedBy?: string;
    timeRange?: {
      start?: string;
      end?: string;
    };
  };
}

export interface GovernanceHistoryResult {
  queryId: string;
  timestamp: string;
  queryType: GovernanceHistoryQueryType;
  tenantId: string;
  facilityId?: string;
  results: any[];
  totalResults: number;
  executionTimeMs: number;
}

// ============================================================================
// GOVERNANCE HISTORY LOG
// ============================================================================

export interface GovernanceHistoryLogEntry {
  id: string;
  timestamp: string;
  action: QueryAction;
  details: any;
  scope: { tenantId: string; facilityId?: string };
  performedBy: string;
}

// ============================================================================
// AUDIT TRAIL
// ============================================================================

export interface AuditTrail {
  entityId: string;
  entityType: 'role' | 'permission' | 'policyPack' | 'governance';
  tenantId: string;
  facilityId?: string;
  startTime: string;
  endTime: string;
  changes: GovernanceChange[];
  totalChanges: number;
  performers: string[];
  approvers: string[];
  changeTypes: GovernanceChangeType[];
}

// ============================================================================
// GOVERNANCE SNAPSHOT
// ============================================================================

export interface GovernanceSnapshot {
  id: string;
  timestamp: string;
  tenantId: string;
  facilityId?: string;
  roles: Role[];
  policyPacks: PolicyPack[];
  totalRoles: number;
  totalPermissions: number;
  totalPolicyPacks: number;
  stateHash: string;
}
