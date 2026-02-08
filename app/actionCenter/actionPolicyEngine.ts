/**
 * ACTION POLICY ENGINE
 * Phase 53: Operator Action Center
 * 
 * Enforces tenant isolation, federation rules, and engine-level permissions.
 * Validates task and reference visibility based on user context.
 * Logs all policy decisions for audit trail.
 */

import {
  ActionTask,
  ActionQuery,
  ActionPolicyContext,
  ActionPolicyDecision,
  ActionCategory,
  ActionSource,
  PolicyDecisionLogEntry,
} from './actionTypes';

// ============================================================================
// ACTION POLICY ENGINE
// ============================================================================

export class ActionPolicyEngine {
  private policyLog: PolicyDecisionLogEntry[] = [];

  // ==========================================================================
  // QUERY AUTHORIZATION
  // ==========================================================================

  /**
   * Authorize task query
   */
  authorizeQuery(
    query: ActionQuery,
    context: ActionPolicyContext
  ): ActionPolicyDecision {
    // 1. Validate tenant isolation
    if (!this.validateTenantIsolation(query, context)) {
      return this.logAndReturnDecision(
        context,
        false,
        'Query tenant does not match user tenant'
      );
    }

    // 2. Validate federation rules
    if (query.scope.tenantId !== context.tenantId) {
      if (!this.validateFederationRules(context)) {
        return this.logAndReturnDecision(
          context,
          false,
          'Federation not enabled for this user'
        );
      }
    }

    // 3. Validate query permission
    if (!this.validateQueryPermission(context)) {
      return this.logAndReturnDecision(
        context,
        false,
        'Missing action.query permission'
      );
    }

    // 4. Validate category permissions
    const deniedCategories = this.validateCategoryPermissions(query, context);

    // 5. Validate source permissions
    const deniedSources = this.validateSourcePermissions(query, context);

    // Partial authorization if some categories/sources denied
    if (deniedCategories.length > 0 || deniedSources.length > 0) {
      return this.logAndReturnDecision(
        context,
        true,
        'Partial authorization',
        deniedCategories,
        deniedSources
      );
    }

    // Full authorization
    return this.logAndReturnDecision(context, true);
  }

  // ==========================================================================
  // TASK AUTHORIZATION
  // ==========================================================================

  /**
   * Authorize individual task visibility
   */
  authorizeTask(
    task: ActionTask,
    context: ActionPolicyContext
  ): ActionPolicyDecision {
    // 1. Validate tenant isolation
    if (task.scope.tenantId !== context.tenantId) {
      if (!context.federationEnabled) {
        return { authorized: false, reason: 'Task from different tenant (federation disabled)' };
      }
    }

    // 2. Validate category permission
    const categoryPermission = `action.${task.category}`;
    if (!context.userPermissions.includes(categoryPermission) && 
        !context.userPermissions.includes('action.view-all')) {
      return { authorized: false, reason: `Missing ${categoryPermission} permission` };
    }

    // 3. Validate source permission
    const sourcePermission = `action.source.${task.source}`;
    if (!context.userPermissions.includes(sourcePermission) && 
        !context.userPermissions.includes('action.view-all')) {
      return { authorized: false, reason: `Missing ${sourcePermission} permission` };
    }

    // 4. Validate facility scope
    if (task.scope.facilityId && context.facilityId) {
      if (task.scope.facilityId !== context.facilityId) {
        if (!context.userPermissions.includes('facility.action.query')) {
          return { authorized: false, reason: 'Task from different facility' };
        }
      }
    }

    return { authorized: true };
  }

  // ==========================================================================
  // VALIDATION HELPERS
  // ==========================================================================

  private validateTenantIsolation(query: ActionQuery, context: ActionPolicyContext): boolean {
    // Query tenant must match context tenant OR federation must be enabled
    return query.scope.tenantId === context.tenantId || !!context.federationEnabled;
  }

  private validateFederationRules(context: ActionPolicyContext): boolean {
    return (
      !!context.federationEnabled &&
      context.userPermissions.includes('action.federated')
    );
  }

  private validateQueryPermission(context: ActionPolicyContext): boolean {
    return (
      context.userPermissions.includes('action.query') ||
      context.userPermissions.includes('action.view-all')
    );
  }

  private validateCategoryPermissions(
    query: ActionQuery,
    context: ActionPolicyContext
  ): ActionCategory[] {
    const denied: ActionCategory[] = [];

    // If user has view-all, no categories denied
    if (context.userPermissions.includes('action.view-all')) {
      return [];
    }

    // Check each requested category
    const categoriesToCheck = query.categories || [
      'alert-remediation',
      'audit-remediation',
      'integrity-drift-remediation',
      'governance-lineage-issue',
      'documentation-completeness',
      'fabric-link-breakage',
      'compliance-pack-issue',
      'simulation-mismatch',
    ];

    for (const category of categoriesToCheck) {
      const permission = `action.${category}`;
      if (!context.userPermissions.includes(permission)) {
        denied.push(category);
      }
    }

    return denied;
  }

  private validateSourcePermissions(
    query: ActionQuery,
    context: ActionPolicyContext
  ): ActionSource[] {
    const denied: ActionSource[] = [];

    // If user has view-all, no sources denied
    if (context.userPermissions.includes('action.view-all')) {
      return [];
    }

    // Check each requested source
    const sourcesToCheck = query.sources || [
      'alert-center',
      'auditor',
      'integrity-monitor',
      'governance-system',
      'governance-lineage',
      'documentation-bundler',
      'knowledge-fabric',
      'compliance-engine',
      'simulation-engine',
    ];

    for (const source of sourcesToCheck) {
      const permission = `action.source.${source}`;
      if (!context.userPermissions.includes(permission)) {
        denied.push(source);
      }
    }

    return denied;
  }

  // ==========================================================================
  // LIFECYCLE AUTHORIZATION
  // ==========================================================================

  /**
   * Authorize task lifecycle changes (acknowledge, assign, resolve, dismiss)
   */
  authorizeLifecycleChange(
    task: ActionTask,
    operation: 'acknowledge' | 'assign' | 'resolve' | 'dismiss',
    context: ActionPolicyContext
  ): ActionPolicyDecision {
    // 1. User must have task visibility
    const visibilityDecision = this.authorizeTask(task, context);
    if (!visibilityDecision.authorized) {
      return visibilityDecision;
    }

    // 2. Check operation-specific permission
    const operationPermission = `action.${operation}`;
    if (!context.userPermissions.includes(operationPermission)) {
      return {
        authorized: false,
        reason: `Missing ${operationPermission} permission`,
        restrictedOperations: [operation],
      };
    }

    // 3. For assignment, check if user can assign to others
    if (operation === 'assign' && task.assignedTo !== context.performedBy) {
      if (!context.userPermissions.includes('action.assign-others')) {
        return {
          authorized: false,
          reason: 'Missing action.assign-others permission',
          restrictedOperations: ['assign-others'],
        };
      }
    }

    return { authorized: true };
  }

  // ==========================================================================
  // POLICY LOGGING
  // ==========================================================================

  private logAndReturnDecision(
    context: ActionPolicyContext,
    authorized: boolean,
    reason?: string,
    deniedCategories?: ActionCategory[],
    deniedSources?: ActionSource[]
  ): ActionPolicyDecision {
    const decision: ActionPolicyDecision = {
      authorized,
      reason,
      deniedCategories,
      deniedSources,
    };

    const logEntry: PolicyDecisionLogEntry = {
      entryId: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'policy-decision',
      timestamp: new Date().toISOString(),
      tenantId: context.tenantId,
      facilityId: context.facilityId,
      performedBy: context.performedBy,
      success: authorized,
      decision,
    };

    this.policyLog.push(logEntry);

    return decision;
  }

  /**
   * Get policy decision log
   */
  getPolicyLog(): PolicyDecisionLogEntry[] {
    return [...this.policyLog];
  }

  /**
   * Get policy statistics
   */
  getPolicyStatistics() {
    const stats = {
      totalDecisions: this.policyLog.length,
      authorized: 0,
      denied: 0,
      partiallyAuthorized: 0,
      byReason: {} as Record<string, number>,
      byTenant: {} as Record<string, number>,
      byPerformer: {} as Record<string, number>,
    };

    for (const entry of this.policyLog) {
      if (entry.decision.authorized) {
        if (entry.decision.deniedCategories?.length || entry.decision.deniedSources?.length) {
          stats.partiallyAuthorized++;
        } else {
          stats.authorized++;
        }
      } else {
        stats.denied++;
      }

      if (entry.decision.reason) {
        stats.byReason[entry.decision.reason] = (stats.byReason[entry.decision.reason] || 0) + 1;
      }

      stats.byTenant[entry.tenantId] = (stats.byTenant[entry.tenantId] || 0) + 1;
      stats.byPerformer[entry.performedBy] = (stats.byPerformer[entry.performedBy] || 0) + 1;
    }

    return stats;
  }

  /**
   * Clear policy log (maintenance)
   */
  clearPolicyLog(): void {
    this.policyLog = [];
  }
}
