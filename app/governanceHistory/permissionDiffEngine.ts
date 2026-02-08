/**
 * Phase 45: Governance History - Permission Diff Engine
 * 
 * Computes detailed diffs for permission changes, scope modifications,
 * and policy pack assignments. Analyzes impact and provides before/after comparisons.
 */

import {
  Role,
  Permission,
  PermissionScope,
  GovernanceAction
} from '../governance/governanceTypes';
import {
  PermissionDiff,
  PermissionModification,
  ScopeChange
} from './governanceHistoryTypes';

// ============================================================================
// PERMISSION DIFF ENGINE CLASS
// ============================================================================

export class PermissionDiffEngine {
  private tenantId: string;
  private facilityId?: string;

  constructor(tenantId: string, facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
  }

  /**
   * Compute permission diff between two role versions
   */
  computePermissionDiff(
    roleId: string,
    roleName: string,
    oldRole: Role,
    newRole: Role,
    performedBy: string,
    rationale: string,
    relatedDecisionIds?: string[]
  ): PermissionDiff {
    const timestamp = new Date().toISOString();

    // Compute permission modifications
    const modifications: PermissionModification[] = [];
    const oldPermMap = new Map(oldRole.permissions.map(p => [p.id, p]));
    const newPermMap = new Map(newRole.permissions.map(p => [p.id, p]));

    // Find added permissions
    for (const [id, perm] of newPermMap) {
      if (!oldPermMap.has(id)) {
        modifications.push({
          permissionId: id,
          action: perm.action,
          modificationType: 'added',
          before: null,
          after: perm,
          scopeImpact: this.analyzeScopeImpact(null, perm),
          rationale: `Permission ${perm.action} added to role`
        });
      }
    }

    // Find removed permissions
    for (const [id, perm] of oldPermMap) {
      if (!newPermMap.has(id)) {
        modifications.push({
          permissionId: id,
          action: perm.action,
          modificationType: 'removed',
          before: perm,
          after: null,
          scopeImpact: this.analyzeScopeImpact(perm, null),
          rationale: `Permission ${perm.action} removed from role`
        });
      }
    }

    // Find modified permissions
    for (const [id, newPerm] of newPermMap) {
      const oldPerm = oldPermMap.get(id);
      if (oldPerm && this.hasPermissionChanged(oldPerm, newPerm)) {
        modifications.push({
          permissionId: id,
          action: newPerm.action,
          modificationType: 'modified',
          before: oldPerm,
          after: newPerm,
          scopeImpact: this.analyzeScopeImpact(oldPerm, newPerm),
          rationale: `Permission ${newPerm.action} modified`
        });
      }
    }

    // Compute scope changes
    const scopeChanges: ScopeChange[] = [];
    if (oldRole.scope !== newRole.scope) {
      scopeChanges.push({
        changeType: this.determineScopeChangeType(oldRole.scope, newRole.scope),
        oldScope: oldRole.scope,
        newScope: newRole.scope,
        affectedResources: this.getAffectedResources(oldRole.scope, newRole.scope),
        impactAssessment: this.assessScopeChangeImpact(oldRole.scope, newRole.scope)
      });
    }

    // Compute policy pack changes
    const oldPacks = new Set(oldRole.policyPackIds || []);
    const newPacks = new Set(newRole.policyPackIds || []);
    const policyPacksAdded = Array.from(newPacks).filter(p => !oldPacks.has(p));
    const policyPacksRemoved = Array.from(oldPacks).filter(p => !newPacks.has(p));

    return {
      id: `diff-${roleId}-${timestamp}`,
      roleId,
      roleName,
      timestamp,
      tenantId: oldRole.tenantId || this.tenantId,
      facilityId: oldRole.facilityId || this.facilityId,
      performedBy,
      approvedBy: undefined,
      rationale,
      modifications,
      scopeChanges,
      policyPacksAdded,
      policyPacksRemoved,
      impactSummary: this.generateImpactSummary(modifications, scopeChanges, policyPacksAdded, policyPacksRemoved),
      relatedDecisionIds: relatedDecisionIds || []
    };
  }

  /**
   * Compute diff for permission addition
   */
  computePermissionAdditionDiff(
    roleId: string,
    roleName: string,
    permission: Permission,
    performedBy: string,
    rationale: string
  ): PermissionDiff {
    const timestamp = new Date().toISOString();

    const modification: PermissionModification = {
      permissionId: permission.id,
      action: permission.action,
      modificationType: 'added',
      before: null,
      after: permission,
      scopeImpact: this.analyzeScopeImpact(null, permission),
      rationale: `Permission ${permission.action} added to role ${roleName}`
    };

    return {
      id: `diff-add-${roleId}-${timestamp}`,
      roleId,
      roleName,
      timestamp,
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      performedBy,
      approvedBy: undefined,
      rationale,
      modifications: [modification],
      scopeChanges: [],
      policyPacksAdded: [],
      policyPacksRemoved: [],
      impactSummary: `Added permission: ${permission.action}`,
      relatedDecisionIds: []
    };
  }

  /**
   * Compute diff for permission removal
   */
  computePermissionRemovalDiff(
    roleId: string,
    roleName: string,
    permission: Permission,
    performedBy: string,
    rationale: string
  ): PermissionDiff {
    const timestamp = new Date().toISOString();

    const modification: PermissionModification = {
      permissionId: permission.id,
      action: permission.action,
      modificationType: 'removed',
      before: permission,
      after: null,
      scopeImpact: this.analyzeScopeImpact(permission, null),
      rationale: `Permission ${permission.action} removed from role ${roleName}`
    };

    return {
      id: `diff-remove-${roleId}-${timestamp}`,
      roleId,
      roleName,
      timestamp,
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      performedBy,
      approvedBy: undefined,
      rationale,
      modifications: [modification],
      scopeChanges: [],
      policyPacksAdded: [],
      policyPacksRemoved: [],
      impactSummary: `Removed permission: ${permission.action}`,
      relatedDecisionIds: []
    };
  }

  /**
   * Compute diff for scope change
   */
  computeScopeChangeDiff(
    roleId: string,
    roleName: string,
    oldScope: PermissionScope,
    newScope: PermissionScope,
    performedBy: string,
    rationale: string
  ): PermissionDiff {
    const timestamp = new Date().toISOString();

    const scopeChange: ScopeChange = {
      changeType: this.determineScopeChangeType(oldScope, newScope),
      oldScope,
      newScope,
      affectedResources: this.getAffectedResources(oldScope, newScope),
      impactAssessment: this.assessScopeChangeImpact(oldScope, newScope)
    };

    return {
      id: `diff-scope-${roleId}-${timestamp}`,
      roleId,
      roleName,
      timestamp,
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      performedBy,
      approvedBy: undefined,
      rationale,
      modifications: [],
      scopeChanges: [scopeChange],
      policyPacksAdded: [],
      policyPacksRemoved: [],
      impactSummary: `Scope changed from ${oldScope} to ${newScope}`,
      relatedDecisionIds: []
    };
  }

  // ============================================================================
  // PRIVATE ANALYSIS METHODS
  // ============================================================================

  private hasPermissionChanged(oldPerm: Permission, newPerm: Permission): boolean {
    return (
      oldPerm.action !== newPerm.action ||
      oldPerm.scope !== newPerm.scope ||
      JSON.stringify(oldPerm.conditions) !== JSON.stringify(newPerm.conditions)
    );
  }

  private analyzeScopeImpact(oldPerm: Permission | null, newPerm: Permission | null): string {
    if (!oldPerm && newPerm) {
      return `Grant ${newPerm.action} (scope: ${newPerm.scope})`;
    }
    if (oldPerm && !newPerm) {
      return `Revoke ${oldPerm.action} (scope: ${oldPerm.scope})`;
    }
    if (oldPerm && newPerm) {
      const changes: string[] = [];
      if (oldPerm.action !== newPerm.action) {
        changes.push(`action: ${oldPerm.action} → ${newPerm.action}`);
      }
      if (oldPerm.scope !== newPerm.scope) {
        changes.push(`scope: ${oldPerm.scope} → ${newPerm.scope}`);
      }
      return `Modify permission: ${changes.join(', ')}`;
    }
    return 'No impact';
  }

  private determineScopeChangeType(oldScope: PermissionScope, newScope: PermissionScope): 'expanded' | 'restricted' {
    const scopeHierarchy: PermissionScope[] = ['asset-type', 'engine', 'room', 'facility', 'tenant', 'global'];
    const oldIndex = scopeHierarchy.indexOf(oldScope);
    const newIndex = scopeHierarchy.indexOf(newScope);
    return newIndex > oldIndex ? 'expanded' : 'restricted';
  }

  private getAffectedResources(oldScope: PermissionScope, newScope: PermissionScope): string[] {
    const resources: string[] = [];
    
    if (oldScope === 'facility' || newScope === 'facility') {
      resources.push('facilities');
    }
    if (oldScope === 'tenant' || newScope === 'tenant') {
      resources.push('tenants');
    }
    if (oldScope === 'room' || newScope === 'room') {
      resources.push('rooms');
    }
    if (oldScope === 'engine' || newScope === 'engine') {
      resources.push('engines');
    }
    if (oldScope === 'asset-type' || newScope === 'asset-type') {
      resources.push('asset-types');
    }
    if (oldScope === 'global' || newScope === 'global') {
      resources.push('all-resources');
    }

    return Array.from(new Set(resources));
  }

  private assessScopeChangeImpact(oldScope: PermissionScope, newScope: PermissionScope): string {
    const changeType = this.determineScopeChangeType(oldScope, newScope);
    
    if (changeType === 'expanded') {
      return `EXPANDING SCOPE: Role now has broader access. Previous scope (${oldScope}) → New scope (${newScope}). ` +
        `This grants additional permissions across more resources. Review required.`;
    } else {
      return `RESTRICTING SCOPE: Role access reduced. Previous scope (${oldScope}) → New scope (${newScope}). ` +
        `This limits permissions to fewer resources. Users with this role may lose access.`;
    }
  }

  private generateImpactSummary(
    modifications: PermissionModification[],
    scopeChanges: ScopeChange[],
    policyPacksAdded: string[],
    policyPacksRemoved: string[]
  ): string {
    const parts: string[] = [];

    const added = modifications.filter(m => m.modificationType === 'added').length;
    const removed = modifications.filter(m => m.modificationType === 'removed').length;
    const modified = modifications.filter(m => m.modificationType === 'modified').length;

    if (added > 0) parts.push(`${added} permission(s) added`);
    if (removed > 0) parts.push(`${removed} permission(s) removed`);
    if (modified > 0) parts.push(`${modified} permission(s) modified`);
    if (scopeChanges.length > 0) parts.push(`${scopeChanges.length} scope change(s)`);
    if (policyPacksAdded.length > 0) parts.push(`${policyPacksAdded.length} policy pack(s) added`);
    if (policyPacksRemoved.length > 0) parts.push(`${policyPacksRemoved.length} policy pack(s) removed`);

    return parts.length > 0 ? parts.join(', ') : 'No changes';
  }
}

// ============================================================================
// DIFF UTILITIES
// ============================================================================

/**
 * Format diff for display
 */
export function formatPermissionDiff(diff: PermissionDiff): string {
  let output = `Permission Diff: ${diff.roleName} (${diff.timestamp})\n`;
  output += `Performed by: ${diff.performedBy}\n`;
  output += `Rationale: ${diff.rationale}\n\n`;

  output += `Impact Summary: ${diff.impactSummary}\n\n`;

  if (diff.modifications.length > 0) {
    output += `Permission Modifications (${diff.modifications.length}):\n`;
    for (const mod of diff.modifications) {
      output += `  - [${mod.modificationType.toUpperCase()}] ${mod.action}\n`;
      output += `    ${mod.scopeImpact}\n`;
    }
    output += '\n';
  }

  if (diff.scopeChanges.length > 0) {
    output += `Scope Changes (${diff.scopeChanges.length}):\n`;
    for (const sc of diff.scopeChanges) {
      output += `  - ${sc.oldScope} → ${sc.newScope} (${sc.changeType})\n`;
      output += `    ${sc.impactAssessment}\n`;
    }
    output += '\n';
  }

  if (diff.policyPacksAdded.length > 0) {
    output += `Policy Packs Added: ${diff.policyPacksAdded.join(', ')}\n`;
  }

  if (diff.policyPacksRemoved.length > 0) {
    output += `Policy Packs Removed: ${diff.policyPacksRemoved.join(', ')}\n`;
  }

  return output;
}

/**
 * Get high-impact modifications
 */
export function getHighImpactModifications(diff: PermissionDiff): PermissionModification[] {
  return diff.modifications.filter(mod => {
    // Consider 'removed' and scope-expanding modifications as high impact
    if (mod.modificationType === 'removed') return true;
    if (mod.after && ['tenant', 'global'].includes(mod.after.scope)) return true;
    return false;
  });
}

/**
 * Check if diff requires approval
 */
export function diffRequiresApproval(diff: PermissionDiff): boolean {
  // Requires approval if:
  // - Any permissions removed
  // - Scope expanded to tenant or global
  // - More than 5 permissions modified
  
  const hasRemovals = diff.modifications.some(m => m.modificationType === 'removed');
  const hasScopeExpansion = diff.scopeChanges.some(sc => 
    sc.changeType === 'expanded' && ['tenant', 'global'].includes(sc.newScope)
  );
  const largeChange = diff.modifications.length > 5;

  return hasRemovals || hasScopeExpansion || largeChange;
}
