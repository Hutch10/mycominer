/**
 * Phase 45: Governance History - Role Evolution Tracker
 * 
 * Tracks the complete lifecycle of roles: creation, updates, permission changes,
 * scope changes, policy pack assignments, and deactivation.
 */

import {
  Role,
  Permission,
  PermissionScope
} from '../governance/governanceTypes';
import {
  RoleEvolutionRecord,
  RoleVersion,
  GovernanceChangeType,
  ChangeDetail
} from './governanceHistoryTypes';

// ============================================================================
// ROLE EVOLUTION TRACKER CLASS
// ============================================================================

export class RoleEvolutionTracker {
  private evolutions: Map<string, RoleEvolutionRecord> = new Map();
  private tenantId: string;
  private facilityId?: string;

  constructor(tenantId: string, facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
  }

  /**
   * Record role creation
   */
  recordRoleCreation(
    role: Role,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): void {
    const evolution: RoleEvolutionRecord = {
      roleId: role.id,
      roleName: role.name,
      tenantId: role.tenantId || this.tenantId,
      facilityId: role.facilityId || this.facilityId,
      versions: [
        {
          version: 1,
          timestamp: new Date().toISOString(),
          changeType: 'roleCreated',
          snapshot: { ...role },
          changes: [],
          performedBy,
          approvedBy,
          rationale,
          permissionsAdded: role.permissions,
          permissionsRemoved: [],
          scopeChanged: false,
          policyPacksChanged: false
        }
      ],
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      totalChanges: 1,
      currentlyActive: role.active
    };

    this.evolutions.set(role.id, evolution);
  }

  /**
   * Record role update
   */
  recordRoleUpdate(
    roleId: string,
    updatedRole: Role,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): void {
    const evolution = this.evolutions.get(roleId);
    if (!evolution) {
      throw new Error(`No evolution record found for role ${roleId}`);
    }

    const previousVersion = evolution.versions[evolution.versions.length - 1];
    const previousRole = previousVersion.snapshot;

    // Compute changes
    const changes: ChangeDetail[] = [];
    const permissionsAdded: Permission[] = [];
    const permissionsRemoved: Permission[] = [];
    let scopeChanged = false;
    let policyPacksChanged = false;

    // Check name change
    if (previousRole.name !== updatedRole.name) {
      changes.push({
        field: 'name',
        oldValue: previousRole.name,
        newValue: updatedRole.name,
        changeType: 'modified'
      });
    }

    // Check description change
    if (previousRole.description !== updatedRole.description) {
      changes.push({
        field: 'description',
        oldValue: previousRole.description,
        newValue: updatedRole.description,
        changeType: 'modified'
      });
    }

    // Check scope change
    if (previousRole.scope !== updatedRole.scope) {
      changes.push({
        field: 'scope',
        oldValue: previousRole.scope,
        newValue: updatedRole.scope,
        changeType: 'modified'
      });
      scopeChanged = true;
    }

    // Check permission changes
    const prevPermIds = new Set(previousRole.permissions.map(p => p.id));
    const newPermIds = new Set(updatedRole.permissions.map(p => p.id));

    for (const perm of updatedRole.permissions) {
      if (!prevPermIds.has(perm.id)) {
        permissionsAdded.push(perm);
        changes.push({
          field: 'permissions',
          oldValue: null,
          newValue: perm.action,
          changeType: 'added'
        });
      }
    }

    for (const perm of previousRole.permissions) {
      if (!newPermIds.has(perm.id)) {
        permissionsRemoved.push(perm);
        changes.push({
          field: 'permissions',
          oldValue: perm.action,
          newValue: null,
          changeType: 'removed'
        });
      }
    }

    // Check policy pack changes
    const prevPacks = new Set(previousRole.policyPackIds || []);
    const newPacks = new Set(updatedRole.policyPackIds || []);

    if (prevPacks.size !== newPacks.size || 
        ![...prevPacks].every(p => newPacks.has(p))) {
      policyPacksChanged = true;
      changes.push({
        field: 'policyPackIds',
        oldValue: Array.from(prevPacks),
        newValue: Array.from(newPacks),
        changeType: 'modified'
      });
    }

    // Create new version
    const newVersion: RoleVersion = {
      version: evolution.versions.length + 1,
      timestamp: new Date().toISOString(),
      changeType: 'roleUpdated',
      snapshot: { ...updatedRole },
      changes,
      performedBy,
      approvedBy,
      rationale,
      permissionsAdded,
      permissionsRemoved,
      scopeChanged,
      policyPacksChanged
    };

    evolution.versions.push(newVersion);
    evolution.lastModified = newVersion.timestamp;
    evolution.totalChanges++;
    evolution.currentlyActive = updatedRole.active;
    evolution.roleName = updatedRole.name;
  }

  /**
   * Record role deactivation
   */
  recordRoleDeactivation(
    roleId: string,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): void {
    const evolution = this.evolutions.get(roleId);
    if (!evolution) {
      throw new Error(`No evolution record found for role ${roleId}`);
    }

    const previousVersion = evolution.versions[evolution.versions.length - 1];
    const deactivatedRole: Role = {
      ...previousVersion.snapshot,
      active: false
    };

    const newVersion: RoleVersion = {
      version: evolution.versions.length + 1,
      timestamp: new Date().toISOString(),
      changeType: 'roleDeactivated',
      snapshot: deactivatedRole,
      changes: [
        {
          field: 'active',
          oldValue: true,
          newValue: false,
          changeType: 'modified'
        }
      ],
      performedBy,
      approvedBy,
      rationale,
      permissionsAdded: [],
      permissionsRemoved: [],
      scopeChanged: false,
      policyPacksChanged: false
    };

    evolution.versions.push(newVersion);
    evolution.lastModified = newVersion.timestamp;
    evolution.totalChanges++;
    evolution.currentlyActive = false;
  }

  /**
   * Record permission addition
   */
  recordPermissionAddition(
    roleId: string,
    permission: Permission,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): void {
    const evolution = this.evolutions.get(roleId);
    if (!evolution) {
      throw new Error(`No evolution record found for role ${roleId}`);
    }

    const previousVersion = evolution.versions[evolution.versions.length - 1];
    const updatedRole: Role = {
      ...previousVersion.snapshot,
      permissions: [...previousVersion.snapshot.permissions, permission]
    };

    const newVersion: RoleVersion = {
      version: evolution.versions.length + 1,
      timestamp: new Date().toISOString(),
      changeType: 'permissionAdded',
      snapshot: updatedRole,
      changes: [
        {
          field: 'permissions',
          oldValue: null,
          newValue: permission.action,
          changeType: 'added'
        }
      ],
      performedBy,
      approvedBy,
      rationale,
      permissionsAdded: [permission],
      permissionsRemoved: [],
      scopeChanged: false,
      policyPacksChanged: false
    };

    evolution.versions.push(newVersion);
    evolution.lastModified = newVersion.timestamp;
    evolution.totalChanges++;
  }

  /**
   * Record permission removal
   */
  recordPermissionRemoval(
    roleId: string,
    permissionId: string,
    performedBy: string,
    rationale: string,
    approvedBy?: string
  ): void {
    const evolution = this.evolutions.get(roleId);
    if (!evolution) {
      throw new Error(`No evolution record found for role ${roleId}`);
    }

    const previousVersion = evolution.versions[evolution.versions.length - 1];
    const removedPermission = previousVersion.snapshot.permissions.find(p => p.id === permissionId);
    if (!removedPermission) {
      throw new Error(`Permission ${permissionId} not found in role ${roleId}`);
    }

    const updatedRole: Role = {
      ...previousVersion.snapshot,
      permissions: previousVersion.snapshot.permissions.filter(p => p.id !== permissionId)
    };

    const newVersion: RoleVersion = {
      version: evolution.versions.length + 1,
      timestamp: new Date().toISOString(),
      changeType: 'permissionRemoved',
      snapshot: updatedRole,
      changes: [
        {
          field: 'permissions',
          oldValue: removedPermission.action,
          newValue: null,
          changeType: 'removed'
        }
      ],
      performedBy,
      approvedBy,
      rationale,
      permissionsAdded: [],
      permissionsRemoved: [removedPermission],
      scopeChanged: false,
      policyPacksChanged: false
    };

    evolution.versions.push(newVersion);
    evolution.lastModified = newVersion.timestamp;
    evolution.totalChanges++;
  }

  /**
   * Get role evolution
   */
  getRoleEvolution(roleId: string): RoleEvolutionRecord | undefined {
    return this.evolutions.get(roleId);
  }

  /**
   * Get all role evolutions
   */
  getAllEvolutions(): RoleEvolutionRecord[] {
    return Array.from(this.evolutions.values());
  }

  /**
   * Get evolutions in time range
   */
  getEvolutionsInRange(startTime: Date, endTime: Date): RoleEvolutionRecord[] {
    const startStr = startTime.toISOString();
    const endStr = endTime.toISOString();

    return this.getAllEvolutions().filter(evolution =>
      evolution.versions.some(v => v.timestamp >= startStr && v.timestamp <= endStr)
    );
  }

  /**
   * Get role version at specific time
   */
  getRoleVersionAtTime(roleId: string, timestamp: string): RoleVersion | undefined {
    const evolution = this.evolutions.get(roleId);
    if (!evolution) {
      return undefined;
    }

    // Find the last version before or at the timestamp
    for (let i = evolution.versions.length - 1; i >= 0; i--) {
      if (evolution.versions[i].timestamp <= timestamp) {
        return evolution.versions[i];
      }
    }

    return undefined;
  }

  /**
   * Compare role versions
   */
  compareVersions(
    roleId: string,
    version1: number,
    version2: number
  ): {
    permissionsAdded: Permission[];
    permissionsRemoved: Permission[];
    scopeChanged: boolean;
    policyPacksChanged: boolean;
    allChanges: ChangeDetail[];
  } {
    const evolution = this.evolutions.get(roleId);
    if (!evolution) {
      throw new Error(`No evolution record found for role ${roleId}`);
    }

    const v1 = evolution.versions.find(v => v.version === version1);
    const v2 = evolution.versions.find(v => v.version === version2);

    if (!v1 || !v2) {
      throw new Error(`Version not found`);
    }

    const permissionsAdded: Permission[] = [];
    const permissionsRemoved: Permission[] = [];
    const allChanges: ChangeDetail[] = [];

    const v1PermIds = new Set(v1.snapshot.permissions.map(p => p.id));
    const v2PermIds = new Set(v2.snapshot.permissions.map(p => p.id));

    for (const perm of v2.snapshot.permissions) {
      if (!v1PermIds.has(perm.id)) {
        permissionsAdded.push(perm);
      }
    }

    for (const perm of v1.snapshot.permissions) {
      if (!v2PermIds.has(perm.id)) {
        permissionsRemoved.push(perm);
      }
    }

    const scopeChanged = v1.snapshot.scope !== v2.snapshot.scope;
    const policyPacksChanged = 
      JSON.stringify(v1.snapshot.policyPackIds) !== JSON.stringify(v2.snapshot.policyPackIds);

    // Aggregate all changes between versions
    for (let i = version1; i < version2; i++) {
      const version = evolution.versions.find(v => v.version === i + 1);
      if (version) {
        allChanges.push(...version.changes);
      }
    }

    return {
      permissionsAdded,
      permissionsRemoved,
      scopeChanged,
      policyPacksChanged,
      allChanges
    };
  }

  /**
   * Export evolution to JSON
   */
  exportEvolution(roleId: string): string {
    const evolution = this.evolutions.get(roleId);
    if (!evolution) {
      throw new Error(`No evolution record found for role ${roleId}`);
    }

    return JSON.stringify(evolution, null, 2);
  }

  /**
   * Import evolution from JSON
   */
  importEvolution(json: string): void {
    const evolution = JSON.parse(json) as RoleEvolutionRecord;
    this.evolutions.set(evolution.roleId, evolution);
  }
}

// ============================================================================
// ROLE EVOLUTION UTILITIES
// ============================================================================

/**
 * Get summary of role changes
 */
export function getRoleChangeSummary(evolution: RoleEvolutionRecord): string {
  const { versions, totalChanges } = evolution;
  
  const permissionsAdded = versions.reduce((sum, v) => sum + v.permissionsAdded.length, 0);
  const permissionsRemoved = versions.reduce((sum, v) => sum + v.permissionsRemoved.length, 0);
  const scopeChanges = versions.filter(v => v.scopeChanged).length;
  const policyPackChanges = versions.filter(v => v.policyPacksChanged).length;

  return `Role "${evolution.roleName}" has undergone ${totalChanges} changes: ` +
    `${permissionsAdded} permissions added, ${permissionsRemoved} removed, ` +
    `${scopeChanges} scope changes, ${policyPackChanges} policy pack changes.`;
}

/**
 * Check if role has changed since timestamp
 */
export function hasRoleChangedSince(evolution: RoleEvolutionRecord, timestamp: string): boolean {
  return evolution.versions.some(v => v.timestamp > timestamp);
}

/**
 * Get most recent change
 */
export function getMostRecentChange(evolution: RoleEvolutionRecord): RoleVersion {
  return evolution.versions[evolution.versions.length - 1];
}
