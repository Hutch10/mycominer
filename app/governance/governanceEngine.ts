/**
 * Phase 44: System Governance - Governance Engine
 * 
 * Orchestrates all governance operations: role resolution, permission checks,
 * policy pack evaluation, and decision logging.
 */

import {
  GovernanceAction,
  GovernanceSubject,
  GovernanceResource,
  GovernanceDecision,
  Role,
  PolicyPack,
  GovernanceEngine as GovernanceEngineType
} from './governanceTypes';
import { RoleRegistry } from './roleRegistry';
import { PermissionMatrix } from './permissionMatrix';
import { PolicyPackLibrary } from './policyPackLibrary';
import { GovernanceLog } from './governanceLog';

// ============================================================================
// GOVERNANCE ENGINE CLASS
// ============================================================================

export class GovernanceEngine {
  private roleRegistry: RoleRegistry;
  private policyPackLibrary: PolicyPackLibrary;
  private governanceLog: GovernanceLog;
  private tenantId: string;
  private facilityId?: string;

  constructor(tenantId: string, facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
    this.roleRegistry = new RoleRegistry();
    this.policyPackLibrary = new PolicyPackLibrary();
    this.governanceLog = new GovernanceLog();
  }

  /**
   * Main decision method: Can subject perform action on resource?
   */
  async canPerform(
    subject: GovernanceSubject,
    action: GovernanceAction,
    resource: GovernanceResource
  ): Promise<GovernanceDecision> {
    const startTime = Date.now();

    // Get subject roles
    const roles = this.resolveSubjectRoles(subject);

    // Create permission matrix
    const permissionMatrix = new PermissionMatrix(this.tenantId, this.facilityId);

    // Check permissions
    const permissionResult = permissionMatrix.canPerform(subject, action, resource, roles);

    // Apply policy packs
    const policyPackResult = this.evaluatePolicyPacks(subject, action, resource, roles);

    // Combine results
    const allowed = permissionResult.allowed && policyPackResult.allowed;
    const rationale: string[] = [];
    const references: string[] = [];

    if (allowed) {
      rationale.push('Permission check passed');
      rationale.push(...permissionResult.matchedPermissions.map(p => 
        `Permission: ${p.description} (${p.action} @ ${p.scope})`
      ));
      
      if (policyPackResult.matchedPacks.length > 0) {
        rationale.push('Policy packs satisfied');
        references.push(...policyPackResult.matchedPacks.map(p => `policy-pack:${p.id}`));
      }

      references.push(...permissionResult.matchedRoles.map(r => `role:${r.id}`));
    } else {
      rationale.push('Permission denied');
      rationale.push(...permissionResult.denialReasons);
      rationale.push(...policyPackResult.denialReasons);
    }

    const decision: GovernanceDecision = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subjectId: subject.id,
      action,
      resourceName: resource.name,
      allowed,
      matchedRoles: permissionResult.matchedRoles.map(r => r.id),
      rationale: rationale.join('; '),
      references,
      timestamp: new Date().toISOString(),
      evaluationTimeMs: Date.now() - startTime
    };

    // Log decision
    this.governanceLog.logDecision(decision);

    return decision;
  }

  /**
   * Get all actions subject can perform
   */
  getSubjectActions(subject: GovernanceSubject): GovernanceAction[] {
    const roles = this.resolveSubjectRoles(subject);
    const permissionMatrix = new PermissionMatrix(this.tenantId, this.facilityId);
    return permissionMatrix.getSubjectActions(subject, roles);
  }

  /**
   * Get engines subject can access
   */
  getSubjectEngines(subject: GovernanceSubject): GovernanceEngineType[] {
    const roles = this.resolveSubjectRoles(subject);
    const permissionMatrix = new PermissionMatrix(this.tenantId, this.facilityId);
    return permissionMatrix.getSubjectEngines(subject, roles);
  }

  /**
   * Get role registry
   */
  getRoleRegistry(): RoleRegistry {
    return this.roleRegistry;
  }

  /**
   * Get policy pack library
   */
  getPolicyPackLibrary(): PolicyPackLibrary {
    return this.policyPackLibrary;
  }

  /**
   * Get governance log
   */
  getGovernanceLog(): GovernanceLog {
    return this.governanceLog;
  }

  /**
   * Explain decision
   */
  async explainDecision(decisionId: string): Promise<{
    decision: GovernanceDecision;
    explanation: string;
    relatedRoles: Role[];
    relatedPolicyPacks: PolicyPack[];
  } | undefined> {
    const allEntries = this.governanceLog.getAllEntries();
    const entry = allEntries.find(e => e.id === decisionId);

    if (!entry) {
      return undefined;
    }

    // Reconstruct decision
    const decision: GovernanceDecision = {
      id: entry.id,
      subjectId: entry.subjectId,
      action: (entry.action || 'workflow:view-status') as GovernanceAction,
      resourceName: (entry.resourceName || 'unknown') as string,
      allowed: Boolean(entry.allowed),
      matchedRoles: entry.matchedRoles || [],
      rationale: entry.rationale || '',
      references: entry.references || [],
      timestamp: entry.timestamp
    };

    // Get related roles
    const relatedRoles = entry.matchedRoles 
      ? entry.matchedRoles.map(roleId => this.roleRegistry.getRole(roleId)).filter(r => r !== undefined) as Role[]
      : [];

    // Get related policy packs
    const policyPackRefs = entry.references?.filter(ref => ref.startsWith('policy-pack:')) || [];
    const relatedPolicyPacks = policyPackRefs
      .map(ref => this.policyPackLibrary.getPack(ref.replace('policy-pack:', '')))
      .filter(p => p !== undefined) as PolicyPack[];

    // Build explanation
    let explanation = `Decision ID: ${decision.id}\n`;
    explanation += `Timestamp: ${new Date(decision.timestamp).toLocaleString()}\n`;
    explanation += `Subject: ${decision.subjectId}\n`;
    explanation += `Action: ${decision.action}\n`;
    explanation += `Resource: ${decision.resourceName}\n`;
    explanation += `Result: ${decision.allowed ? 'ALLOWED' : 'DENIED'}\n\n`;
    explanation += `Rationale:\n${decision.rationale}\n\n`;

    if (relatedRoles.length > 0) {
      explanation += `Matched Roles:\n`;
      for (const role of relatedRoles) {
        explanation += `  - ${role.name}: ${role.description}\n`;
      }
      explanation += '\n';
    }

    if (relatedPolicyPacks.length > 0) {
      explanation += `Applied Policy Packs:\n`;
      for (const pack of relatedPolicyPacks) {
        explanation += `  - ${pack.name}: ${pack.description}\n`;
      }
    }

    return {
      decision,
      explanation,
      relatedRoles,
      relatedPolicyPacks
    };
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  /**
   * Resolve subject roles
   */
  private resolveSubjectRoles(subject: GovernanceSubject): Role[] {
    const roles: Role[] = [];

    for (const roleId of subject.roleIds) {
      const role = this.roleRegistry.getRole(roleId);
      if (role && role.active) {
        roles.push(role);
      }
    }

    return roles;
  }

  /**
   * Evaluate policy packs
   */
  private evaluatePolicyPacks(
    subject: GovernanceSubject,
    action: GovernanceAction,
    resource: GovernanceResource,
    roles: Role[]
  ): {
    allowed: boolean;
    matchedPacks: PolicyPack[];
    denialReasons: string[];
  } {
    const matchedPacks: PolicyPack[] = [];
    const denialReasons: string[] = [];

    // Get all active policy packs from roles
    const policyPackIds = new Set<string>();
    for (const role of roles) {
      if (role.policyPackIds) {
        role.policyPackIds.forEach(id => policyPackIds.add(id));
      }
    }

    // Evaluate each policy pack
    for (const packId of policyPackIds) {
      const pack = this.policyPackLibrary.getPack(packId);
      if (!pack || !pack.active) {
        continue;
      }

      // Find matching rule
      const rule = pack.rules.find(r => r.action === action);
      if (!rule) {
        continue;
      }

      // Check if subject has required role
      const hasRequiredRole = rule.requiredRoleIds.some(reqRoleId => 
        subject.roleIds.includes(reqRoleId)
      );

      if (!hasRequiredRole) {
        denialReasons.push(`Policy pack '${pack.name}' requires role: ${rule.requiredRoleIds.join(' or ')}`);
        continue;
      }

      // Check conditions
      if (rule.requiredConditions && rule.requiredConditions.length > 0) {
        const conditionsFailed = rule.requiredConditions.map(cond => {
          // For now, assume conditions are not met
          // In real implementation, would check training records, approvals, etc.
          return `Condition not met: ${cond.type}`;
        });

        if (conditionsFailed.length > 0) {
          denialReasons.push(...conditionsFailed);
          continue;
        }
      }

      matchedPacks.push(pack);
    }

    // If no policy packs apply, allow (policy packs are optional enhancements)
    const allowed = policyPackIds.size === 0 || matchedPacks.length > 0;

    return {
      allowed,
      matchedPacks,
      denialReasons
    };
  }
}

// ============================================================================
// GOVERNANCE ENGINE UTILITIES
// ============================================================================

/**
 * Create a query for permission check
 */
export function createPermissionQuery(
  subjectId: string,
  action: GovernanceAction,
  resourceName: string,
  tenantId: string,
  facilityId?: string,
  roomId?: string
): {
  subject: GovernanceSubject;
  resource: GovernanceResource;
} {
  return {
    subject: {
      id: subjectId,
      tenantId,
      facilityId,
      roleIds: []
    },
    resource: {
      name: resourceName,
      tenantId,
      facilityId,
      roomId
    }
  };
}

/**
 * Batch permission checks
 */
export async function batchCanPerform(
  engine: GovernanceEngine,
  subject: GovernanceSubject,
  checks: Array<{ action: GovernanceAction; resource: GovernanceResource }>
): Promise<GovernanceDecision[]> {
  const decisions: GovernanceDecision[] = [];

  for (const check of checks) {
    const decision = await engine.canPerform(subject, check.action, check.resource);
    decisions.push(decision);
  }

  return decisions;
}

/**
 * Get summary of decisions
 */
export function getDecisionSummary(decisions: GovernanceDecision[]): {
  total: number;
  allowed: number;
  denied: number;
  allowRate: number;
} {
  const total = decisions.length;
  const allowed = decisions.filter(d => d.allowed).length;
  const denied = total - allowed;

  return {
    total,
    allowed,
    denied,
    allowRate: total > 0 ? allowed / total : 0
  };
}
