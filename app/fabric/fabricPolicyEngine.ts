/**
 * Phase 46: Multi-Tenant Data Fabric - Fabric Policy Engine
 * 
 * Enforces tenant isolation, federation rules, and cross-engine access constraints.
 * Validates link visibility and scope correctness.
 */

import {
  FabricPolicy,
  FabricPolicyEvaluation,
  FabricNode,
  FabricEdge,
  FabricScopeContext,
  FabricEntityType,
  FabricEdgeType
} from './fabricTypes';

// ============================================================================
// FABRIC POLICY ENGINE CLASS
// ============================================================================

export class FabricPolicyEngine {
  private policies: Map<string, FabricPolicy> = new Map();
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.initializeDefaultPolicies();
  }

  /**
   * Evaluate if a link can be created
   */
  evaluateLinkCreation(
    fromNode: FabricNode,
    toNode: FabricNode,
    edgeType: FabricEdgeType
  ): FabricPolicyEvaluation[] {
    const evaluations: FabricPolicyEvaluation[] = [];

    // Tenant isolation check
    if (fromNode.scope.tenantId !== toNode.scope.tenantId) {
      const federationPolicy = this.policies.get('federation-policy');
      if (federationPolicy) {
        const allowed = fromNode.federationAllowed && toNode.federationAllowed;
        evaluations.push({
          policyId: federationPolicy.id,
          policyName: federationPolicy.name,
          allowed,
          reason: allowed 
            ? 'Cross-tenant link allowed by federation policy'
            : 'Cross-tenant link blocked: federation not allowed',
          timestamp: new Date().toISOString()
        });
        
        if (!allowed) return evaluations;
      }
    }

    // Edge type policy
    const edgePolicy = this.policies.get('edge-type-policy');
    if (edgePolicy) {
      const allowed = edgePolicy.allowedEdgeTypes.includes(edgeType);
      evaluations.push({
        policyId: edgePolicy.id,
        policyName: edgePolicy.name,
        allowed,
        reason: allowed
          ? `Edge type ${edgeType} is allowed`
          : `Edge type ${edgeType} is not allowed`,
        timestamp: new Date().toISOString()
      });
      
      if (!allowed) return evaluations;
    }

    // All checks passed
    evaluations.push({
      policyId: 'link-creation',
      policyName: 'Link Creation Policy',
      allowed: true,
      reason: 'All policy checks passed',
      timestamp: new Date().toISOString()
    });

    return evaluations;
  }

  /**
   * Evaluate if a node can be accessed
   */
  evaluateNodeAccess(
    node: FabricNode,
    requestScope: FabricScopeContext
  ): FabricPolicyEvaluation {
    // Tenant isolation
    if (node.scope.tenantId !== requestScope.tenantId) {
      return {
        policyId: 'tenant-isolation',
        policyName: 'Tenant Isolation Policy',
        allowed: false,
        reason: 'Node belongs to different tenant',
        timestamp: new Date().toISOString()
      };
    }

    // Facility scope check
    if (requestScope.facilityId && node.scope.facilityId !== requestScope.facilityId) {
      if (node.visibility === 'facility' || node.visibility === 'restricted') {
        return {
          policyId: 'facility-scope',
          policyName: 'Facility Scope Policy',
          allowed: false,
          reason: 'Node not visible in requested facility scope',
          timestamp: new Date().toISOString()
        };
      }
    }

    return {
      policyId: 'node-access',
      policyName: 'Node Access Policy',
      allowed: true,
      reason: 'Node access granted',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Evaluate query permissions
   */
  evaluateQuery(requestScope: FabricScopeContext): FabricPolicyEvaluation {
    const queryPolicy = this.policies.get('query-policy');
    
    if (!queryPolicy) {
      return {
        policyId: 'query-execution',
        policyName: 'Query Execution Policy',
        allowed: true,
        reason: 'No query policy defined, allowing by default',
        timestamp: new Date().toISOString()
      };
    }

    return {
      policyId: queryPolicy.id,
      policyName: queryPolicy.name,
      allowed: queryPolicy.active,
      reason: queryPolicy.active ? 'Query allowed' : 'Query policy is inactive',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Add a custom policy
   */
  addPolicy(policy: FabricPolicy): void {
    this.policies.set(policy.id, policy);
  }

  /**
   * Get all policies
   */
  getAllPolicies(): FabricPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Get policy by ID
   */
  getPolicy(policyId: string): FabricPolicy | undefined {
    return this.policies.get(policyId);
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private initializeDefaultPolicies(): void {
    // Tenant isolation policy
    this.policies.set('tenant-isolation', {
      id: 'tenant-isolation',
      name: 'Tenant Isolation Policy',
      scope: 'tenant',
      allowedEntityTypes: [],
      allowedEdgeTypes: [],
      tenantIsolationRequired: true,
      federationAllowed: false,
      crossTenantLinks: false,
      defaultVisibility: 'tenant',
      created: new Date().toISOString(),
      createdBy: 'system',
      active: true
    });

    // Federation policy
    this.policies.set('federation-policy', {
      id: 'federation-policy',
      name: 'Federation Policy',
      scope: 'global',
      allowedEntityTypes: ['knowledge-pack', 'insight', 'marketplace-asset'],
      allowedEdgeTypes: ['references', 'is-related-to'],
      tenantIsolationRequired: false,
      federationAllowed: true,
      crossTenantLinks: true,
      defaultVisibility: 'public',
      created: new Date().toISOString(),
      createdBy: 'system',
      active: true
    });

    // Edge type policy
    this.policies.set('edge-type-policy', {
      id: 'edge-type-policy',
      name: 'Edge Type Policy',
      scope: 'tenant',
      allowedEntityTypes: [],
      allowedEdgeTypes: [
        'derived-from',
        'references',
        'explains',
        'is-related-to',
        'is-sourced-from',
        'contains',
        'uses',
        'produces',
        'affects',
        'triggers'
      ],
      tenantIsolationRequired: true,
      federationAllowed: false,
      crossTenantLinks: false,
      defaultVisibility: 'tenant',
      created: new Date().toISOString(),
      createdBy: 'system',
      active: true
    });

    // Query policy
    this.policies.set('query-policy', {
      id: 'query-policy',
      name: 'Query Execution Policy',
      scope: 'tenant',
      allowedEntityTypes: [],
      allowedEdgeTypes: [],
      tenantIsolationRequired: true,
      federationAllowed: false,
      crossTenantLinks: false,
      defaultVisibility: 'tenant',
      created: new Date().toISOString(),
      createdBy: 'system',
      active: true
    });
  }
}

// ============================================================================
// POLICY UTILITIES
// ============================================================================

/**
 * Create policy engine instance
 */
export function createFabricPolicyEngine(tenantId: string): FabricPolicyEngine {
  return new FabricPolicyEngine(tenantId);
}

/**
 * Check if all evaluations passed
 */
export function allEvaluationsPassed(evaluations: FabricPolicyEvaluation[]): boolean {
  return evaluations.every(e => e.allowed);
}
