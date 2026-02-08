/**
 * Phase 44: System Governance - Central Exports
 */

// Types
export type {
  Role,
  Permission,
  PermissionScope,
  PolicyPack,
  PolicyPackRule,
  GovernanceAction,
  GovernanceSubject,
  GovernanceResource,
  GovernanceDecision,
  GovernanceLogEntry,
  GovernanceEngine as GovernanceEngineType,
  AssetType
} from './governanceTypes';

// Core Modules
export { RoleRegistry, createOperatorRole, createSupervisorRole, createFacilityAdminRole } from './roleRegistry';
export { PermissionMatrix, createPermission, mergePermissions } from './permissionMatrix';
export { PolicyPackLibrary, createPolicyPack } from './policyPackLibrary';
export { GovernanceLog, formatLogEntry, calculateTrend } from './governanceLog';
export { GovernanceEngine, createPermissionQuery, batchCanPerform, getDecisionSummary } from './governanceEngine';
