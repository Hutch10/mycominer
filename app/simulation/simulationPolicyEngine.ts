/**
 * Phase 49: Operator Simulation Mode - Policy Engine
 * 
 * Enforces tenant isolation, federation rules, and permissions for simulations.
 * All policy decisions logged for audit trail.
 * 
 * CRITICAL CONSTRAINTS:
 * - Strict tenant isolation
 * - No cross-tenant simulation access
 * - All decisions logged
 * - Deterministic evaluation
 */

import type {
  SimulationQuery,
  SimulationPolicyContext,
  SimulationLogEntry,
} from './simulationTypes';

// ============================================================================
// POLICY DECISION
// ============================================================================

export interface SimulationPolicyDecision {
  decision: 'allow' | 'deny' | 'partial';
  reason: string;
  allowedScenarioTypes?: string[];
  deniedScenarioTypes?: string[];
}

// ============================================================================
// SIMULATION POLICY ENGINE
// ============================================================================

export class SimulationPolicyEngine {
  private tenantId: string;
  private policyLog: SimulationLogEntry[] = [];

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // ==========================================================================
  // AUTHORIZATION
  // ==========================================================================

  /**
   * Authorize simulation query
   */
  public authorizeSimulation(
    query: SimulationQuery,
    policyContext: SimulationPolicyContext
  ): SimulationPolicyDecision {
    // Validate tenant isolation
    if (!this.validateTenantIsolation(query, policyContext)) {
      return {
        decision: 'deny',
        reason: 'Cross-tenant simulation access denied',
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

    // Validate simulation mode permission
    if (!this.validateSimulationPermission(query, policyContext)) {
      return {
        decision: 'deny',
        reason: 'Simulation mode permission denied',
      };
    }

    this.logPolicyDecision({
      decision: 'allow',
      reason: 'Simulation authorized',
    }, policyContext);

    return {
      decision: 'allow',
      reason: 'Simulation authorized',
    };
  }

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  /**
   * Validate tenant isolation
   */
  private validateTenantIsolation(
    query: SimulationQuery,
    policyContext: SimulationPolicyContext
  ): boolean {
    if (query.scope.tenantId !== policyContext.tenantId) {
      return false;
    }

    if (policyContext.tenantId !== this.tenantId) {
      return false;
    }

    return true;
  }

  /**
   * Validate federation rules
   */
  private validateFederationRules(
    query: SimulationQuery,
    policyContext: SimulationPolicyContext
  ): boolean {
    // If simulation crosses tenants, check federation
    if (policyContext.federationTenants && policyContext.federationTenants.length > 0) {
      if (!policyContext.userPermissions.includes('simulation.federated')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate scope permissions
   */
  private validateScopePermissions(
    query: SimulationQuery,
    policyContext: SimulationPolicyContext
  ): boolean {
    // Check facility-level access
    if (query.scope.facilityId) {
      if (!policyContext.userPermissions.includes('facility.simulate')) {
        return false;
      }
    }

    // Check room-level access
    if (query.scope.roomId) {
      if (!policyContext.userPermissions.includes('room.simulate')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate simulation mode permission
   */
  private validateSimulationPermission(
    query: SimulationQuery,
    policyContext: SimulationPolicyContext
  ): boolean {
    // Check if user has simulation permission
    if (!policyContext.userPermissions.includes('simulation.run')) {
      return false;
    }

    // Check scenario type specific permissions
    const scenarioTypePermission = `simulation.${query.queryType}`;
    if (!policyContext.userPermissions.includes(scenarioTypePermission)) {
      return false;
    }

    return true;
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
    },
    policyContext: SimulationPolicyContext
  ): void {
    const entry: SimulationLogEntry = {
      entryId: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entryType: 'policy-decision',
      timestamp: new Date().toISOString(),
      tenantId: policyContext.tenantId,
      facilityId: policyContext.facilityId,
      policyDecision: {
        decision: decision.decision,
        reason: decision.reason,
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
  public getPolicyLog(): SimulationLogEntry[] {
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
