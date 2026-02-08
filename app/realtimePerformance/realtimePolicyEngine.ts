/**
 * REAL-TIME POLICY ENGINE
 * Phase 55: Real-Time Performance Monitoring
 * 
 * Enforce tenant isolation, federation rules, and operator permissions
 * for real-time monitoring queries and event visibility.
 * 
 * NO GENERATIVE AI. NO PREDICTIONS.
 * All policy decisions based on explicit rules.
 */

import {
  RealTimeQuery,
  RealTimePolicyContext,
  RealTimePolicyDecision,
  RealTimeEvent,
  RealTimeMetric,
} from './realtimeTypes';

// ============================================================================
// REAL-TIME POLICY ENGINE
// ============================================================================

export class RealTimePolicyEngine {
  private policyVersion = '1.0.0';

  // ==========================================================================
  // QUERY POLICY EVALUATION
  // ==========================================================================

  /**
   * Evaluate real-time query policy
   */
  evaluateQueryPolicy(
    query: RealTimeQuery,
    context: RealTimePolicyContext
  ): RealTimePolicyDecision {
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

    // Rule 4: Category Permissions
    if (query.categories) {
      const restrictedCategories = this.getRestrictedCategories(query.categories, context);
      if (restrictedCategories.length > 0) {
        violations.push(`Category access denied: ${restrictedCategories.join(', ')}`);
      }
    }

    // Rule 5: Bulk Query Limits
    if (query.operatorIds && query.operatorIds.length > 10) {
      if (!this.hasPermission(context, 'realtime:bulk-query')) {
        violations.push('Bulk query denied: Cannot query more than 10 operators without bulk-query permission');
      }
    }

    // Build restrictions
    if (!this.hasPermission(context, 'realtime:view-all-events')) {
      restrictions.push('Event visibility limited to user scope');
    }

    if (!this.hasPermission(context, 'realtime:view-sensitive-metrics')) {
      restrictions.push('Sensitive metrics excluded');
    }

    // Warnings
    if (query.options?.includeHistory && query.options.historyLimitMinutes && query.options.historyLimitMinutes > 60) {
      warnings.push('Historical queries beyond 60 minutes may impact performance');
    }

    const allowed = violations.length === 0;
    const reason = allowed
      ? 'Real-time query authorized'
      : `Real-time query denied: ${violations.join('; ')}`;

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
  // EVENT VISIBILITY POLICY
  // ==========================================================================

  /**
   * Evaluate event visibility policy
   */
  evaluateEventVisibility(
    event: RealTimeEvent,
    context: RealTimePolicyContext
  ): boolean {
    // Check tenant isolation
    if (!this.canAccessTenant(event.scope.tenantId, context)) {
      return false;
    }

    // Check federation access
    if (event.scope.federationId && !this.canAccessFederation(event.scope.federationId, context)) {
      return false;
    }

    // Check category permissions
    if (this.isCategoryRestricted(event.category, context)) {
      return false;
    }

    // Check operator-specific events
    if (event.operatorId && !this.canAccessOperator(event.operatorId, context)) {
      return false;
    }

    return true;
  }

  // ==========================================================================
  // METRIC VISIBILITY POLICY
  // ==========================================================================

  /**
   * Evaluate metric visibility policy
   */
  evaluateMetricVisibility(
    metric: RealTimeMetric,
    context: RealTimePolicyContext
  ): boolean {
    // Check tenant isolation
    if (!this.canAccessTenant(metric.scope.tenantId, context)) {
      return false;
    }

    // Check federation access
    if (metric.scope.federationId && !this.canAccessFederation(metric.scope.federationId, context)) {
      return false;
    }

    // Check sensitive metrics
    const sensitiveCategories = ['workload-delta', 'trend-signal'];
    if (sensitiveCategories.includes(metric.category)) {
      if (!this.hasPermission(context, 'realtime:view-sensitive-metrics')) {
        return false;
      }
    }

    return true;
  }

  // ==========================================================================
  // VALIDATION METHODS
  // ==========================================================================

  private validateTenantIsolation(
    scope: { tenantId: string; facilityId?: string; federationId?: string },
    context: RealTimePolicyContext
  ): boolean {
    // Allow if user has cross-tenant permission
    if (this.hasPermission(context, 'realtime:cross-tenant-read')) {
      return true;
    }

    // Allow if user is federation admin
    if (this.hasPermission(context, 'realtime:federation-admin')) {
      return true;
    }

    // Otherwise, user can only access their own tenant
    return scope.tenantId === context.userTenantId;
  }

  private validateFederationAccess(
    scope: { tenantId: string; facilityId?: string; federationId?: string },
    context: RealTimePolicyContext
  ): boolean {
    if (!scope.federationId) return true;

    // Allow if user is federation admin
    if (this.hasPermission(context, 'realtime:federation-admin')) {
      return true;
    }

    // Allow if user is member of the federation
    if (context.userFederationId === scope.federationId) {
      return true;
    }

    // Allow if user has explicit federation access permission
    if (this.hasPermission(context, `realtime:federation:${scope.federationId}`)) {
      return true;
    }

    return false;
  }

  private validateOperatorAccess(
    operatorIds: string[],
    context: RealTimePolicyContext
  ): boolean {
    // Allow if user can view all operators
    if (this.hasPermission(context, 'realtime:view-all-operators')) {
      return true;
    }

    // Allow if user can view team operators
    if (this.hasPermission(context, 'realtime:view-team-operators')) {
      return true;
    }

    // Otherwise, user can only view their own metrics
    return operatorIds.length === 1 && operatorIds[0] === context.userId;
  }

  private getRestrictedCategories(
    categories: string[],
    context: RealTimePolicyContext
  ): string[] {
    const restrictedCategories: string[] = [];

    for (const category of categories) {
      if (this.isCategoryRestricted(category, context)) {
        restrictedCategories.push(category);
      }
    }

    return restrictedCategories;
  }

  private isCategoryRestricted(category: string, context: RealTimePolicyContext): boolean {
    // Cross-engine performance requires special permission
    if (category === 'cross-engine-performance') {
      return !this.hasPermission(context, 'realtime:view-cross-engine-metrics');
    }

    // Workload delta requires special permission
    if (category === 'workload-delta') {
      return !this.hasPermission(context, 'realtime:view-workload-metrics');
    }

    // Trend signals require special permission
    if (category === 'trend-signal') {
      return !this.hasPermission(context, 'realtime:view-trend-metrics');
    }

    return false;
  }

  // ==========================================================================
  // PERMISSION HELPERS
  // ==========================================================================

  private hasPermission(context: RealTimePolicyContext, permission: string): boolean {
    return context.permissions.includes(permission);
  }

  private canAccessTenant(tenantId: string, context: RealTimePolicyContext): boolean {
    if (this.hasPermission(context, 'realtime:cross-tenant-read')) {
      return true;
    }
    return tenantId === context.userTenantId;
  }

  private canAccessFederation(federationId: string, context: RealTimePolicyContext): boolean {
    if (this.hasPermission(context, 'realtime:federation-admin')) {
      return true;
    }
    if (context.userFederationId === federationId) {
      return true;
    }
    if (this.hasPermission(context, `realtime:federation:${federationId}`)) {
      return true;
    }
    return false;
  }

  private canAccessOperator(operatorId: string, context: RealTimePolicyContext): boolean {
    if (this.hasPermission(context, 'realtime:view-all-operators')) {
      return true;
    }
    if (this.hasPermission(context, 'realtime:view-team-operators')) {
      return true;
    }
    return operatorId === context.userId;
  }

  // ==========================================================================
  // AUDIT ENTRY CREATION
  // ==========================================================================

  createAuditEntry(
    query: RealTimeQuery,
    decision: RealTimePolicyDecision,
    context: RealTimePolicyContext
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
