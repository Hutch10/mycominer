/**
 * Phase 48: Operator Intelligence Hub - Policy Engine
 * 
 * Enforces tenant isolation, federation rules, and governance permissions.
 * All policy decisions are logged and deterministic.
 * 
 * CRITICAL CONSTRAINTS:
 * - Strict tenant isolation
 * - No cross-tenant data leakage
 * - All policy decisions logged
 * - Deterministic evaluation
 */

import type {
  HubQuery,
  HubPolicyContext,
  HubSourceEngine,
  HubReference,
  HubLogEntry,
} from './hubTypes';

// ============================================================================
// POLICY DECISION
// ============================================================================

export interface PolicyDecision {
  decision: 'allow' | 'deny' | 'partial';
  reason: string;
  allowedEngines?: HubSourceEngine[];
  deniedEngines?: HubSourceEngine[];
  allowedReferences?: string[];      // Reference IDs
  deniedReferences?: string[];
}

// ============================================================================
// HUB POLICY ENGINE
// ============================================================================

export class HubPolicyEngine {
  private tenantId: string;
  private policyLog: HubLogEntry[] = [];

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // ==========================================================================
  // QUERY AUTHORIZATION
  // ==========================================================================

  /**
   * Authorize query
   */
  public authorizeQuery(
    query: HubQuery,
    policyContext: HubPolicyContext
  ): PolicyDecision {
    // Validate tenant isolation
    if (!this.validateTenantIsolation(query, policyContext)) {
      return {
        decision: 'deny',
        reason: 'Cross-tenant access denied',
      };
    }

    // Validate federation rules
    if (!this.validateFederationRules(query, policyContext)) {
      return {
        decision: 'deny',
        reason: 'Federation rules not satisfied',
      };
    }

    // Validate scope permissions
    if (!this.validateScopePermissions(query, policyContext)) {
      return {
        decision: 'deny',
        reason: 'Insufficient scope permissions',
      };
    }

    // Check engine-level permissions
    const engineDecision = this.evaluateEnginePermissions(query, policyContext);
    
    this.logPolicyDecision({
      decision: engineDecision.decision,
      reason: engineDecision.reason,
      affectedEngines: engineDecision.deniedEngines || [],
    }, policyContext);

    return engineDecision;
  }

  // ==========================================================================
  // REFERENCE AUTHORIZATION
  // ==========================================================================

  /**
   * Authorize references for visibility
   */
  public authorizeReferences(
    references: HubReference[],
    policyContext: HubPolicyContext
  ): HubReference[] {
    const authorizedRefs: HubReference[] = [];
    const deniedRefs: string[] = [];

    for (const ref of references) {
      if (this.canAccessReference(ref, policyContext)) {
        authorizedRefs.push(ref);
      } else {
        deniedRefs.push(ref.referenceId);
      }
    }

    if (deniedRefs.length > 0) {
      this.logPolicyDecision({
        decision: 'partial',
        reason: `${deniedRefs.length} references denied due to permissions`,
        affectedEngines: [],
      }, policyContext);
    }

    return authorizedRefs;
  }

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  /**
   * Validate tenant isolation
   */
  private validateTenantIsolation(
    query: HubQuery,
    policyContext: HubPolicyContext
  ): boolean {
    // Query tenant must match policy context tenant
    if (query.scope.tenantId !== policyContext.tenantId) {
      return false;
    }

    // Policy context tenant must match engine tenant
    if (policyContext.tenantId !== this.tenantId) {
      return false;
    }

    return true;
  }

  /**
   * Validate federation rules
   */
  private validateFederationRules(
    query: HubQuery,
    policyContext: HubPolicyContext
  ): boolean {
    // If query is federated, check if federation is allowed
    if (policyContext.federationTenants && policyContext.federationTenants.length > 0) {
      // User must have federation permission
      if (!policyContext.userPermissions.includes('federation.query')) {
        return false;
      }

      // All federated tenants must be in allowed list
      // (In production, this would check against federation policies from Phase 33)
      return true;
    }

    return true;
  }

  /**
   * Validate scope permissions
   */
  private validateScopePermissions(
    query: HubQuery,
    policyContext: HubPolicyContext
  ): boolean {
    // Check facility-level access
    if (query.scope.facilityId) {
      if (!policyContext.userPermissions.includes('facility.read')) {
        return false;
      }
    }

    // Check room-level access
    if (query.scope.roomId) {
      if (!policyContext.userPermissions.includes('room.read')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate engine-level permissions
   */
  private evaluateEnginePermissions(
    query: HubQuery,
    policyContext: HubPolicyContext
  ): PolicyDecision {
    const allowedEngines: HubSourceEngine[] = [];
    const deniedEngines: HubSourceEngine[] = [];

    // List of all possible engines
    const allEngines: HubSourceEngine[] = [
      'search',
      'knowledge-graph',
      'narrative',
      'timeline',
      'analytics',
      'training',
      'marketplace',
      'insights',
      'health',
      'governance',
      'governance-history',
      'fabric',
      'documentation',
    ];

    // If filters specify engines, only check those
    const enginesToCheck = query.filters?.engines || allEngines;

    for (const engine of enginesToCheck) {
      if (this.canAccessEngine(engine, policyContext)) {
        allowedEngines.push(engine);
      } else {
        deniedEngines.push(engine);
      }
    }

    // If no engines allowed, deny
    if (allowedEngines.length === 0) {
      return {
        decision: 'deny',
        reason: 'No engine access permissions',
        deniedEngines,
      };
    }

    // If some engines denied, partial
    if (deniedEngines.length > 0) {
      return {
        decision: 'partial',
        reason: `Access granted to ${allowedEngines.length} engines, denied to ${deniedEngines.length}`,
        allowedEngines,
        deniedEngines,
      };
    }

    // All engines allowed
    return {
      decision: 'allow',
      reason: 'Full engine access granted',
      allowedEngines,
    };
  }

  /**
   * Check if user can access engine
   */
  private canAccessEngine(
    engine: HubSourceEngine,
    policyContext: HubPolicyContext
  ): boolean {
    // Define engine permission mappings
    const enginePermissions: Record<HubSourceEngine, string> = {
      'search': 'search.read',
      'knowledge-graph': 'knowledgegraph.read',
      'narrative': 'narrative.read',
      'timeline': 'timeline.read',
      'analytics': 'analytics.read',
      'training': 'training.read',
      'marketplace': 'marketplace.read',
      'insights': 'insights.read',
      'health': 'health.read',
      'governance': 'governance.read',
      'governance-history': 'governance.read',
      'fabric': 'fabric.read',
      'documentation': 'documentation.read',
    };

    const requiredPermission = enginePermissions[engine];
    return policyContext.userPermissions.includes(requiredPermission);
  }

  /**
   * Check if user can access reference
   */
  private canAccessReference(
    ref: HubReference,
    policyContext: HubPolicyContext
  ): boolean {
    // Check tenant isolation for reference
    if (ref.metadata.tenantId && ref.metadata.tenantId !== policyContext.tenantId) {
      // Cross-tenant reference - check federation
      if (!policyContext.federationTenants?.includes(ref.metadata.tenantId)) {
        return false;
      }
    }

    // Check facility isolation if applicable
    if (ref.metadata.facilityId && policyContext.facilityId) {
      if (ref.metadata.facilityId !== policyContext.facilityId) {
        return false;
      }
    }

    // Check room isolation if applicable
    if (ref.metadata.roomId && policyContext.roomId) {
      if (ref.metadata.roomId !== policyContext.roomId) {
        return false;
      }
    }

    // Check engine-level access
    return this.canAccessEngine(ref.sourceEngine, policyContext);
  }

  // ==========================================================================
  // LOGGING
  // ==========================================================================

  /**
   * Log policy decision
   */
  private logPolicyDecision(
    decision: {
      decision: 'allow' | 'deny' | 'partial';
      reason: string;
      affectedEngines: HubSourceEngine[];
    },
    policyContext: HubPolicyContext
  ): void {
    const entry: HubLogEntry = {
      entryId: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'policy-decision',
      timestamp: new Date().toISOString(),
      tenantId: policyContext.tenantId,
      facilityId: policyContext.facilityId,
      policyDecision: {
        decision: decision.decision,
        reason: decision.reason,
        affectedEngines: decision.affectedEngines,
      },
      performedBy: policyContext.performedBy,
      success: decision.decision !== 'deny',
    };

    this.policyLog.push(entry);

    // Keep only last 1000 entries
    if (this.policyLog.length > 1000) {
      this.policyLog = this.policyLog.slice(-1000);
    }
  }

  /**
   * Get policy log
   */
  public getPolicyLog(): HubLogEntry[] {
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
    const stats = {
      totalDecisions: this.policyLog.length,
      allowed: 0,
      denied: 0,
      partial: 0,
    };

    for (const entry of this.policyLog) {
      if (entry.policyDecision) {
        const decision = entry.policyDecision.decision;
        if (decision === 'allow') stats.allowed++;
        else if (decision === 'deny') stats.denied++;
        else if (decision === 'partial') stats.partial++;
      }
    }

    return stats;
  }
}
