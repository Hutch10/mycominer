/**
 * ENTERPRISE REPORTING - POLICY ENGINE
 * Phase 59: Expansion Track
 * 
 * Enforces tenant isolation and authorization for report generation.
 */

import {
  ReportQuery,
  ReportingPolicyContext,
  ReportingPolicyDecision,
  ReportingPolicyAudit,
  ReportBundle,
} from './reportingTypes';

export class ReportingPolicyEngine {
  /**
   * Evaluate whether a report query is allowed
   */
  evaluateQueryPolicy(
    query: ReportQuery,
    context: ReportingPolicyContext
  ): ReportingPolicyDecision {
    const violations: string[] = [];
    const warnings: string[] = [];
    const restrictions: string[] = [];
    
    // Rule 1: Tenant isolation
    if (query.scope.tenantId && query.scope.tenantId !== context.userTenantId) {
      if (!this.hasPermission(context, 'reporting:cross-tenant-read') &&
          !this.hasPermission(context, 'reporting:federation-admin')) {
        violations.push('Cross-tenant report access denied');
      }
    }
    
    // Rule 2: Federation access
    if (query.scope.federationId) {
      if (!this.hasPermission(context, 'reporting:federation-admin') &&
          query.scope.federationId !== context.userFederationId &&
          !this.hasPermission(context, `reporting:federation:${query.scope.federationId}`)) {
        violations.push('Federation report access denied');
      }
    }
    
    // Rule 3: Executive permissions for certain report categories
    if (query.category === 'executive-summary' || query.category === 'cross-engine-operational') {
      if (!this.hasExecutivePermission(context)) {
        violations.push('Executive-level reports require executive permissions');
      }
    }
    
    // Rule 4: Compliance pack requires auditor role or permission
    if (query.category === 'compliance-pack') {
      if (context.role !== 'auditor' && context.role !== 'executive' && context.role !== 'admin' &&
          !this.hasPermission(context, 'reporting:compliance-pack')) {
        violations.push('Compliance pack generation requires auditor role or permission');
      }
    }
    
    // Rule 5: Time period restrictions
    const timePeriodDays = this.getTimePeriodDays(query.timePeriod, query.customTimeRange);
    if (timePeriodDays > 90 && !this.hasPermission(context, 'reporting:long-range-reports')) {
      violations.push('Time period exceeds 90 days without long-range reporting permission');
    } else if (timePeriodDays > 90) {
      warnings.push('Long-range reports may have reduced data availability');
    }
    
    // Determine if allowed
    const allowed = violations.length === 0;
    const reason = allowed
      ? 'All policy checks passed'
      : `Policy violations: ${violations.join(', ')}`;
    
    return {
      allowed,
      reason,
      violations,
      warnings,
      restrictions,
    };
  }
  
  /**
   * Evaluate if a generated report bundle can be viewed by the user
   */
  evaluateBundleVisibility(
    bundle: ReportBundle,
    context: ReportingPolicyContext
  ): boolean {
    // Check tenant access
    if (bundle.scope.tenantId && bundle.scope.tenantId !== context.userTenantId) {
      if (!this.hasPermission(context, 'reporting:cross-tenant-read') &&
          !this.hasPermission(context, 'reporting:federation-admin')) {
        return false;
      }
    }
    
    // Check federation access
    if (bundle.scope.federationId && bundle.scope.federationId !== context.userFederationId) {
      if (!this.hasPermission(context, 'reporting:federation-admin') &&
          !this.hasPermission(context, `reporting:federation:${bundle.scope.federationId}`)) {
        return false;
      }
    }
    
    // Check category-specific permissions
    if (bundle.category === 'executive-summary' || bundle.category === 'cross-engine-operational') {
      if (!this.hasExecutivePermission(context)) {
        return false;
      }
    }
    
    if (bundle.category === 'compliance-pack') {
      if (context.role !== 'auditor' && context.role !== 'executive' && context.role !== 'admin' &&
          !this.hasPermission(context, 'reporting:compliance-pack')) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Create audit entry for a policy decision
   */
  createAuditEntry(
    query: ReportQuery,
    context: ReportingPolicyContext,
    decision: ReportingPolicyDecision
  ): ReportingPolicyAudit {
    return {
      auditId: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: context.userId,
      userRole: context.role,
      tenantId: context.userTenantId,
      queryId: query.queryId,
      queryDescription: query.description,
      queryScope: query.scope,
      decision,
      policyVersion: '1.0.0',
    };
  }
  
  // ============================================================================
  // HELPERS
  // ============================================================================
  
  private hasPermission(context: ReportingPolicyContext, permission: string): boolean {
    return context.permissions.includes(permission);
  }
  
  private hasExecutivePermission(context: ReportingPolicyContext): boolean {
    return (
      context.role === 'executive' ||
      context.role === 'admin' ||
      this.hasPermission(context, 'reporting:executive-view')
    );
  }
  
  private getTimePeriodDays(
    timePeriod: string,
    customTimeRange?: { start: string; end: string }
  ): number {
    if (timePeriod === 'custom' && customTimeRange) {
      const start = new Date(customTimeRange.start).getTime();
      const end = new Date(customTimeRange.end).getTime();
      return (end - start) / (1000 * 60 * 60 * 24);
    }
    
    const periodMap: Record<string, number> = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      quarterly: 90,
    };
    
    return periodMap[timePeriod] || 30;
  }
}
