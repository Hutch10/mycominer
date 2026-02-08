/**
 * OPERATOR ANALYTICS POLICY ENGINE
 * Phase 54: Operator Performance & Workflow Analytics Center
 * 
 * Enforces tenant isolation, federation rules, and permissions.
 * Read-only access control for analytics queries.
 */

import {
  OperatorAnalyticsScope,
  OperatorMetricQuery,
  OperatorAnalyticsPolicyContext,
  OperatorAnalyticsPolicyDecision,
  OperatorMetricCategory,
} from './operatorAnalyticsTypes';

// ============================================================================
// OPERATOR ANALYTICS POLICY ENGINE
// ============================================================================

export class OperatorAnalyticsPolicyEngine {
  // ==========================================================================
  // POLICY EVALUATION
  // ==========================================================================

  evaluateQueryPolicy(
    query: OperatorMetricQuery,
    context: OperatorAnalyticsPolicyContext
  ): OperatorAnalyticsPolicyDecision {
    const violations: string[] = [];
    const warnings: string[] = [];

    // 1. Tenant Isolation
    if (!this.validateTenantIsolation(query.scope, context)) {
      violations.push('Tenant isolation violated: Cannot access data from other tenants');
    }

    // 2. Federation Rules
    if (query.scope.federationId && !this.validateFederationAccess(query.scope, context)) {
      violations.push('Federation access denied: User not authorized for this federation');
    }

    // 3. Operator Access
    if (query.operatorIds && query.operatorIds.length > 0) {
      const operatorViolation = this.validateOperatorAccess(query.operatorIds, context);
      if (operatorViolation) {
        violations.push(operatorViolation);
      }
    }

    // 4. Metric Category Permissions
    const categoryViolations = this.validateCategoryPermissions(query.categories || [], context);
    violations.push(...categoryViolations);

    // 5. Time Range Validation
    const timeRangeWarning = this.validateTimeRange(query.timeRange);
    if (timeRangeWarning) {
      warnings.push(timeRangeWarning);
    }

    // 6. Cross-Tenant Query Detection
    if (this.detectCrossTenantQuery(query, context)) {
      violations.push('Cross-tenant query detected: Cannot query multiple tenants simultaneously');
    }

    // 7. Data Privacy Rules
    const privacyViolation = this.validateDataPrivacy(query, context);
    if (privacyViolation) {
      violations.push(privacyViolation);
    }

    const allowed = violations.length === 0;

    return {
      allowed,
      reason: allowed 
        ? 'Query authorized' 
        : `Query denied: ${violations.join('; ')}`,
      scope: query.scope,
      restrictions: this.buildRestrictions(query, context),
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
    scope: OperatorAnalyticsScope,
    context: OperatorAnalyticsPolicyContext
  ): boolean {
    // If user is querying their own tenant, allow
    if (scope.tenantId === context.userTenantId) {
      return true;
    }

    // If user has cross-tenant permission, allow
    if (context.permissions.includes('cross-tenant-read')) {
      return true;
    }

    // If federation query and user is federation admin, allow
    if (scope.federationId && context.permissions.includes('federation-admin')) {
      return true;
    }

    return false;
  }

  // ==========================================================================
  // FEDERATION ACCESS
  // ==========================================================================

  private validateFederationAccess(
    scope: OperatorAnalyticsScope,
    context: OperatorAnalyticsPolicyContext
  ): boolean {
    // Federation admin can access all federations
    if (context.permissions.includes('federation-admin')) {
      return true;
    }

    // Check if user's federation matches scope
    if (context.userFederationId === scope.federationId) {
      return true;
    }

    // Check if user has explicit federation access
    if (context.permissions.includes(`federation-read:${scope.federationId}`)) {
      return true;
    }

    return false;
  }

  // ==========================================================================
  // OPERATOR ACCESS
  // ==========================================================================

  private validateOperatorAccess(
    operatorIds: string[],
    context: OperatorAnalyticsPolicyContext
  ): string | null {
    // Admin can view all operators
    if (context.permissions.includes('view-all-operators')) {
      return null;
    }

    // Users can view their own metrics
    if (operatorIds.length === 1 && operatorIds[0] === context.userId) {
      return null;
    }

    // Team leads can view their team
    if (context.permissions.includes('view-team-operators')) {
      // In real system, check if requested operators are in user's team
      return null;
    }

    return 'Insufficient permissions to view requested operator metrics';
  }

  // ==========================================================================
  // CATEGORY PERMISSIONS
  // ==========================================================================

  private validateCategoryPermissions(
    categories: OperatorMetricCategory[],
    context: OperatorAnalyticsPolicyContext
  ): string[] {
    const violations: string[] = [];

    const restrictedCategories: Record<string, string> = {
      'cross-engine-efficiency': 'view-cross-engine-metrics',
      'workload-distribution': 'view-workload-metrics',
    };

    for (const category of categories) {
      const requiredPermission = restrictedCategories[category];
      
      if (requiredPermission && !context.permissions.includes(requiredPermission)) {
        violations.push(
          `Insufficient permissions for category '${category}': requires '${requiredPermission}'`
        );
      }
    }

    return violations;
  }

  // ==========================================================================
  // TIME RANGE VALIDATION
  // ==========================================================================

  private validateTimeRange(timeRange: {
    startDate: string;
    endDate: string;
  }): string | null {
    const start = new Date(timeRange.startDate);
    const end = new Date(timeRange.endDate);
    const now = new Date();

    // Check if time range is in the future
    if (start > now) {
      return 'Start date cannot be in the future';
    }

    // Check if time range is too large (> 1 year)
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      return 'Time range cannot exceed 365 days';
    }

    // Check if end date is before start date
    if (end < start) {
      return 'End date must be after start date';
    }

    return null;
  }

  // ==========================================================================
  // CROSS-TENANT DETECTION
  // ==========================================================================

  private detectCrossTenantQuery(
    query: OperatorMetricQuery,
    context: OperatorAnalyticsPolicyContext
  ): boolean {
    // If scope tenant doesn't match user tenant and no cross-tenant permission
    if (
      query.scope.tenantId !== context.userTenantId &&
      !context.permissions.includes('cross-tenant-read') &&
      !context.permissions.includes('federation-admin')
    ) {
      return true;
    }

    return false;
  }

  // ==========================================================================
  // DATA PRIVACY
  // ==========================================================================

  private validateDataPrivacy(
    query: OperatorMetricQuery,
    context: OperatorAnalyticsPolicyContext
  ): string | null {
    // Check for PII exposure in operator queries
    if (query.operatorIds && query.operatorIds.length > 0) {
      // If querying multiple operators, ensure user has bulk access
      if (
        query.operatorIds.length > 10 &&
        !context.permissions.includes('view-all-operators')
      ) {
        return 'Bulk operator queries require view-all-operators permission';
      }
    }

    // Check for sensitive metric categories
    const sensitiveCategories = ['workload-distribution', 'cross-engine-efficiency'];
    const requestedSensitive = (query.categories || []).filter(cat =>
      sensitiveCategories.includes(cat)
    );

    if (requestedSensitive.length > 0 && !context.permissions.includes('view-sensitive-metrics')) {
      return `Access denied to sensitive categories: ${requestedSensitive.join(', ')}`;
    }

    return null;
  }

  // ==========================================================================
  // BUILD RESTRICTIONS
  // ==========================================================================

  private buildRestrictions(
    query: OperatorMetricQuery,
    context: OperatorAnalyticsPolicyContext
  ): string[] {
    const restrictions: string[] = [];

    // Operator restrictions
    if (!context.permissions.includes('view-all-operators')) {
      restrictions.push('Can only view own operator metrics');
    }

    // Category restrictions
    const restrictedCategories = ['cross-engine-efficiency', 'workload-distribution'];
    const deniedCategories = restrictedCategories.filter(
      cat => !context.permissions.includes(`view-${cat}`)
    );

    if (deniedCategories.length > 0) {
      restrictions.push(`Restricted categories: ${deniedCategories.join(', ')}`);
    }

    // Tenant restrictions
    if (!context.permissions.includes('cross-tenant-read')) {
      restrictions.push('Limited to own tenant data');
    }

    // Federation restrictions
    if (query.scope.federationId && !context.permissions.includes('federation-admin')) {
      restrictions.push('Limited federation access');
    }

    return restrictions;
  }

  // ==========================================================================
  // PERMISSION HELPERS
  // ==========================================================================

  hasPermission(
    context: OperatorAnalyticsPolicyContext,
    permission: string
  ): boolean {
    return context.permissions.includes(permission);
  }

  canAccessTenant(
    context: OperatorAnalyticsPolicyContext,
    tenantId: string
  ): boolean {
    return (
      context.userTenantId === tenantId ||
      context.permissions.includes('cross-tenant-read')
    );
  }

  canAccessFederation(
    context: OperatorAnalyticsPolicyContext,
    federationId: string
  ): boolean {
    return (
      context.userFederationId === federationId ||
      context.permissions.includes('federation-admin') ||
      context.permissions.includes(`federation-read:${federationId}`)
    );
  }

  canAccessOperator(
    context: OperatorAnalyticsPolicyContext,
    operatorId: string
  ): boolean {
    return (
      context.userId === operatorId ||
      context.permissions.includes('view-all-operators') ||
      context.permissions.includes('view-team-operators')
    );
  }

  canAccessCategory(
    context: OperatorAnalyticsPolicyContext,
    category: OperatorMetricCategory
  ): boolean {
    const restrictedCategories: Record<string, string> = {
      'cross-engine-efficiency': 'view-cross-engine-metrics',
      'workload-distribution': 'view-workload-metrics',
    };

    const requiredPermission = restrictedCategories[category];
    
    if (!requiredPermission) {
      return true; // Public category
    }

    return context.permissions.includes(requiredPermission);
  }

  // ==========================================================================
  // AUDIT TRAIL HELPERS
  // ==========================================================================

  createAuditEntry(
    decision: OperatorAnalyticsPolicyDecision,
    context: OperatorAnalyticsPolicyContext,
    query: OperatorMetricQuery
  ): {
    timestamp: string;
    userId: string;
    tenantId: string;
    action: 'query-analytics';
    allowed: boolean;
    reason: string;
    queryId: string;
    scope: OperatorAnalyticsScope;
  } {
    return {
      timestamp: new Date().toISOString(),
      userId: context.userId,
      tenantId: context.userTenantId,
      action: 'query-analytics',
      allowed: decision.allowed,
      reason: decision.reason,
      queryId: query.queryId,
      scope: query.scope,
    };
  }
}
