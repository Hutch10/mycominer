/**
 * Phase 50: Autonomous System Auditor - Policy Engine
 * 
 * Enforces tenant isolation and permissions for audit operations.
 * Validates rule visibility and reference visibility.
 */

import type {
  AuditQuery,
  AuditPolicyContext,
  AuditPolicyDecision,
  AuditCategory,
  AuditLogEntry,
} from './auditorTypes';

// ============================================================================
// AUDITOR POLICY ENGINE
// ============================================================================

export class AuditorPolicyEngine {
  private tenantId: string;
  private policyLog: AuditLogEntry[] = [];

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // ==========================================================================
  // AUTHORIZATION
  // ==========================================================================

  /**
   * Authorize audit
   */
  public authorizeAudit(
    query: AuditQuery,
    policyContext: AuditPolicyContext
  ): AuditPolicyDecision {
    // Validate tenant isolation
    const tenantCheck = this.validateTenantIsolation(query, policyContext);
    if (!tenantCheck.allowed) {
      return this.logAndReturnDecision('deny', tenantCheck.reason, query, policyContext);
    }

    // Validate federation rules
    const federationCheck = this.validateFederationRules(query, policyContext);
    if (!federationCheck.allowed) {
      return this.logAndReturnDecision('deny', federationCheck.reason, query, policyContext);
    }

    // Validate scope permissions
    const scopeCheck = this.validateScopePermissions(query, policyContext);
    if (!scopeCheck.allowed) {
      return this.logAndReturnDecision('deny', scopeCheck.reason, query, policyContext);
    }

    // Validate audit permission
    const auditCheck = this.validateAuditPermission(query, policyContext);
    if (!auditCheck.allowed) {
      return this.logAndReturnDecision('deny', auditCheck.reason, query, policyContext);
    }

    // Validate category permissions
    const categoryCheck = this.validateCategoryPermissions(query, policyContext);
    if (!categoryCheck.allowed && categoryCheck.allowedCategories) {
      return this.logAndReturnDecision(
        'partial',
        'Partial access granted',
        query,
        policyContext,
        categoryCheck.allowedCategories
      );
    }

    return this.logAndReturnDecision('allow', 'All checks passed', query, policyContext);
  }

  // ==========================================================================
  // VALIDATION METHODS
  // ==========================================================================

  /**
   * Validate tenant isolation
   */
  private validateTenantIsolation(
    query: AuditQuery,
    policyContext: AuditPolicyContext
  ): { allowed: boolean; reason: string } {
    // Ensure query scope matches tenant
    if (query.scope.tenantId !== policyContext.tenantId) {
      return {
        allowed: false,
        reason: 'Query tenant does not match policy context tenant',
      };
    }

    // Ensure engine tenant matches
    if (query.scope.tenantId !== this.tenantId) {
      return {
        allowed: false,
        reason: 'Query tenant does not match engine tenant',
      };
    }

    return { allowed: true, reason: 'Tenant isolation validated' };
  }

  /**
   * Validate federation rules
   */
  private validateFederationRules(
    query: AuditQuery,
    policyContext: AuditPolicyContext
  ): { allowed: boolean; reason: string } {
    // Check if cross-tenant audit is requested
    const isCrossTenant = policyContext.federationTenants &&
                          policyContext.federationTenants.length > 0;

    if (isCrossTenant) {
      // User must have federated audit permission
      if (!policyContext.userPermissions.includes('audit.federated')) {
        return {
          allowed: false,
          reason: 'User does not have permission: audit.federated',
        };
      }
    }

    return { allowed: true, reason: 'Federation rules validated' };
  }

  /**
   * Validate scope permissions
   */
  private validateScopePermissions(
    query: AuditQuery,
    policyContext: AuditPolicyContext
  ): { allowed: boolean; reason: string } {
    // Facility-scoped audit
    if (query.scope.facilityId) {
      if (!policyContext.userPermissions.includes('facility.audit')) {
        return {
          allowed: false,
          reason: 'User does not have permission: facility.audit',
        };
      }
    }

    // Room-scoped audit
    if (query.scope.roomId) {
      if (!policyContext.userPermissions.includes('room.audit')) {
        return {
          allowed: false,
          reason: 'User does not have permission: room.audit',
        };
      }
    }

    return { allowed: true, reason: 'Scope permissions validated' };
  }

  /**
   * Validate audit permission
   */
  private validateAuditPermission(
    query: AuditQuery,
    policyContext: AuditPolicyContext
  ): { allowed: boolean; reason: string } {
    // User must have basic audit permission
    if (!policyContext.userPermissions.includes('audit.run')) {
      return {
        allowed: false,
        reason: 'User does not have permission: audit.run',
      };
    }

    // Check query type specific permissions
    const queryTypePermission = `audit.${query.queryType}`;
    if (!policyContext.userPermissions.includes(queryTypePermission)) {
      return {
        allowed: false,
        reason: `User does not have permission: ${queryTypePermission}`,
      };
    }

    return { allowed: true, reason: 'Audit permission validated' };
  }

  /**
   * Validate category permissions
   */
  private validateCategoryPermissions(
    query: AuditQuery,
    policyContext: AuditPolicyContext
  ): { allowed: boolean; reason: string; allowedCategories?: AuditCategory[] } {
    // If no categories specified, check all
    const categories = query.categories || [
      'workflow-sop-alignment',
      'governance-correctness',
      'governance-lineage',
      'health-drift-validation',
      'analytics-consistency',
      'documentation-completeness',
      'fabric-integrity',
      'cross-engine-consistency',
      'compliance-pack-validation',
    ];

    const allowedCategories: AuditCategory[] = [];
    const deniedCategories: AuditCategory[] = [];

    for (const category of categories) {
      const categoryPermission = `audit.${category}`;
      if (policyContext.userPermissions.includes(categoryPermission)) {
        allowedCategories.push(category);
      } else {
        deniedCategories.push(category);
      }
    }

    // If no categories allowed, deny
    if (allowedCategories.length === 0) {
      return {
        allowed: false,
        reason: 'User does not have permission for any audit categories',
      };
    }

    // If some categories denied, partial access
    if (deniedCategories.length > 0) {
      return {
        allowed: false,
        reason: `Partial access: ${allowedCategories.length}/${categories.length} categories allowed`,
        allowedCategories,
      };
    }

    return { allowed: true, reason: 'Category permissions validated' };
  }

  // ==========================================================================
  // LOGGING
  // ==========================================================================

  /**
   * Log and return decision
   */
  private logAndReturnDecision(
    decision: 'allow' | 'deny' | 'partial',
    reason: string,
    query: AuditQuery,
    policyContext: AuditPolicyContext,
    allowedCategories?: AuditCategory[]
  ): AuditPolicyDecision {
    const logEntry: AuditLogEntry = {
      entryId: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'policy-decision',
      timestamp: new Date().toISOString(),
      tenantId: policyContext.tenantId,
      facilityId: policyContext.facilityId,
      policyDecision: { decision, reason },
      performedBy: policyContext.performedBy,
      success: decision === 'allow',
    };

    this.policyLog.push(logEntry);

    // Keep only last 1000 entries
    if (this.policyLog.length > 1000) {
      this.policyLog = this.policyLog.slice(-1000);
    }

    return {
      decision,
      reason,
      allowedCategories,
      deniedCategories: undefined,
    };
  }

  /**
   * Get policy log
   */
  public getPolicyLog(): AuditLogEntry[] {
    return [...this.policyLog];
  }

  /**
   * Get policy statistics
   */
  public getPolicyStatistics(): {
    totalDecisions: number;
    allowed: number;
    denied: number;
    partial: number;
  } {
    const allowed = this.policyLog.filter(e =>
      e.policyDecision?.decision === 'allow'
    ).length;
    const denied = this.policyLog.filter(e =>
      e.policyDecision?.decision === 'deny'
    ).length;
    const partial = this.policyLog.filter(e =>
      e.policyDecision?.decision === 'partial'
    ).length;

    return {
      totalDecisions: this.policyLog.length,
      allowed,
      denied,
      partial,
    };
  }
}
