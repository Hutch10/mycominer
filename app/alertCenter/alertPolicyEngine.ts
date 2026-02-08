/**
 * Phase 52: Unified Alerting & Notification Center — Alert Policy Engine
 * 
 * Enforces tenant isolation, federation rules, and engine-level permissions.
 * Validates alert visibility and reference visibility.
 */

import type {
  Alert,
  AlertQuery,
  AlertCategory,
  AlertSource,
  AlertPolicyContext,
  AlertPolicyDecision,
  AlertLogEntry,
  AlertPolicyStatistics,
} from './alertTypes';

// ============================================================================
// ALERT POLICY ENGINE
// ============================================================================

export class AlertPolicyEngine {
  private policyLog: AlertLogEntry[] = [];

  /**
   * Authorize an alert query.
   */
  authorizeQuery(query: AlertQuery, policyContext: AlertPolicyContext): AlertPolicyDecision {
    // Validate tenant isolation
    if (!this.validateTenantIsolation(query, policyContext)) {
      return this.logAndReturnDecision(
        false,
        'Tenant isolation violation',
        query.queryId,
        undefined,
        policyContext
      );
    }

    // Validate federation rules
    if (!this.validateFederationRules(query, policyContext)) {
      return this.logAndReturnDecision(
        false,
        'Federation rules violation',
        query.queryId,
        undefined,
        policyContext
      );
    }

    // Validate query permissions
    if (!this.validateQueryPermission(query, policyContext)) {
      return this.logAndReturnDecision(
        false,
        'Insufficient permissions for query',
        query.queryId,
        undefined,
        policyContext
      );
    }

    // Validate category permissions
    const deniedCategories = this.validateCategoryPermissions(query, policyContext);
    if (deniedCategories.length > 0) {
      return this.logAndReturnDecision(
        true, // Partially authorized
        `Some categories denied: ${deniedCategories.join(', ')}`,
        query.queryId,
        undefined,
        policyContext,
        deniedCategories
      );
    }

    // Validate source permissions
    const deniedSources = this.validateSourcePermissions(query, policyContext);
    if (deniedSources.length > 0) {
      return this.logAndReturnDecision(
        true, // Partially authorized
        `Some sources denied: ${deniedSources.join(', ')}`,
        query.queryId,
        undefined,
        policyContext,
        [],
        deniedSources
      );
    }

    return this.logAndReturnDecision(true, 'Authorized', query.queryId, undefined, policyContext);
  }

  /**
   * Authorize visibility of a specific alert.
   */
  authorizeAlert(alert: Alert, policyContext: AlertPolicyContext): AlertPolicyDecision {
    // Validate tenant isolation
    if (alert.scope.tenantId !== policyContext.tenantId) {
      return this.logAndReturnDecision(
        false,
        'Alert belongs to different tenant',
        undefined,
        alert.alertId,
        policyContext
      );
    }

    // Validate category permission
    const categoryPermission = `alert.${alert.category}`;
    if (!policyContext.userPermissions.includes(categoryPermission) &&
        !policyContext.userPermissions.includes('alert.view-all')) {
      return this.logAndReturnDecision(
        false,
        `No permission for category ${alert.category}`,
        undefined,
        alert.alertId,
        policyContext
      );
    }

    // Validate source permission
    const sourcePermission = `alert.source.${alert.source}`;
    if (!policyContext.userPermissions.includes(sourcePermission) &&
        !policyContext.userPermissions.includes('alert.view-all')) {
      return this.logAndReturnDecision(
        false,
        `No permission for source ${alert.source}`,
        undefined,
        alert.alertId,
        policyContext
      );
    }

    // Validate facility scope (if alert is facility-specific)
    if (alert.scope.facilityId && policyContext.facilityId) {
      if (alert.scope.facilityId !== policyContext.facilityId) {
        return this.logAndReturnDecision(
          false,
          'Alert belongs to different facility',
          undefined,
          alert.alertId,
          policyContext
        );
      }
    }

    return this.logAndReturnDecision(true, 'Authorized', undefined, alert.alertId, policyContext);
  }

  // ==========================================================================
  // VALIDATION METHODS
  // ==========================================================================

  /**
   * Validate tenant isolation.
   */
  private validateTenantIsolation(query: AlertQuery, policyContext: AlertPolicyContext): boolean {
    return query.scope.tenantId === policyContext.tenantId;
  }

  /**
   * Validate federation rules.
   */
  private validateFederationRules(query: AlertQuery, policyContext: AlertPolicyContext): boolean {
    // If query involves federated tenants, check permission
    if (policyContext.federatedTenants && policyContext.federatedTenants.length > 0) {
      return policyContext.userPermissions.includes('alert.federated');
    }
    return true;
  }

  /**
   * Validate query permission.
   */
  private validateQueryPermission(query: AlertQuery, policyContext: AlertPolicyContext): boolean {
    // Check for global alert.query permission
    if (policyContext.userPermissions.includes('alert.query')) {
      return true;
    }

    // Check for specific query type permissions
    if (query.scope.facilityId && policyContext.userPermissions.includes('facility.alert.query')) {
      return true;
    }

    return false;
  }

  /**
   * Validate category permissions and return denied categories.
   */
  private validateCategoryPermissions(
    query: AlertQuery,
    policyContext: AlertPolicyContext
  ): AlertCategory[] {
    if (!query.categories || query.categories.length === 0) {
      return [];
    }

    // If user has alert.view-all, allow all categories
    if (policyContext.userPermissions.includes('alert.view-all')) {
      return [];
    }

    const denied: AlertCategory[] = [];
    for (const category of query.categories) {
      const permission = `alert.${category}`;
      if (!policyContext.userPermissions.includes(permission)) {
        denied.push(category);
      }
    }

    return denied;
  }

  /**
   * Validate source permissions and return denied sources.
   */
  private validateSourcePermissions(
    query: AlertQuery,
    policyContext: AlertPolicyContext
  ): AlertSource[] {
    if (!query.sources || query.sources.length === 0) {
      return [];
    }

    // If user has alert.view-all, allow all sources
    if (policyContext.userPermissions.includes('alert.view-all')) {
      return [];
    }

    const denied: AlertSource[] = [];
    for (const source of query.sources) {
      const permission = `alert.source.${source}`;
      if (!policyContext.userPermissions.includes(permission)) {
        denied.push(source);
      }
    }

    return denied;
  }

  // ==========================================================================
  // LOGGING & STATISTICS
  // ==========================================================================

  /**
   * Log policy decision and return result.
   */
  private logAndReturnDecision(
    authorized: boolean,
    reason: string,
    queryId?: string,
    alertId?: string,
    policyContext?: AlertPolicyContext,
    deniedCategories?: AlertCategory[],
    deniedSources?: AlertSource[]
  ): AlertPolicyDecision {
    if (policyContext) {
      const logEntry: AlertLogEntry = {
        entryId: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        entryType: 'policy-decision',
        timestamp: new Date().toISOString(),
        tenantId: policyContext.tenantId,
        facilityId: policyContext.facilityId,
        performedBy: policyContext.performedBy,
        success: authorized,
        details: {
          decision: authorized ? 'authorized' : 'denied',
          reason,
          queryId,
          alertId,
        },
      };

      this.policyLog.push(logEntry);
    }

    return {
      authorized,
      reason: authorized ? undefined : reason,
      deniedCategories,
      deniedSources,
    };
  }

  /**
   * Get policy log.
   */
  getPolicyLog(): AlertLogEntry[] {
    return this.policyLog;
  }

  /**
   * Get policy statistics.
   */
  getPolicyStatistics(): AlertPolicyStatistics {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const totalChecks = this.policyLog.length;
    const authorizedChecks = this.policyLog.filter(
      entry => entry.entryType === 'policy-decision' && entry.details.decision === 'authorized'
    ).length;
    const deniedChecks = totalChecks - authorizedChecks;

    const checksLast24Hours = this.policyLog.filter(
      entry => new Date(entry.timestamp) >= twentyFourHoursAgo
    ).length;

    return {
      totalChecks,
      authorizedChecks,
      deniedChecks,
      checksLast24Hours,
    };
  }
}
