/**
 * Phase 62: Federation Marketplace - Policy Engine
 * 
 * Enforces privacy, tenant isolation, and permission controls for
 * cross-federation operations.
 */

import type {
  FederationContext,
  FederationPolicyDecision,
  Federation,
  FederationDataCategory,
  FederationQueryType,
} from './federationTypes';

/**
 * Policy engine for federation operations
 * Ensures strict tenant isolation and privacy compliance
 */
export class FederationPolicyEngine {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Evaluate if a query operation is allowed
   */
  evaluateQueryPolicy(
    queryType: FederationQueryType,
    federationId: string | undefined,
    requestedTenantId: string | undefined,
    context: FederationContext
  ): FederationPolicyDecision {
    const required: string[] = [];
    const missing: string[] = [];
    const violations: string[] = [];

    // Base federation access permission
    required.push('federation:view');

    // Query-specific permissions
    switch (queryType) {
      case 'list-federations':
        required.push('federation:list');
        break;

      case 'get-federation-metrics':
        required.push('federation:view-metrics');
        if (federationId) {
          required.push(`federation:view:${federationId}`);
        }
        break;

      case 'get-tenant-benchmarks':
        required.push('federation:view-benchmarks');
        // Can only view own tenant benchmarks unless admin
        if (requestedTenantId && requestedTenantId !== context.tenantId) {
          required.push('federation:view-all-tenants');
        }
        break;

      case 'get-federation-insights':
        required.push('federation:view-insights');
        break;

      case 'compare-tenants':
        required.push('federation:compare');
        required.push('federation:anonymized-view');
        break;

      case 'trend-analysis':
        required.push('federation:view-trends');
        break;

      case 'cross-federation-compare':
        required.push('federation:cross-compare');
        required.push('federation:view-multiple');
        break;
    }

    // Check which permissions are missing
    for (const perm of required) {
      if (!context.permissions.includes(perm)) {
        missing.push(perm);
      }
    }

    // Tenant isolation checks
    if (requestedTenantId && requestedTenantId !== context.tenantId) {
      if (!context.permissions.includes('federation:view-all-tenants')) {
        violations.push(`Cannot access data for tenant ${requestedTenantId} without federation:view-all-tenants permission`);
      }
    }

    // Federation membership check
    if (federationId && context.tenantId) {
      // In real implementation, check if context.tenantId is in federation
      // For now, assume valid if no violations so far
    }

    const allowed = missing.length === 0 && violations.length === 0;

    return {
      allowed,
      reason: allowed
        ? `Query ${queryType} authorized`
        : `Missing permissions: ${missing.join(', ')}. Violations: ${violations.join(', ')}`,
      requiredPermissions: required,
      missingPermissions: missing,
      policyViolations: violations,
      timestamp: new Date(),
    };
  }

  /**
   * Evaluate if data sharing is allowed for a category
   */
  evaluateDataSharingPolicy(
    category: FederationDataCategory,
    federation: Federation,
    context: FederationContext
  ): FederationPolicyDecision {
    const required: string[] = ['federation:share-data'];
    const missing: string[] = [];
    const violations: string[] = [];

    // Check if category is allowed in federation
    if (!federation.sharingAgreement.allowedCategories.includes(category)) {
      violations.push(`Category ${category} not allowed in federation ${federation.federationId}`);
    }

    // Check if tenant is part of federation
    if (context.tenantId && !federation.tenantIds.includes(context.tenantId)) {
      violations.push(`Tenant ${context.tenantId} not part of federation ${federation.federationId}`);
    }

    // Check federation status
    if (federation.status !== 'active') {
      violations.push(`Federation ${federation.federationId} is ${federation.status}, not active`);
    }

    // Check permissions
    required.push(`federation:share:${category}`);
    for (const perm of required) {
      if (!context.permissions.includes(perm)) {
        missing.push(perm);
      }
    }

    const allowed = missing.length === 0 && violations.length === 0;

    return {
      allowed,
      reason: allowed
        ? `Data sharing for ${category} authorized`
        : `Violations: ${violations.join(', ')}`,
      requiredPermissions: required,
      missingPermissions: missing,
      policyViolations: violations,
      timestamp: new Date(),
    };
  }

  /**
   * Evaluate if benchmark viewing is allowed
   */
  evaluateBenchmarkViewPolicy(
    tenantId: string,
    federationId: string,
    context: FederationContext
  ): FederationPolicyDecision {
    const required: string[] = ['federation:view-benchmarks'];
    const missing: string[] = [];
    const violations: string[] = [];

    // Can view own benchmarks
    const isOwnTenant = tenantId === context.tenantId;

    if (!isOwnTenant) {
      required.push('federation:view-all-benchmarks');
      violations.push(`Can only view own tenant benchmarks without federation:view-all-benchmarks`);
    }

    // Check permissions
    for (const perm of required) {
      if (!context.permissions.includes(perm)) {
        missing.push(perm);
      }
    }

    const allowed = missing.length === 0 && violations.length === 0;

    return {
      allowed,
      reason: allowed
        ? `Benchmark viewing authorized for tenant ${tenantId}`
        : `Not authorized: ${violations.join(', ')}`,
      requiredPermissions: required,
      missingPermissions: missing,
      policyViolations: violations,
      timestamp: new Date(),
    };
  }

  /**
   * Check if anonymization requirements are met
   */
  validateAnonymizationRequirements(
    tenantCount: number,
    privacyLevel: 'strict' | 'moderate' | 'open',
    aggregationThreshold: number
  ): FederationPolicyDecision {
    const violations: string[] = [];

    // Minimum threshold check
    if (tenantCount < aggregationThreshold) {
      violations.push(
        `Insufficient tenants (${tenantCount}) to meet aggregation threshold (${aggregationThreshold})`
      );
    }

    // Privacy level specific checks
    if (privacyLevel === 'strict' && tenantCount < 5) {
      violations.push(`Strict privacy level requires at least 5 tenants, got ${tenantCount}`);
    }

    if (privacyLevel === 'moderate' && tenantCount < 3) {
      violations.push(`Moderate privacy level requires at least 3 tenants, got ${tenantCount}`);
    }

    const allowed = violations.length === 0;

    return {
      allowed,
      reason: allowed
        ? `Anonymization requirements met`
        : `Anonymization violations: ${violations.join(', ')}`,
      requiredPermissions: [],
      missingPermissions: [],
      policyViolations: violations,
      timestamp: new Date(),
    };
  }

  /**
   * Evaluate cross-federation comparison policy
   */
  evaluateCrossFederationPolicy(
    federationIds: string[],
    context: FederationContext
  ): FederationPolicyDecision {
    const required: string[] = [
      'federation:cross-compare',
      'federation:view-multiple',
    ];
    const missing: string[] = [];
    const violations: string[] = [];

    // Limit number of federations that can be compared
    if (federationIds.length > 5) {
      violations.push(`Cannot compare more than 5 federations at once, requested ${federationIds.length}`);
    }

    // Check permissions
    for (const perm of required) {
      if (!context.permissions.includes(perm)) {
        missing.push(perm);
      }
    }

    const allowed = missing.length === 0 && violations.length === 0;

    return {
      allowed,
      reason: allowed
        ? `Cross-federation comparison authorized`
        : `Not authorized: ${violations.join(', ')}`,
      requiredPermissions: required,
      missingPermissions: missing,
      policyViolations: violations,
      timestamp: new Date(),
    };
  }

  /**
   * Create standard permission sets for federation roles
   */
  static getStandardPermissions(role: 'viewer' | 'participant' | 'admin' | 'auditor'): string[] {
    const basePermissions = ['federation:view'];

    switch (role) {
      case 'viewer':
        return [
          ...basePermissions,
          'federation:list',
          'federation:view-metrics',
        ];

      case 'participant':
        return [
          ...basePermissions,
          'federation:list',
          'federation:view-metrics',
          'federation:view-benchmarks',
          'federation:view-insights',
          'federation:view-trends',
          'federation:share-data',
        ];

      case 'admin':
        return [
          ...basePermissions,
          'federation:list',
          'federation:view-metrics',
          'federation:view-benchmarks',
          'federation:view-insights',
          'federation:view-trends',
          'federation:view-all-tenants',
          'federation:share-data',
          'federation:compare',
          'federation:anonymized-view',
          'federation:cross-compare',
          'federation:view-multiple',
          'federation:view-all-benchmarks',
        ];

      case 'auditor':
        return [
          ...basePermissions,
          'federation:list',
          'federation:view-metrics',
          'federation:view-benchmarks',
          'federation:view-all-benchmarks',
          'federation:view-all-tenants',
          'federation:anonymized-view',
        ];

      default:
        return basePermissions;
    }
  }

  /**
   * Log policy decision for audit trail
   */
  logPolicyDecision(decision: FederationPolicyDecision, context: FederationContext): void {
    console.log(`[Federation Policy] ${decision.allowed ? 'ALLOWED' : 'DENIED'}`, {
      performer: context.performerId,
      reason: decision.reason,
      timestamp: decision.timestamp,
      violations: decision.policyViolations,
    });
  }
}
