/**
 * Phase 51: Continuous Integrity Monitor - Policy Engine
 * 
 * Enforces tenant isolation and permissions for monitoring operations.
 */

import type {
  MonitorCheck,
  MonitorPolicyContext,
  MonitorPolicyDecision,
  MonitorCategory,
  MonitorLogEntry,
} from './monitorTypes';

// ============================================================================
// MONITOR POLICY ENGINE
// ============================================================================

export class MonitorPolicyEngine {
  private tenantId: string;
  private policyLog: MonitorLogEntry[] = [];

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // ==========================================================================
  // AUTHORIZATION
  // ==========================================================================

  /**
   * Authorize monitoring check
   */
  public authorizeCheck(
    check: MonitorCheck,
    policyContext: MonitorPolicyContext
  ): MonitorPolicyDecision {
    // Validate tenant isolation
    const tenantCheck = this.validateTenantIsolation(check, policyContext);
    if (!tenantCheck.allowed) {
      return this.logAndReturnDecision('deny', tenantCheck.reason, check, policyContext);
    }

    // Validate federation rules
    const federationCheck = this.validateFederationRules(check, policyContext);
    if (!federationCheck.allowed) {
      return this.logAndReturnDecision('deny', federationCheck.reason, check, policyContext);
    }

    // Validate scope permissions
    const scopeCheck = this.validateScopePermissions(check, policyContext);
    if (!scopeCheck.allowed) {
      return this.logAndReturnDecision('deny', scopeCheck.reason, check, policyContext);
    }

    // Validate monitor permission
    const monitorCheck = this.validateMonitorPermission(check, policyContext);
    if (!monitorCheck.allowed) {
      return this.logAndReturnDecision('deny', monitorCheck.reason, check, policyContext);
    }

    // Validate category permissions
    const categoryCheck = this.validateCategoryPermissions(check, policyContext);
    if (!categoryCheck.allowed && categoryCheck.allowedCategories) {
      return this.logAndReturnDecision(
        'partial',
        'Partial access granted',
        check,
        policyContext,
        categoryCheck.allowedCategories
      );
    }

    return this.logAndReturnDecision('allow', 'All checks passed', check, policyContext);
  }

  // ==========================================================================
  // VALIDATION METHODS
  // ==========================================================================

  /**
   * Validate tenant isolation
   */
  private validateTenantIsolation(
    check: MonitorCheck,
    policyContext: MonitorPolicyContext
  ): { allowed: boolean; reason: string } {
    // Ensure check scope matches tenant
    if (check.scope.tenantId !== policyContext.tenantId) {
      return {
        allowed: false,
        reason: 'Check tenant does not match policy context tenant',
      };
    }

    // Ensure engine tenant matches
    if (check.scope.tenantId !== this.tenantId) {
      return {
        allowed: false,
        reason: 'Check tenant does not match engine tenant',
      };
    }

    return { allowed: true, reason: 'Tenant isolation validated' };
  }

  /**
   * Validate federation rules
   */
  private validateFederationRules(
    check: MonitorCheck,
    policyContext: MonitorPolicyContext
  ): { allowed: boolean; reason: string } {
    // Check if cross-tenant monitoring is requested
    const isCrossTenant = policyContext.federationTenants &&
                          policyContext.federationTenants.length > 0;

    if (isCrossTenant) {
      // User must have federated monitor permission
      if (!policyContext.userPermissions.includes('monitor.federated')) {
        return {
          allowed: false,
          reason: 'User does not have permission: monitor.federated',
        };
      }
    }

    return { allowed: true, reason: 'Federation rules validated' };
  }

  /**
   * Validate scope permissions
   */
  private validateScopePermissions(
    check: MonitorCheck,
    policyContext: MonitorPolicyContext
  ): { allowed: boolean; reason: string } {
    // Facility-scoped monitoring
    if (check.scope.facilityId) {
      if (!policyContext.userPermissions.includes('facility.monitor')) {
        return {
          allowed: false,
          reason: 'User does not have permission: facility.monitor',
        };
      }
    }

    // Room-scoped monitoring
    if (check.scope.roomId) {
      if (!policyContext.userPermissions.includes('room.monitor')) {
        return {
          allowed: false,
          reason: 'User does not have permission: room.monitor',
        };
      }
    }

    return { allowed: true, reason: 'Scope permissions validated' };
  }

  /**
   * Validate monitor permission
   */
  private validateMonitorPermission(
    check: MonitorCheck,
    policyContext: MonitorPolicyContext
  ): { allowed: boolean; reason: string } {
    // User must have basic monitor permission
    if (!policyContext.userPermissions.includes('monitor.run')) {
      return {
        allowed: false,
        reason: 'User does not have permission: monitor.run',
      };
    }

    // Check type specific permissions
    const checkTypePermission = `monitor.${check.checkType}`;
    if (!policyContext.userPermissions.includes(checkTypePermission)) {
      return {
        allowed: false,
        reason: `User does not have permission: ${checkTypePermission}`,
      };
    }

    return { allowed: true, reason: 'Monitor permission validated' };
  }

  /**
   * Validate category permissions
   */
  private validateCategoryPermissions(
    check: MonitorCheck,
    policyContext: MonitorPolicyContext
  ): { allowed: boolean; reason: string; allowedCategories?: MonitorCategory[] } {
    // If no categories specified, check all
    const categories = check.categories || [
      'governance-drift',
      'governance-lineage-breakage',
      'workflow-sop-drift',
      'documentation-completeness-drift',
      'fabric-link-breakage',
      'cross-engine-metadata-mismatch',
      'health-drift',
      'analytics-pattern-drift',
      'compliance-pack-drift',
    ];

    const allowedCategories: MonitorCategory[] = [];
    const deniedCategories: MonitorCategory[] = [];

    for (const category of categories) {
      const categoryPermission = `monitor.${category}`;
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
        reason: 'User does not have permission for any monitoring categories',
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
    check: MonitorCheck,
    policyContext: MonitorPolicyContext,
    allowedCategories?: MonitorCategory[]
  ): MonitorPolicyDecision {
    const logEntry: MonitorLogEntry = {
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
  public getPolicyLog(): MonitorLogEntry[] {
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
