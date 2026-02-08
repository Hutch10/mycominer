/**
 * Export Policy Engine
 * Phase 60: Enterprise Export Hub & External Compliance Distribution Center
 * 
 * Enforces authorization and policy rules for export operations.
 * 
 * POLICY RULES:
 * 1. Tenant Isolation: Cross-tenant exports require explicit permission
 * 2. Federation Access: Federation-level exports require admin or membership
 * 3. Export Permissions: Certain categories require specific permissions
 * 4. Compliance Restrictions: Compliance packs require auditor role or permission
 * 5. Data Retention Limits: Long-range exports (>90 days) require permission
 * 6. Format Restrictions: ZIP and auditor packages require specific permissions
 */

import {
  ExportQuery,
  ExportBundle,
  ExportPolicyContext,
  ExportPolicyDecision,
  ExportPolicyAudit,
} from './exportTypes';

export class ExportPolicyEngine {
  /**
   * Evaluate export query policy
   * 
   * Evaluates all policy rules and returns a decision.
   */
  evaluateExportPolicy(
    query: ExportQuery,
    context: ExportPolicyContext
  ): ExportPolicyDecision {
    const violations: string[] = [];
    const warnings: string[] = [];
    const restrictions: string[] = [];
    
    // Rule 1: Tenant Isolation
    if (query.scope.tenantId && query.scope.tenantId !== context.userTenantId) {
      if (!this.hasPermission(context, 'export:cross-tenant') && 
          !this.hasPermission(context, 'export:federation-admin')) {
        violations.push('Cross-tenant export access denied. Requires export:cross-tenant permission.');
      }
    }
    
    // Rule 2: Federation Access
    if (query.scope.federationId) {
      const hasFederationAdmin = this.hasPermission(context, 'export:federation-admin');
      const isFederationMember = context.userFederationId === query.scope.federationId;
      const hasExplicitPermission = this.hasPermission(context, `export:federation:${query.scope.federationId}`);
      
      if (!hasFederationAdmin && !isFederationMember && !hasExplicitPermission) {
        violations.push('Federation export access denied. Requires federation admin role or membership.');
      }
    }
    
    // Rule 3: Export Permissions (category-specific)
    if (query.category === 'executive-summary' || query.category === 'full-operational') {
      if (!this.hasExecutivePermission(context)) {
        violations.push('Executive-level exports require executive permissions.');
      }
    }
    
    // Rule 4: Compliance Restrictions
    if (query.category === 'compliance-pack') {
      const hasComplianceRole = ['auditor', 'executive', 'admin'].includes(context.role);
      const hasCompliancePermission = this.hasPermission(context, 'export:compliance-pack');
      
      if (!hasComplianceRole && !hasCompliancePermission) {
        violations.push('Compliance pack exports require auditor role or export:compliance-pack permission.');
      }
    }
    
    // Rule 5: Data Retention Limits
    if (query.timeRange) {
      const startTime = new Date(query.timeRange.start).getTime();
      const endTime = new Date(query.timeRange.end).getTime();
      const durationDays = (endTime - startTime) / (24 * 60 * 60 * 1000);
      
      if (durationDays > 90) {
        if (!this.hasPermission(context, 'export:long-range')) {
          violations.push('Time range exceeds 90 days. Requires export:long-range permission.');
        } else {
          warnings.push('Long-range exports (>90 days) may have reduced data availability or increased generation time.');
        }
      }
    }
    
    // Rule 6: Format Restrictions
    if (query.format === 'zip' || query.format === 'auditor-package') {
      if (!this.hasPermission(context, 'export:bundle-formats')) {
        violations.push(`Format '${query.format}' requires export:bundle-formats permission.`);
      }
    }
    
    // Additional restrictions (not violations, but limitations)
    if (query.includeRawData) {
      if (!this.hasPermission(context, 'export:raw-data')) {
        restrictions.push('Raw data export restricted. Only summaries will be included.');
      }
    }
    
    // Decision
    const allowed = violations.length === 0;
    const reason = allowed 
      ? 'All policy checks passed. Export authorized.'
      : `Export denied: ${violations.join('; ')}`;
    
    return {
      allowed,
      reason,
      violations,
      warnings,
      restrictions,
    };
  }
  
  /**
   * Evaluate bundle visibility
   * 
   * Checks if user can view an existing export bundle.
   */
  evaluateBundleVisibility(
    bundle: ExportBundle,
    context: ExportPolicyContext
  ): boolean {
    // Check tenant access
    if (bundle.scope.tenantId && bundle.scope.tenantId !== context.userTenantId) {
      const hasCrossTenantAccess = this.hasPermission(context, 'export:cross-tenant') || 
                                     this.hasPermission(context, 'export:federation-admin');
      if (!hasCrossTenantAccess) {
        return false;
      }
    }
    
    // Check federation access
    if (bundle.scope.federationId) {
      const hasFederationAdmin = this.hasPermission(context, 'export:federation-admin');
      const isFederationMember = context.userFederationId === bundle.scope.federationId;
      const hasExplicitPermission = this.hasPermission(context, `export:federation:${bundle.scope.federationId}`);
      
      if (!hasFederationAdmin && !isFederationMember && !hasExplicitPermission) {
        return false;
      }
    }
    
    // Check category-specific permissions
    if (bundle.category === 'executive-summary' || bundle.category === 'full-operational') {
      if (!this.hasExecutivePermission(context)) {
        return false;
      }
    }
    
    if (bundle.category === 'compliance-pack') {
      const hasComplianceRole = ['auditor', 'executive', 'admin'].includes(context.role);
      const hasCompliancePermission = this.hasPermission(context, 'export:compliance-pack');
      
      if (!hasComplianceRole && !hasCompliancePermission) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Create audit entry
   * 
   * Creates a comprehensive audit record of a policy decision.
   */
  createAuditEntry(
    query: ExportQuery,
    context: ExportPolicyContext,
    decision: ExportPolicyDecision
  ): ExportPolicyAudit {
    return {
      auditId: `export-audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
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
  
  // ========================================================================
  // HELPER METHODS
  // ========================================================================
  
  /**
   * Check if context has a specific permission
   */
  private hasPermission(context: ExportPolicyContext, permission: string): boolean {
    return context.permissions.includes(permission);
  }
  
  /**
   * Check if context has executive permissions
   */
  private hasExecutivePermission(context: ExportPolicyContext): boolean {
    return (
      context.role === 'executive' ||
      context.role === 'admin' ||
      this.hasPermission(context, 'export:executive-view')
    );
  }
}
