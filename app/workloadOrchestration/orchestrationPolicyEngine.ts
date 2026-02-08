/**
 * ORCHESTRATION POLICY ENGINE
 * Phase 57: Workload Orchestration & Scheduling Engine
 * 
 * Enforces tenant isolation, federation rules, operator permissions.
 * 
 * NO GENERATIVE AI. NO PREDICTIONS.
 */

import {
  OrchestrationQuery,
  OrchestrationSchedule,
  OrchestrationSlot,
  OrchestrationPolicyContext,
  OrchestrationPolicyDecision,
} from './orchestrationTypes';

// ============================================================================
// ORCHESTRATION POLICY ENGINE
// ============================================================================

export class OrchestrationPolicyEngine {
  // ==========================================================================
  // POLICY EVALUATION
  // ==========================================================================

  /**
   * Evaluate query policy
   */
  evaluateQueryPolicy(
    query: OrchestrationQuery,
    context: OrchestrationPolicyContext
  ): OrchestrationPolicyDecision {
    const violations: string[] = [];
    const warnings: string[] = [];
    const restrictions: string[] = [];
    
    // Rule 1: Tenant isolation
    if (!this.validateTenantIsolation(query.scope, context)) {
      violations.push('User cannot access schedules for other tenants');
    }
    
    // Rule 2: Federation access
    if (query.scope.federationId && !this.validateFederationAccess(query.scope, context)) {
      violations.push('User does not have federation access');
    }
    
    // Rule 3: Operator permissions
    if (query.operatorIds && !this.validateOperatorAccess(query.operatorIds, context)) {
      violations.push('User cannot view schedules for specified operators');
    }
    
    // Rule 4: Time range limits
    const timeRangeHours = (new Date(query.timeRange.end).getTime() - new Date(query.timeRange.start).getTime()) / (1000 * 60 * 60);
    if (timeRangeHours > 168 && !context.permissions.includes('orchestration:long-range-schedule')) {
      violations.push('Long-range schedules (>7 days) require special permission');
    } else if (timeRangeHours > 168) {
      warnings.push('Long-range schedules may have reduced accuracy');
    }
    
    // Rule 5: Restricted categories
    const restrictedCategories = this.getRestrictedCategories(query.categories || [], context);
    if (restrictedCategories.length > 0) {
      restrictions.push(`Categories restricted: ${restrictedCategories.join(', ')}`);
    }
    
    const allowed = violations.length === 0;
    const reason = allowed
      ? 'Query authorized'
      : `Policy violations: ${violations.join('; ')}`;
    
    return {
      allowed,
      reason,
      scope: query.scope,
      restrictions,
      violations,
      warnings,
      evaluatedAt: new Date().toISOString(),
      policyVersion: '1.0.0',
    };
  }

  // ==========================================================================
  // TENANT ISOLATION
  // ==========================================================================

  private validateTenantIsolation(
    scope: { tenantId: string; facilityId?: string; federationId?: string },
    context: OrchestrationPolicyContext
  ): boolean {
    // Allow if user has cross-tenant read permission
    if (context.permissions.includes('orchestration:cross-tenant-read')) {
      return true;
    }
    
    // Allow if user is federation admin
    if (context.permissions.includes('orchestration:federation-admin')) {
      return true;
    }
    
    // Otherwise, must match user's tenant
    return scope.tenantId === context.userTenantId;
  }

  // ==========================================================================
  // FEDERATION ACCESS
  // ==========================================================================

  private validateFederationAccess(
    scope: { tenantId: string; facilityId?: string; federationId?: string },
    context: OrchestrationPolicyContext
  ): boolean {
    // Allow if user is federation admin
    if (context.permissions.includes('orchestration:federation-admin')) {
      return true;
    }
    
    // Allow if user is member of the federation
    if (context.userFederationId === scope.federationId) {
      return true;
    }
    
    // Allow if user has explicit permission for this federation
    if (context.permissions.includes(`orchestration:federation:${scope.federationId}`)) {
      return true;
    }
    
    return false;
  }

  // ==========================================================================
  // OPERATOR ACCESS
  // ==========================================================================

  private validateOperatorAccess(
    operatorIds: string[],
    context: OrchestrationPolicyContext
  ): boolean {
    // Allow if user can view all operators
    if (context.permissions.includes('orchestration:view-all-operators')) {
      return true;
    }
    
    // Allow if user can view team operators (assume all requested are in team)
    if (context.permissions.includes('orchestration:view-team-operators')) {
      return true;
    }
    
    // Otherwise, only allow viewing own schedules
    return operatorIds.length === 1 && operatorIds[0] === context.userId;
  }

  // ==========================================================================
  // CATEGORY RESTRICTIONS
  // ==========================================================================

  private getRestrictedCategories(
    categories: string[],
    context: OrchestrationPolicyContext
  ): string[] {
    const restricted: string[] = [];
    
    for (const category of categories) {
      if (category === 'audit-remediation' && !context.permissions.includes('orchestration:view-audit-remediation')) {
        restricted.push(category);
      }
      
      if (category === 'governance-issue' && !context.permissions.includes('orchestration:view-governance-issues')) {
        restricted.push(category);
      }
      
      if (category === 'capacity-aligned-workload' && !context.permissions.includes('orchestration:view-capacity-aligned')) {
        restricted.push(category);
      }
    }
    
    return restricted;
  }

  // ==========================================================================
  // VISIBILITY FILTERING
  // ==========================================================================

  /**
   * Evaluate schedule visibility
   */
  evaluateScheduleVisibility(
    schedule: OrchestrationSchedule,
    context: OrchestrationPolicyContext
  ): boolean {
    // Check tenant access
    if (!this.canAccessTenant(schedule.scope.tenantId, context)) {
      return false;
    }
    
    // Check federation access
    if (schedule.scope.federationId && !this.canAccessFederation(schedule.scope.federationId, context)) {
      return false;
    }
    
    return true;
  }

  /**
   * Evaluate slot visibility
   */
  evaluateSlotVisibility(
    slot: OrchestrationSlot,
    context: OrchestrationPolicyContext
  ): boolean {
    // Check operator access
    if (!context.permissions.includes('orchestration:view-all-operators') &&
        !context.permissions.includes('orchestration:view-team-operators') &&
        slot.operatorId !== context.userId) {
      return false;
    }
    
    // Check category restrictions
    if (slot.category === 'audit-remediation' && !context.permissions.includes('orchestration:view-audit-remediation')) {
      return false;
    }
    
    if (slot.category === 'governance-issue' && !context.permissions.includes('orchestration:view-governance-issues')) {
      return false;
    }
    
    return true;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private canAccessTenant(tenantId: string, context: OrchestrationPolicyContext): boolean {
    if (context.permissions.includes('orchestration:cross-tenant-read')) {
      return true;
    }
    
    return tenantId === context.userTenantId;
  }

  private canAccessFederation(federationId: string, context: OrchestrationPolicyContext): boolean {
    if (context.permissions.includes('orchestration:federation-admin')) {
      return true;
    }
    
    if (context.userFederationId === federationId) {
      return true;
    }
    
    if (context.permissions.includes(`orchestration:federation:${federationId}`)) {
      return true;
    }
    
    return false;
  }

  /**
   * Create audit entry
   */
  createAuditEntry(
    query: OrchestrationQuery,
    decision: OrchestrationPolicyDecision,
    context: OrchestrationPolicyContext
  ): Record<string, unknown> {
    return {
      auditId: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: context.userId,
      tenantId: context.userTenantId,
      queryId: query.queryId,
      queryScope: query.scope,
      decision: {
        allowed: decision.allowed,
        reason: decision.reason,
        violations: decision.violations,
        warnings: decision.warnings,
        restrictions: decision.restrictions,
      },
      policyVersion: decision.policyVersion,
    };
  }
}
