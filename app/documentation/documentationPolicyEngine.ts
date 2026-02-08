/**
 * Phase 47: Autonomous Documentation Engine - Policy Engine
 * 
 * Enforces tenant isolation, federation rules, and visibility constraints.
 */

import {
  DocumentationPolicy,
  DocumentationPolicyConditions,
  DocumentationPolicyEvaluation,
  DocumentationQuery,
  DocumentationScopeContext,
  DocumentationReference
} from './documentationTypes';

// ============================================================================
// DOCUMENTATION POLICY ENGINE
// ============================================================================

export class DocumentationPolicyEngine {
  private policies: Map<string, DocumentationPolicy> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies(): void {
    const defaultPolicies: DocumentationPolicy[] = [
      {
        id: 'policy-tenant-isolation',
        name: 'Tenant Isolation Policy',
        description: 'Enforce strict tenant boundaries for documentation',
        effect: 'deny',
        conditions: {
          scope: 'tenant',
          requiresFederation: false
        },
        created: new Date().toISOString(),
        createdBy: 'system'
      },
      {
        id: 'policy-facility-scope',
        name: 'Facility Scope Policy',
        description: 'Allow documentation within facility boundaries',
        effect: 'allow',
        conditions: {
          scope: 'facility'
        },
        created: new Date().toISOString(),
        createdBy: 'system'
      },
      {
        id: 'policy-global-read',
        name: 'Global Read Policy',
        description: 'Allow global-scoped documentation for authorized users',
        effect: 'allow',
        conditions: {
          scope: 'global',
          requiredRole: 'admin'
        },
        created: new Date().toISOString(),
        createdBy: 'system'
      },
      {
        id: 'policy-compliance-docs',
        name: 'Compliance Documentation Policy',
        description: 'Restrict compliance documentation to authorized roles',
        effect: 'deny',
        conditions: {
          category: 'compliance-documentation',
          requiredRole: 'auditor'
        },
        created: new Date().toISOString(),
        createdBy: 'system'
      }
    ];

    defaultPolicies.forEach(policy => {
      this.policies.set(policy.id, policy);
    });
  }

  /**
   * Evaluate documentation query against policies
   */
  evaluateQuery(
    query: DocumentationQuery,
    performedBy: string,
    userRoles: string[] = []
  ): DocumentationPolicyEvaluation[] {
    const evaluations: DocumentationPolicyEvaluation[] = [];
    const now = new Date().toISOString();

    for (const policy of this.policies.values()) {
      const evaluation = this.evaluatePolicy(policy, query, performedBy, userRoles, now);
      if (evaluation) {
        evaluations.push(evaluation);
      }
    }

    return evaluations;
  }

  /**
   * Evaluate reference visibility
   */
  evaluateReferenceVisibility(
    reference: DocumentationReference,
    queryScope: DocumentationScopeContext,
    performedBy: string
  ): DocumentationPolicyEvaluation[] {
    const evaluations: DocumentationPolicyEvaluation[] = [];
    const now = new Date().toISOString();

    // Check if reference is within query scope
    if (reference.scope.tenantId !== queryScope.tenantId) {
      evaluations.push({
        policyId: 'policy-tenant-isolation',
        policyName: 'Tenant Isolation Policy',
        effect: 'deny',
        decision: 'failed',
        reason: 'Reference crosses tenant boundary',
        evaluatedAt: now
      });
    }

    // Check facility scope
    if (queryScope.facilityId && reference.scope.facilityId !== queryScope.facilityId) {
      evaluations.push({
        policyId: 'policy-facility-scope',
        policyName: 'Facility Scope Policy',
        effect: 'deny',
        decision: 'failed',
        reason: 'Reference outside facility scope',
        evaluatedAt: now
      });
    }

    // Check visibility
    if (reference.visibility === 'private' && queryScope.scope !== 'asset') {
      evaluations.push({
        policyId: 'policy-visibility',
        policyName: 'Visibility Policy',
        effect: 'deny',
        decision: 'failed',
        reason: 'Reference visibility is private',
        evaluatedAt: now
      });
    }

    return evaluations;
  }

  /**
   * Evaluate scope access
   */
  evaluateScopeAccess(
    requestedScope: DocumentationScopeContext,
    performedBy: string,
    userRoles: string[] = []
  ): DocumentationPolicyEvaluation[] {
    const evaluations: DocumentationPolicyEvaluation[] = [];
    const now = new Date().toISOString();

    // Global scope requires admin role
    if (requestedScope.scope === 'global' && !userRoles.includes('admin')) {
      evaluations.push({
        policyId: 'policy-global-read',
        policyName: 'Global Read Policy',
        effect: 'deny',
        decision: 'failed',
        reason: 'Global scope requires admin role',
        evaluatedAt: now
      });
    }

    // All other scopes allowed
    return evaluations;
  }

  /**
   * Evaluate single policy
   */
  private evaluatePolicy(
    policy: DocumentationPolicy,
    query: DocumentationQuery,
    performedBy: string,
    userRoles: string[],
    timestamp: string
  ): DocumentationPolicyEvaluation | null {
    const conditions = policy.conditions;

    // Check scope
    if (conditions.scope && query.scope.scope !== conditions.scope) {
      return null; // Policy doesn't apply
    }

    // Check tenant
    if (conditions.tenantId && query.scope.tenantId !== conditions.tenantId) {
      return null; // Policy doesn't apply
    }

    // Check facility
    if (conditions.facilityId && query.scope.facilityId !== conditions.facilityId) {
      return null; // Policy doesn't apply
    }

    // Check category
    if (conditions.category && query.queryType.includes(conditions.category)) {
      // Check required role
      if (conditions.requiredRole && !userRoles.includes(conditions.requiredRole)) {
        return {
          policyId: policy.id,
          policyName: policy.name,
          effect: policy.effect,
          decision: 'failed',
          reason: `Required role ${conditions.requiredRole} not satisfied`,
          evaluatedAt: timestamp
        };
      }
    }

    // Check engine type
    if (conditions.engineType && query.filters.engineType !== conditions.engineType) {
      return null; // Policy doesn't apply
    }

    // Check asset type
    if (conditions.assetType && query.filters.assetType !== conditions.assetType) {
      return null; // Policy doesn't apply
    }

    // Policy applies and passes
    return {
      policyId: policy.id,
      policyName: policy.name,
      effect: policy.effect,
      decision: 'passed',
      reason: 'All conditions satisfied',
      evaluatedAt: timestamp
    };
  }

  /**
   * Check if all evaluations passed
   */
  allEvaluationsPassed(evaluations: DocumentationPolicyEvaluation[]): boolean {
    return evaluations.every(e => e.decision === 'passed' || e.effect === 'allow');
  }

  /**
   * Get failed evaluations
   */
  getFailedEvaluations(evaluations: DocumentationPolicyEvaluation[]): DocumentationPolicyEvaluation[] {
    return evaluations.filter(e => e.decision === 'failed' && e.effect === 'deny');
  }

  // ============================================================================
  // POLICY MANAGEMENT
  // ============================================================================

  addPolicy(policy: DocumentationPolicy): void {
    this.policies.set(policy.id, policy);
  }

  getPolicy(id: string): DocumentationPolicy | undefined {
    return this.policies.get(id);
  }

  getAllPolicies(): DocumentationPolicy[] {
    return Array.from(this.policies.values());
  }

  removePolicy(id: string): boolean {
    return this.policies.delete(id);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createDocumentationPolicyEngine(): DocumentationPolicyEngine {
  return new DocumentationPolicyEngine();
}

export function allEvaluationsPassed(evaluations: DocumentationPolicyEvaluation[]): boolean {
  return evaluations.every(e => e.decision === 'passed' || e.effect === 'allow');
}
