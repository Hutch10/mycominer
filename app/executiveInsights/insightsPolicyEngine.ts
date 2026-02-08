/**
 * INSIGHTS POLICY ENGINE
 * Phase 58: Executive Insights
 * 
 * Enforce tenant isolation, federation rules, executive permissions.
 * 
 * NO GENERATIVE AI. Policy-based access control only.
 */

import {
  InsightQuery,
  InsightsPolicyContext,
  InsightsPolicyDecision,
} from './insightsTypes';

// ============================================================================
// INSIGHTS POLICY ENGINE
// ============================================================================

export class InsightsPolicyEngine {
  
  /**
   * Evaluate insight query policy
   */
  evaluateQueryPolicy(
    query: InsightQuery,
    context: InsightsPolicyContext,
  ): InsightsPolicyDecision {
    const violations: string[] = [];
    const warnings: string[] = [];
    const restrictions: string[] = [];

    // Rule 1: Tenant isolation
    if (!this.validateTenantIsolation(query.scope, context)) {
      violations.push('Cannot access other tenants without cross-tenant permission');
    }

    // Rule 2: Federation access
    if (query.scope.federationId && !this.validateFederationAccess(query.scope, context)) {
      violations.push('No federation access permission');
    }

    // Rule 3: Executive permissions for cross-engine insights
    if (query.categories.includes('cross-engine-operational') && !this.hasExecutivePermission(context)) {
      violations.push('Cross-engine insights require executive permissions');
    }

    // Rule 4: Time period limits
    const timePeriodHours = this.getTimePeriodHours(query.timePeriod, query.customTimeRange);
    if (timePeriodHours > 720 && !context.permissions.includes('insights:long-range-analysis')) {
      violations.push('Long-range analysis (>30 days) requires special permission');
    } else if (timePeriodHours > 720) {
      warnings.push('Long-range analysis may have reduced accuracy');
    }

    // Rule 5: Aggregation level restrictions
    if (query.aggregationLevel === 'operator' && !context.permissions.includes('insights:view-operator-details')) {
      restrictions.push('aggregationLevel:operator');
      warnings.push('Operator-level aggregation restricted');
    }

    const allowed = violations.length === 0;
    const reason = allowed
      ? 'All policy checks passed'
      : violations.join('; ');

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

  /**
   * Validate tenant isolation
   */
  private validateTenantIsolation(
    scope: { tenantId?: string; facilityId?: string; federationId?: string },
    context: InsightsPolicyContext,
  ): boolean {
    // Allow if cross-tenant permission
    if (context.permissions.includes('insights:cross-tenant-read')) {
      return true;
    }

    // Allow if federation admin
    if (context.permissions.includes('insights:federation-admin')) {
      return true;
    }

    // Allow if no tenant specified (will be filtered to user's tenant)
    if (!scope.tenantId) {
      return true;
    }

    // Must match user's tenant
    return scope.tenantId === context.userTenantId;
  }

  /**
   * Validate federation access
   */
  private validateFederationAccess(
    scope: { tenantId?: string; facilityId?: string; federationId?: string },
    context: InsightsPolicyContext,
  ): boolean {
    if (!scope.federationId) {
      return true;
    }

    // Allow if federation admin
    if (context.permissions.includes('insights:federation-admin')) {
      return true;
    }

    // Allow if member of federation
    if (context.userFederationId === scope.federationId) {
      return true;
    }

    // Allow if explicit permission
    if (context.permissions.includes(`insights:federation:${scope.federationId}`)) {
      return true;
    }

    return false;
  }

  /**
   * Check executive permission
   */
  private hasExecutivePermission(context: InsightsPolicyContext): boolean {
    return (
      context.role === 'executive' ||
      context.role === 'admin' ||
      context.permissions.includes('insights:executive-view')
    );
  }

  /**
   * Get time period in hours
   */
  private getTimePeriodHours(
    timePeriod: string,
    customTimeRange?: { start: string; end: string },
  ): number {
    if (timePeriod === 'custom' && customTimeRange) {
      const start = new Date(customTimeRange.start);
      const end = new Date(customTimeRange.end);
      return (end.getTime() - start.getTime()) / 3600000;
    }

    const periodMap: Record<string, number> = {
      '1h': 1,
      '6h': 6,
      '24h': 24,
      '7d': 168,
      '30d': 720,
    };

    return periodMap[timePeriod] || 24;
  }

  /**
   * Evaluate summary visibility
   */
  evaluateSummaryVisibility(
    summary: { category: string; tenantId?: string },
    context: InsightsPolicyContext,
  ): boolean {
    // Cross-engine requires executive permission
    if (summary.category === 'cross-engine-operational' && !this.hasExecutivePermission(context)) {
      return false;
    }

    // Tenant-specific summaries require tenant access
    if (summary.tenantId && !this.canAccessTenant(summary.tenantId, context)) {
      return false;
    }

    return true;
  }

  /**
   * Check tenant access
   */
  private canAccessTenant(tenantId: string, context: InsightsPolicyContext): boolean {
    return (
      context.permissions.includes('insights:cross-tenant-read') ||
      tenantId === context.userTenantId
    );
  }

  /**
   * Create audit entry
   */
  createAuditEntry(
    query: InsightQuery,
    decision: InsightsPolicyDecision,
    context: InsightsPolicyContext,
  ): Record<string, unknown> {
    return {
      auditId: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: context.userId,
      userRole: context.role,
      tenantId: context.userTenantId,
      queryId: query.queryId,
      queryDescription: query.description,
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
