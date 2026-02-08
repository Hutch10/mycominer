/**
 * CAPACITY POLICY ENGINE
 * Phase 56: Capacity Planning & Resource Forecasting
 * 
 * Enforce tenant isolation, federation rules, and operator permissions
 * for capacity planning queries and projection visibility.
 * 
 * NO GENERATIVE AI. NO PROBABILISTIC PREDICTION.
 */

import {
  CapacityQuery,
  CapacityPolicyContext,
  CapacityPolicyDecision,
  CapacityProjection,
  CapacityRiskWindow,
} from './capacityTypes';

// ============================================================================
// CAPACITY POLICY ENGINE
// ============================================================================

export class CapacityPolicyEngine {
  private policyVersion = '1.0.0';

  // ==========================================================================
  // QUERY POLICY EVALUATION
  // ==========================================================================

  /**
   * Evaluate capacity query policy
   */
  evaluateQueryPolicy(
    query: CapacityQuery,
    context: CapacityPolicyContext
  ): CapacityPolicyDecision {
    const violations: string[] = [];
    const warnings: string[] = [];
    const restrictions: string[] = [];

    // Rule 1: Tenant Isolation
    if (!this.validateTenantIsolation(query.scope, context)) {
      violations.push('Tenant isolation violated: Cannot access data from other tenants');
    }

    // Rule 2: Federation Access
    if (query.scope.federationId && !this.validateFederationAccess(query.scope, context)) {
      violations.push('Federation access denied: User lacks federation permissions');
    }

    // Rule 3: Operator Permissions
    if (query.operatorIds && query.operatorIds.length > 0) {
      if (!this.validateOperatorAccess(query.operatorIds, context)) {
        violations.push('Operator access denied: Cannot view other operators without permission');
      }
    }

    // Rule 4: Projection Category Permissions
    if (query.categories) {
      const restrictedCategories = this.getRestrictedCategories(query.categories, context);
      if (restrictedCategories.length > 0) {
        violations.push(`Category access denied: ${restrictedCategories.join(', ')}`);
      }
    }

    // Rule 5: Time Window Limits
    if (query.timeWindows) {
      const longWindows = query.timeWindows.filter(w => w === 'next-7-days');
      if (longWindows.length > 0 && !this.hasPermission(context, 'capacity:long-range-forecast')) {
        violations.push('Long-range forecast denied: Requires capacity:long-range-forecast permission');
      }
    }

    // Build restrictions
    if (!this.hasPermission(context, 'capacity:view-all-projections')) {
      restrictions.push('Projection visibility limited to user scope');
    }

    if (!this.hasPermission(context, 'capacity:view-risk-analysis')) {
      restrictions.push('Risk analysis excluded');
    }

    // Warnings
    if (query.timeWindows && query.timeWindows.includes('next-7-days')) {
      warnings.push('7-day forecasts have reduced confidence due to longer time horizon');
    }

    const allowed = violations.length === 0;
    const reason = allowed
      ? 'Capacity query authorized'
      : `Capacity query denied: ${violations.join('; ')}`;

    return {
      allowed,
      reason,
      scope: query.scope,
      restrictions,
      violations,
      warnings,
      evaluatedAt: new Date().toISOString(),
      policyVersion: this.policyVersion,
    };
  }

  // ==========================================================================
  // PROJECTION VISIBILITY POLICY
  // ==========================================================================

  /**
   * Evaluate projection visibility policy
   */
  evaluateProjectionVisibility(
    projection: CapacityProjection,
    context: CapacityPolicyContext
  ): boolean {
    // Check tenant isolation
    if (!this.canAccessTenant(projection.scope.tenantId, context)) {
      return false;
    }

    // Check federation access
    if (projection.scope.federationId && !this.canAccessFederation(projection.scope.federationId, context)) {
      return false;
    }

    // Check category permissions
    if (this.isCategoryRestricted(projection.category, context)) {
      return false;
    }

    return true;
  }

  // ==========================================================================
  // RISK VISIBILITY POLICY
  // ==========================================================================

  /**
   * Evaluate risk window visibility policy
   */
  evaluateRiskVisibility(
    risk: CapacityRiskWindow,
    context: CapacityPolicyContext
  ): boolean {
    // Require risk analysis permission
    if (!this.hasPermission(context, 'capacity:view-risk-analysis')) {
      return false;
    }

    // Check tenant isolation
    if (!this.canAccessTenant(risk.scope.tenantId, context)) {
      return false;
    }

    // Check federation access
    if (risk.scope.federationId && !this.canAccessFederation(risk.scope.federationId, context)) {
      return false;
    }

    return true;
  }

  // ==========================================================================
  // VALIDATION METHODS
  // ==========================================================================

  private validateTenantIsolation(
    scope: { tenantId: string; facilityId?: string; federationId?: string },
    context: CapacityPolicyContext
  ): boolean {
    // Allow if user has cross-tenant permission
    if (this.hasPermission(context, 'capacity:cross-tenant-read')) {
      return true;
    }

    // Allow if user is federation admin
    if (this.hasPermission(context, 'capacity:federation-admin')) {
      return true;
    }

    // Otherwise, user can only access their own tenant
    return scope.tenantId === context.userTenantId;
  }

  private validateFederationAccess(
    scope: { tenantId: string; facilityId?: string; federationId?: string },
    context: CapacityPolicyContext
  ): boolean {
    if (!scope.federationId) return true;

    // Allow if user is federation admin
    if (this.hasPermission(context, 'capacity:federation-admin')) {
      return true;
    }

    // Allow if user is member of the federation
    if (context.userFederationId === scope.federationId) {
      return true;
    }

    // Allow if user has explicit federation access permission
    if (this.hasPermission(context, `capacity:federation:${scope.federationId}`)) {
      return true;
    }

    return false;
  }

  private validateOperatorAccess(
    operatorIds: string[],
    context: CapacityPolicyContext
  ): boolean {
    // Allow if user can view all operators
    if (this.hasPermission(context, 'capacity:view-all-operators')) {
      return true;
    }

    // Allow if user can view team operators
    if (this.hasPermission(context, 'capacity:view-team-operators')) {
      return true;
    }

    // Otherwise, user can only view their own projections
    return operatorIds.length === 1 && operatorIds[0] === context.userId;
  }

  private getRestrictedCategories(
    categories: string[],
    context: CapacityPolicyContext
  ): string[] {
    const restrictedCategories: string[] = [];

    for (const category of categories) {
      if (this.isCategoryRestricted(category, context)) {
        restrictedCategories.push(category);
      }
    }

    return restrictedCategories;
  }

  private isCategoryRestricted(category: string, context: CapacityPolicyContext): boolean {
    // Cross-engine correlation requires special permission
    if (category === 'cross-engine-correlation') {
      return !this.hasPermission(context, 'capacity:view-cross-engine');
    }

    // Resource utilization requires special permission
    if (category === 'resource-utilization') {
      return !this.hasPermission(context, 'capacity:view-resource-utilization');
    }

    return false;
  }

  // ==========================================================================
  // PERMISSION HELPERS
  // ==========================================================================

  private hasPermission(context: CapacityPolicyContext, permission: string): boolean {
    return context.permissions.includes(permission);
  }

  private canAccessTenant(tenantId: string, context: CapacityPolicyContext): boolean {
    if (this.hasPermission(context, 'capacity:cross-tenant-read')) {
      return true;
    }
    return tenantId === context.userTenantId;
  }

  private canAccessFederation(federationId: string, context: CapacityPolicyContext): boolean {
    if (this.hasPermission(context, 'capacity:federation-admin')) {
      return true;
    }
    if (context.userFederationId === federationId) {
      return true;
    }
    if (this.hasPermission(context, `capacity:federation:${federationId}`)) {
      return true;
    }
    return false;
  }

  // ==========================================================================
  // AUDIT ENTRY CREATION
  // ==========================================================================

  createAuditEntry(
    query: CapacityQuery,
    decision: CapacityPolicyDecision,
    context: CapacityPolicyContext
  ): Record<string, unknown> {
    return {
      queryId: query.queryId,
      userId: context.userId,
      userTenantId: context.userTenantId,
      userFederationId: context.userFederationId,
      scope: query.scope,
      categories: query.categories,
      operatorIds: query.operatorIds,
      decision: decision.allowed ? 'allowed' : 'denied',
      reason: decision.reason,
      violations: decision.violations,
      warnings: decision.warnings,
      restrictions: decision.restrictions,
      timestamp: new Date().toISOString(),
      policyVersion: this.policyVersion,
    };
  }
}
