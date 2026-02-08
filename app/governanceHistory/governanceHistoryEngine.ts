/**
 * Phase 45: Governance History - Governance History Engine
 * 
 * Orchestrates role evolution tracking, permission diffs, policy lineage
 * reconstruction, and history queries. Central coordination point for all
 * governance history operations.
 */

import { Role, Permission, PolicyPack } from '../governance/governanceTypes';
import {
  GovernanceHistoryQuery,
  GovernanceHistoryResult,
  RoleEvolutionRecord,
  PermissionDiff,
  PolicyLineage,
  GovernanceChange,
  AuditTrail
} from './governanceHistoryTypes';
import { RoleEvolutionTracker } from './roleEvolutionTracker';
import { PermissionDiffEngine } from './permissionDiffEngine';
import { PolicyLineageBuilder } from './policyLineageBuilder';
import { GovernanceHistoryLog } from './governanceHistoryLog';

// ============================================================================
// GOVERNANCE HISTORY ENGINE CLASS
// ============================================================================

export class GovernanceHistoryEngine {
  private roleTracker: RoleEvolutionTracker;
  private diffEngine: PermissionDiffEngine;
  private lineageBuilder: PolicyLineageBuilder;
  private historyLog: GovernanceHistoryLog;
  private tenantId: string;
  private facilityId?: string;

  constructor(tenantId: string, facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
    this.roleTracker = new RoleEvolutionTracker(tenantId, facilityId);
    this.diffEngine = new PermissionDiffEngine(tenantId, facilityId);
    this.lineageBuilder = new PolicyLineageBuilder(tenantId, facilityId);
    this.historyLog = new GovernanceHistoryLog(tenantId, facilityId);
  }

  // ============================================================================
  // ROLE OPERATIONS
  // ============================================================================

  /**
   * Track role creation
   */
  trackRoleCreation(
    role: Role,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): void {
    this.roleTracker.recordRoleCreation(role, performedBy, rationale, approvedBy);
    
    this.historyLog.logChange(
      'roleCreated',
      role.id,
      'role',
      performedBy,
      rationale,
      null,
      role,
      undefined,
      approvedBy
    );
  }

  /**
   * Track role update
   */
  trackRoleUpdate(
    roleId: string,
    oldRole: Role,
    newRole: Role,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): PermissionDiff {
    this.roleTracker.recordRoleUpdate(roleId, newRole, performedBy, rationale, approvedBy);
    
    const diff = this.diffEngine.computePermissionDiff(
      roleId,
      newRole.name,
      oldRole,
      newRole,
      performedBy,
      rationale
    );

    this.historyLog.logChange(
      'roleUpdated',
      roleId,
      'role',
      performedBy,
      rationale,
      oldRole,
      newRole,
      diff,
      approvedBy
    );

    return diff;
  }

  /**
   * Track role deactivation
   */
  trackRoleDeactivation(
    roleId: string,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): void {
    this.roleTracker.recordRoleDeactivation(roleId, performedBy, rationale, approvedBy);
    
    this.historyLog.logChange(
      'roleDeactivated',
      roleId,
      'role',
      performedBy,
      rationale,
      { active: true },
      { active: false },
      undefined,
      approvedBy
    );
  }

  // ============================================================================
  // PERMISSION OPERATIONS
  // ============================================================================

  /**
   * Track permission addition
   */
  trackPermissionAddition(
    roleId: string,
    roleName: string,
    permission: Permission,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): PermissionDiff {
    this.roleTracker.recordPermissionAddition(roleId, permission, performedBy, rationale, approvedBy);
    
    const diff = this.diffEngine.computePermissionAdditionDiff(
      roleId,
      roleName,
      permission,
      performedBy,
      rationale
    );

    this.historyLog.logChange(
      'permissionAdded',
      roleId,
      'permission',
      performedBy,
      rationale,
      null,
      permission,
      diff,
      approvedBy
    );

    return diff;
  }

  /**
   * Track permission removal
   */
  trackPermissionRemoval(
    roleId: string,
    roleName: string,
    permission: Permission,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): PermissionDiff {
    this.roleTracker.recordPermissionRemoval(roleId, permission.id, performedBy, rationale, approvedBy);
    
    const diff = this.diffEngine.computePermissionRemovalDiff(
      roleId,
      roleName,
      permission,
      performedBy,
      rationale
    );

    this.historyLog.logChange(
      'permissionRemoved',
      roleId,
      'permission',
      performedBy,
      rationale,
      permission,
      null,
      diff,
      approvedBy
    );

    return diff;
  }

  // ============================================================================
  // POLICY PACK OPERATIONS
  // ============================================================================

  /**
   * Track policy pack creation
   */
  trackPolicyPackCreation(
    policyPack: PolicyPack,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): void {
    this.lineageBuilder.recordPolicyPackCreation(policyPack, performedBy, rationale, approvedBy);
    
    this.historyLog.logChange(
      'policyPackCreated',
      policyPack.id,
      'policyPack',
      performedBy,
      rationale,
      null,
      policyPack,
      undefined,
      approvedBy
    );
  }

  /**
   * Track policy pack assignment
   */
  trackPolicyPackAssignment(
    policyPackId: string,
    policyPackName: string,
    roleId: string,
    roleName: string,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): void {
    this.lineageBuilder.recordPolicyPackAssignment(
      policyPackId,
      policyPackName,
      roleId,
      roleName,
      performedBy,
      rationale,
      approvedBy
    );

    this.historyLog.logChange(
      'policyPackAssigned',
      policyPackId,
      'policyPack',
      performedBy,
      rationale,
      null,
      { policyPackId, roleId },
      undefined,
      approvedBy
    );
  }

  /**
   * Track policy pack revocation
   */
  trackPolicyPackRevocation(
    policyPackId: string,
    policyPackName: string,
    roleId: string,
    roleName: string,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): void {
    this.lineageBuilder.recordPolicyPackRevocation(
      policyPackId,
      policyPackName,
      roleId,
      roleName,
      performedBy,
      rationale,
      approvedBy
    );

    this.historyLog.logChange(
      'policyPackRevoked',
      policyPackId,
      'policyPack',
      performedBy,
      rationale,
      { policyPackId, roleId },
      null,
      undefined,
      approvedBy
    );
  }

  // ============================================================================
  // QUERY OPERATIONS
  // ============================================================================

  /**
   * Execute history query
   */
  executeQuery(query: GovernanceHistoryQuery, performedBy: string): GovernanceHistoryResult {
    const startTime = Date.now();

    // Log the query
    this.historyLog.logEntry(
      'query_executed',
      { query },
      { tenantId: this.tenantId, facilityId: this.facilityId },
      performedBy
    );

    // Execute based on query type
    let result: GovernanceHistoryResult;

    switch (query.queryType) {
      case 'roleEvolution':
        result = this.queryRoleEvolution(query);
        break;
      case 'permissionDiff':
        result = this.queryPermissionDiff(query);
        break;
      case 'policyLineage':
        result = this.queryPolicyLineage(query);
        break;
      case 'auditTrail':
        result = this.queryAuditTrail(query);
        break;
      case 'changeLog':
        result = this.queryChangeLog(query);
        break;
      default:
        throw new Error(`Unknown query type: ${query.queryType}`);
    }

    result.executionTimeMs = Date.now() - startTime;

    return result;
  }

  /**
   * Get role evolution
   */
  getRoleEvolution(roleId: string): RoleEvolutionRecord | undefined {
    return this.roleTracker.getRoleEvolution(roleId);
  }

  /**
   * Get policy lineage
   */
  getPolicyLineage(policyPackId: string): PolicyLineage | undefined {
    return this.lineageBuilder.getPolicyLineage(policyPackId);
  }

  /**
   * Get all changes
   */
  getAllChanges(): GovernanceChange[] {
    return this.historyLog.getAllChanges();
  }

  /**
   * Generate audit trail
   */
  generateAuditTrail(
    entityId: string,
    entityType: 'role' | 'permission' | 'policyPack' | 'governance',
    startTime?: Date,
    endTime?: Date
  ): AuditTrail {
    return this.historyLog.generateAuditTrail(entityId, entityType, startTime, endTime);
  }

  /**
   * Export history
   */
  exportHistory(filters?: any): string {
    return this.historyLog.exportChanges(filters);
  }

  // ============================================================================
  // PRIVATE QUERY HANDLERS
  // ============================================================================

  private queryRoleEvolution(query: GovernanceHistoryQuery): GovernanceHistoryResult {
    const { roleId, timeRange } = query.filters || {};
    
    if (!roleId) {
      return {
        queryId: `query-${Date.now()}`,
        timestamp: new Date().toISOString(),
        queryType: 'roleEvolution',
        tenantId: this.tenantId,
        facilityId: this.facilityId,
        results: this.roleTracker.getAllEvolutions(),
        totalResults: this.roleTracker.getAllEvolutions().length,
        executionTimeMs: 0
      };
    }

    const evolution = this.roleTracker.getRoleEvolution(roleId);
    
    return {
      queryId: `query-${Date.now()}`,
      timestamp: new Date().toISOString(),
      queryType: 'roleEvolution',
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      results: evolution ? [evolution] : [],
      totalResults: evolution ? 1 : 0,
      executionTimeMs: 0
    };
  }

  private queryPermissionDiff(query: GovernanceHistoryQuery): GovernanceHistoryResult {
    const { roleId, timeRange } = query.filters || {};
    
    const changes = roleId 
      ? this.historyLog.getChangesByEntity(roleId, 'permission')
      : this.historyLog.getAllChanges().filter(c => c.entityType === 'permission');

    const diffs = changes.map(c => c.diff).filter(Boolean);

    return {
      queryId: `query-${Date.now()}`,
      timestamp: new Date().toISOString(),
      queryType: 'permissionDiff',
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      results: diffs,
      totalResults: diffs.length,
      executionTimeMs: 0
    };
  }

  private queryPolicyLineage(query: GovernanceHistoryQuery): GovernanceHistoryResult {
    const { policyPackId } = query.filters || {};
    
    if (!policyPackId) {
      return {
        queryId: `query-${Date.now()}`,
        timestamp: new Date().toISOString(),
        queryType: 'policyLineage',
        tenantId: this.tenantId,
        facilityId: this.facilityId,
        results: this.lineageBuilder.getAllLineages(),
        totalResults: this.lineageBuilder.getAllLineages().length,
        executionTimeMs: 0
      };
    }

    const lineage = this.lineageBuilder.getPolicyLineage(policyPackId);
    
    return {
      queryId: `query-${Date.now()}`,
      timestamp: new Date().toISOString(),
      queryType: 'policyLineage',
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      results: lineage ? [lineage] : [],
      totalResults: lineage ? 1 : 0,
      executionTimeMs: 0
    };
  }

  private queryAuditTrail(query: GovernanceHistoryQuery): GovernanceHistoryResult {
    const { entityId, entityType, timeRange } = query.filters || {};
    
    if (!entityId || !entityType) {
      throw new Error('Audit trail queries require entityId and entityType');
    }

    const startTime = timeRange?.start ? new Date(timeRange.start) : undefined;
    const endTime = timeRange?.end ? new Date(timeRange.end) : undefined;

    const trail = this.historyLog.generateAuditTrail(
      entityId,
      entityType as 'role' | 'permission' | 'policyPack' | 'governance',
      startTime,
      endTime
    );

    return {
      queryId: `query-${Date.now()}`,
      timestamp: new Date().toISOString(),
      queryType: 'auditTrail',
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      results: [trail],
      totalResults: 1,
      executionTimeMs: 0
    };
  }

  private queryChangeLog(query: GovernanceHistoryQuery): GovernanceHistoryResult {
    const { changeType, entityType, timeRange, performedBy } = query.filters || {};
    
    let changes = this.historyLog.getAllChanges();

    if (changeType) {
      changes = changes.filter(c => c.changeType === changeType);
    }

    if (entityType) {
      changes = changes.filter(c => c.entityType === entityType);
    }

    if (performedBy) {
      changes = changes.filter(c => c.performedBy === performedBy);
    }

    if (timeRange) {
      const startTime = timeRange.start ? new Date(timeRange.start) : new Date(0);
      const endTime = timeRange.end ? new Date(timeRange.end) : new Date();
      changes = this.historyLog.getChangesInRange(startTime, endTime);
    }

    return {
      queryId: `query-${Date.now()}`,
      timestamp: new Date().toISOString(),
      queryType: 'changeLog',
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      results: changes,
      totalResults: changes.length,
      executionTimeMs: 0
    };
  }
}

// ============================================================================
// ENGINE UTILITIES
// ============================================================================

/**
 * Create engine instance
 */
export function createGovernanceHistoryEngine(
  tenantId: string,
  facilityId?: string
): GovernanceHistoryEngine {
  return new GovernanceHistoryEngine(tenantId, facilityId);
}

/**
 * Format query result
 */
export function formatQueryResult(result: GovernanceHistoryResult): string {
  let output = `Query Result (${result.queryType})\n`;
  output += `Query ID: ${result.queryId}\n`;
  output += `Timestamp: ${result.timestamp}\n`;
  output += `Execution Time: ${result.executionTimeMs}ms\n`;
  output += `Total Results: ${result.totalResults}\n\n`;

  if (result.totalResults > 0) {
    output += `Results:\n`;
    for (const item of result.results.slice(0, 10)) {
      output += `  - ${JSON.stringify(item, null, 2)}\n`;
    }

    if (result.totalResults > 10) {
      output += `  ... and ${result.totalResults - 10} more results\n`;
    }
  }

  return output;
}
