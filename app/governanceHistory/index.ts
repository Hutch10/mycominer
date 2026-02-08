/**
 * Phase 45: Governance History - Main Exports
 * 
 * Central export point for all governance history components, types, and utilities.
 */

// Core Engine
export { GovernanceHistoryEngine, createGovernanceHistoryEngine, formatQueryResult } from './governanceHistoryEngine';

// Trackers & Builders
export { RoleEvolutionTracker, getRoleChangeSummary, hasRoleChangedSince, getMostRecentChange } from './roleEvolutionTracker';
export { PermissionDiffEngine, formatPermissionDiff, getHighImpactModifications, diffRequiresApproval } from './permissionDiffEngine';
export { PolicyLineageBuilder, getLineageSummary, findDivergencePoint, hasPolicyPackChangedSince, getMostRecentNode } from './policyLineageBuilder';

// Logging
export { GovernanceHistoryLog, formatAuditTrail, getChangeSummary, isCriticalChange } from './governanceHistoryLog';

// Types
export type {
  GovernanceChange,
  GovernanceChangeType,
  ChangeDetail,
  RoleEvolutionRecord,
  RoleVersion,
  PermissionDiff,
  PermissionModification,
  ScopeChange,
  PolicyLineage,
  PolicyLineageNode,
  GovernanceHistoryQuery,
  GovernanceHistoryResult,
  GovernanceHistoryLogEntry,
  AuditTrail,
  GovernanceSnapshot
} from './governanceHistoryTypes';
