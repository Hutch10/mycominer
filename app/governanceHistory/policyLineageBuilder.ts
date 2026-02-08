/**
 * Phase 45: Governance History - Policy Lineage Builder
 * 
 * Reconstructs the full lineage of policy pack definitions, assignments,
 * and revocations. Builds chronological chains showing policy evolution.
 */

import {
  PolicyPack,
  Role
} from '../governance/governanceTypes';
import {
  PolicyLineage,
  PolicyLineageNode,
  GovernanceChangeType
} from './governanceHistoryTypes';

// ============================================================================
// POLICY LINEAGE BUILDER CLASS
// ============================================================================

export class PolicyLineageBuilder {
  private lineages: Map<string, PolicyLineage> = new Map();
  private tenantId: string;
  private facilityId?: string;

  constructor(tenantId: string, facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
  }

  /**
   * Record policy pack creation
   */
  recordPolicyPackCreation(
    policyPack: PolicyPack,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): void {
    const lineage: PolicyLineage = {
      policyPackId: policyPack.id,
      policyPackName: policyPack.name,
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      nodes: [
        {
          nodeId: `node-${policyPack.id}-1`,
          timestamp: new Date().toISOString(),
          changeType: 'policyPackCreated',
          snapshot: { ...policyPack },
          performedBy,
          approvedBy,
          rationale,
          affectedRoles: [],
          previousNodeId: undefined,
          nextNodeId: undefined
        }
      ],
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      totalChanges: 1,
      currentlyActive: policyPack.active
    };

    this.lineages.set(policyPack.id, lineage);
  }

  /**
   * Record policy pack assignment to role
   */
  recordPolicyPackAssignment(
    policyPackId: string,
    policyPackName: string,
    roleId: string,
    roleName: string,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): void {
    let lineage = this.lineages.get(policyPackId);
    if (!lineage) {
      // Create lineage if it doesn't exist
      lineage = {
        policyPackId,
        policyPackName,
        tenantId: this.tenantId,
        facilityId: this.facilityId,
        nodes: [],
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        totalChanges: 0,
        currentlyActive: true
      };
      this.lineages.set(policyPackId, lineage);
    }

    const previousNode = lineage.nodes[lineage.nodes.length - 1];
    const newNodeId = `node-${policyPackId}-${lineage.nodes.length + 1}`;

    const newNode: PolicyLineageNode = {
      nodeId: newNodeId,
      timestamp: new Date().toISOString(),
      changeType: 'policyPackAssigned',
      snapshot: previousNode?.snapshot || { id: policyPackId, name: policyPackName } as PolicyPack,
      performedBy,
      approvedBy,
      rationale,
      affectedRoles: [{ roleId, roleName }],
      previousNodeId: previousNode?.nodeId,
      nextNodeId: undefined
    };

    if (previousNode) {
      previousNode.nextNodeId = newNodeId;
    }

    lineage.nodes.push(newNode);
    lineage.lastModified = newNode.timestamp;
    lineage.totalChanges++;
  }

  /**
   * Record policy pack revocation from role
   */
  recordPolicyPackRevocation(
    policyPackId: string,
    policyPackName: string,
    roleId: string,
    roleName: string,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): void {
    let lineage = this.lineages.get(policyPackId);
    if (!lineage) {
      // Create lineage if it doesn't exist
      lineage = {
        policyPackId,
        policyPackName,
        tenantId: this.tenantId,
        facilityId: this.facilityId,
        nodes: [],
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        totalChanges: 0,
        currentlyActive: true
      };
      this.lineages.set(policyPackId, lineage);
    }

    const previousNode = lineage.nodes[lineage.nodes.length - 1];
    const newNodeId = `node-${policyPackId}-${lineage.nodes.length + 1}`;

    const newNode: PolicyLineageNode = {
      nodeId: newNodeId,
      timestamp: new Date().toISOString(),
      changeType: 'policyPackRevoked',
      snapshot: previousNode?.snapshot || { id: policyPackId, name: policyPackName } as PolicyPack,
      performedBy,
      approvedBy,
      rationale,
      affectedRoles: [{ roleId, roleName }],
      previousNodeId: previousNode?.nodeId,
      nextNodeId: undefined
    };

    if (previousNode) {
      previousNode.nextNodeId = newNodeId;
    }

    lineage.nodes.push(newNode);
    lineage.lastModified = newNode.timestamp;
    lineage.totalChanges++;
  }

  /**
   * Record policy pack update
   */
  recordPolicyPackUpdate(
    policyPack: PolicyPack,
    performedBy: string,
    rationale: string,
    affectedRoles: Array<{ roleId: string; roleName: string }>,
    approvedBy?: string
  ): void {
    let lineage = this.lineages.get(policyPack.id);
    if (!lineage) {
      throw new Error(`No lineage found for policy pack ${policyPack.id}`);
    }

    const previousNode = lineage.nodes[lineage.nodes.length - 1];
    const newNodeId = `node-${policyPack.id}-${lineage.nodes.length + 1}`;

    const newNode: PolicyLineageNode = {
      nodeId: newNodeId,
      timestamp: new Date().toISOString(),
      changeType: 'policyPackUpdated',
      snapshot: { ...policyPack },
      performedBy,
      approvedBy,
      rationale,
      affectedRoles,
      previousNodeId: previousNode?.nodeId,
      nextNodeId: undefined
    };

    if (previousNode) {
      previousNode.nextNodeId = newNodeId;
    }

    lineage.nodes.push(newNode);
    lineage.lastModified = newNode.timestamp;
    lineage.totalChanges++;
    lineage.policyPackName = policyPack.name;
  }

  /**
   * Record policy pack deactivation
   */
  recordPolicyPackDeactivation(
    policyPackId: string,
    performedBy: string,
    rationale: string,
    affectedRoles: Array<{ roleId: string; roleName: string }>,
    approvedBy?: string
  ): void {
    let lineage = this.lineages.get(policyPackId);
    if (!lineage) {
      throw new Error(`No lineage found for policy pack ${policyPackId}`);
    }

    const previousNode = lineage.nodes[lineage.nodes.length - 1];
    const deactivatedPack: PolicyPack = {
      ...previousNode.snapshot,
      active: false
    };

    const newNodeId = `node-${policyPackId}-${lineage.nodes.length + 1}`;

    const newNode: PolicyLineageNode = {
      nodeId: newNodeId,
      timestamp: new Date().toISOString(),
      changeType: 'policyPackDeactivated',
      snapshot: deactivatedPack,
      performedBy,
      approvedBy,
      rationale,
      affectedRoles,
      previousNodeId: previousNode?.nodeId,
      nextNodeId: undefined
    };

    if (previousNode) {
      previousNode.nextNodeId = newNodeId;
    }

    lineage.nodes.push(newNode);
    lineage.lastModified = newNode.timestamp;
    lineage.totalChanges++;
    lineage.currentlyActive = false;
  }

  /**
   * Get policy lineage
   */
  getPolicyLineage(policyPackId: string): PolicyLineage | undefined {
    return this.lineages.get(policyPackId);
  }

  /**
   * Get all policy lineages
   */
  getAllLineages(): PolicyLineage[] {
    return Array.from(this.lineages.values());
  }

  /**
   * Get lineages for role
   */
  getLineagesForRole(roleId: string): PolicyLineage[] {
    return this.getAllLineages().filter(lineage =>
      lineage.nodes.some(node =>
        node.affectedRoles.some(role => role.roleId === roleId)
      )
    );
  }

  /**
   * Get policy pack history
   */
  getPolicyPackHistory(policyPackId: string): PolicyLineageNode[] {
    const lineage = this.lineages.get(policyPackId);
    return lineage ? lineage.nodes : [];
  }

  /**
   * Get policy pack at specific time
   */
  getPolicyPackAtTime(policyPackId: string, timestamp: string): PolicyLineageNode | undefined {
    const lineage = this.lineages.get(policyPackId);
    if (!lineage) {
      return undefined;
    }

    // Find the last node before or at the timestamp
    for (let i = lineage.nodes.length - 1; i >= 0; i--) {
      if (lineage.nodes[i].timestamp <= timestamp) {
        return lineage.nodes[i];
      }
    }

    return undefined;
  }

  /**
   * Trace lineage path
   */
  traceLineagePath(policyPackId: string, startNodeId?: string): PolicyLineageNode[] {
    const lineage = this.lineages.get(policyPackId);
    if (!lineage) {
      return [];
    }

    if (!startNodeId) {
      return lineage.nodes;
    }

    const path: PolicyLineageNode[] = [];
    let currentNode = lineage.nodes.find(n => n.nodeId === startNodeId);

    while (currentNode) {
      path.push(currentNode);
      if (currentNode.nextNodeId) {
        currentNode = lineage.nodes.find(n => n.nodeId === currentNode!.nextNodeId);
      } else {
        break;
      }
    }

    return path;
  }

  /**
   * Get roles affected by policy pack changes
   */
  getAffectedRoles(policyPackId: string): Array<{ roleId: string; roleName: string }> {
    const lineage = this.lineages.get(policyPackId);
    if (!lineage) {
      return [];
    }

    const rolesMap = new Map<string, string>();
    
    for (const node of lineage.nodes) {
      for (const role of node.affectedRoles) {
        rolesMap.set(role.roleId, role.roleName);
      }
    }

    return Array.from(rolesMap.entries()).map(([roleId, roleName]) => ({ roleId, roleName }));
  }

  /**
   * Get assignment/revocation timeline
   */
  getAssignmentTimeline(policyPackId: string): Array<{
    timestamp: string;
    action: 'assigned' | 'revoked';
    roleId: string;
    roleName: string;
    performedBy: string;
  }> {
    const lineage = this.lineages.get(policyPackId);
    if (!lineage) {
      return [];
    }

    const timeline: Array<{
      timestamp: string;
      action: 'assigned' | 'revoked';
      roleId: string;
      roleName: string;
      performedBy: string;
    }> = [];

    for (const node of lineage.nodes) {
      if (node.changeType === 'policyPackAssigned' || node.changeType === 'policyPackRevoked') {
        for (const role of node.affectedRoles) {
          timeline.push({
            timestamp: node.timestamp,
            action: node.changeType === 'policyPackAssigned' ? 'assigned' : 'revoked',
            roleId: role.roleId,
            roleName: role.roleName,
            performedBy: node.performedBy
          });
        }
      }
    }

    return timeline;
  }

  /**
   * Export lineage to JSON
   */
  exportLineage(policyPackId: string): string {
    const lineage = this.lineages.get(policyPackId);
    if (!lineage) {
      throw new Error(`No lineage found for policy pack ${policyPackId}`);
    }

    return JSON.stringify(lineage, null, 2);
  }

  /**
   * Import lineage from JSON
   */
  importLineage(json: string): void {
    const lineage = JSON.parse(json) as PolicyLineage;
    this.lineages.set(lineage.policyPackId, lineage);
  }
}

// ============================================================================
// LINEAGE UTILITIES
// ============================================================================

/**
 * Get lineage summary
 */
export function getLineageSummary(lineage: PolicyLineage): string {
  const { nodes, totalChanges, currentlyActive } = lineage;
  
  const assignments = nodes.filter(n => n.changeType === 'policyPackAssigned').length;
  const revocations = nodes.filter(n => n.changeType === 'policyPackRevoked').length;
  const updates = nodes.filter(n => n.changeType === 'policyPackUpdated').length;

  const status = currentlyActive ? 'ACTIVE' : 'INACTIVE';

  return `Policy Pack "${lineage.policyPackName}" [${status}]: ${totalChanges} changes - ` +
    `${assignments} assignments, ${revocations} revocations, ${updates} updates`;
}

/**
 * Find divergence point between two lineages
 */
export function findDivergencePoint(
  lineage1: PolicyLineage,
  lineage2: PolicyLineage
): PolicyLineageNode | undefined {
  const minLength = Math.min(lineage1.nodes.length, lineage2.nodes.length);

  for (let i = 0; i < minLength; i++) {
    if (lineage1.nodes[i].nodeId !== lineage2.nodes[i].nodeId) {
      return i > 0 ? lineage1.nodes[i - 1] : undefined;
    }
  }

  return lineage1.nodes[minLength - 1];
}

/**
 * Check if policy pack has been modified since timestamp
 */
export function hasPolicyPackChangedSince(lineage: PolicyLineage, timestamp: string): boolean {
  return lineage.nodes.some(n => n.timestamp > timestamp);
}

/**
 * Get most recent node
 */
export function getMostRecentNode(lineage: PolicyLineage): PolicyLineageNode {
  return lineage.nodes[lineage.nodes.length - 1];
}
