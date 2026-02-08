/**
 * Phase 44: System Governance - Permission Matrix
 * 
 * Performs granular permission checks based on subject, action, resource, and scope.
 * All checks are deterministic, explainable, and logged.
 */

import {
  Permission,
  PermissionScope,
  GovernanceAction,
  GovernanceSubject,
  GovernanceResource,
  GovernanceEngine,
  AssetType,
  Role
} from './governanceTypes';

// ============================================================================
// PERMISSION MATRIX CLASS
// ============================================================================

export class PermissionMatrix {
  private tenantId: string;
  private facilityId?: string;

  constructor(tenantId: string, facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
  }

  /**
   * Check if subject can perform action on resource
   */
  canPerform(
    subject: GovernanceSubject,
    action: GovernanceAction,
    resource: GovernanceResource,
    roles: Role[]
  ): {
    allowed: boolean;
    matchedPermissions: Permission[];
    matchedRoles: Role[];
    denialReasons: string[];
  } {
    // Get all permissions from subject's roles
    const subjectRoles = roles.filter(r => subject.roleIds.includes(r.id) && r.active);
    const rolePermissions = subjectRoles.flatMap(r => r.permissions);
    
    // Add direct permissions (if any)
    const allPermissions = [...rolePermissions, ...(subject.directPermissions || [])];

    // Find matching permissions
    const matchedPermissions: Permission[] = [];
    const denialReasons: string[] = [];

    for (const permission of allPermissions) {
      if (this.permissionMatches(permission, action, resource)) {
        // Check conditions
        if (permission.conditions && permission.conditions.length > 0) {
          const conditionResult = this.evaluateConditions(permission.conditions, subject);
          if (!conditionResult.passed) {
            denialReasons.push(...conditionResult.reasons);
            continue;
          }
        }

        matchedPermissions.push(permission);
      }
    }

    const allowed = matchedPermissions.length > 0;

    // Generate denial reasons if not allowed
    if (!allowed) {
      if (allPermissions.length === 0) {
        denialReasons.push('Subject has no permissions assigned');
      } else {
        denialReasons.push(`No permission found for action '${action}' on resource '${resource.name}'`);
      }

      // Scope check
      if (!this.scopeMatches(subject, resource)) {
        denialReasons.push(`Subject scope (tenant: ${subject.tenantId}, facility: ${subject.facilityId}) does not match resource scope`);
      }
    }

    return {
      allowed,
      matchedPermissions,
      matchedRoles: subjectRoles.filter(r => 
        r.permissions.some(p => matchedPermissions.includes(p))
      ),
      denialReasons
    };
  }

  /**
   * Get all permissions for a subject
   */
  getSubjectPermissions(subject: GovernanceSubject, roles: Role[]): Permission[] {
    const subjectRoles = roles.filter(r => subject.roleIds.includes(r.id) && r.active);
    const rolePermissions = subjectRoles.flatMap(r => r.permissions);
    return [...rolePermissions, ...(subject.directPermissions || [])];
  }

  /**
   * Get actions subject can perform
   */
  getSubjectActions(subject: GovernanceSubject, roles: Role[]): GovernanceAction[] {
    const permissions = this.getSubjectPermissions(subject, roles);
    return Array.from(new Set(permissions.map(p => p.action)));
  }

  /**
   * Get engines subject can access
   */
  getSubjectEngines(subject: GovernanceSubject, roles: Role[]): GovernanceEngine[] {
    const permissions = this.getSubjectPermissions(subject, roles);
    const engines = new Set<GovernanceEngine>();

    for (const permission of permissions) {
      if (permission.engines) {
        permission.engines.forEach(e => engines.add(e));
      }
    }

    return Array.from(engines);
  }

  /**
   * Get asset types subject can access
   */
  getSubjectAssetTypes(subject: GovernanceSubject, roles: Role[]): AssetType[] {
    const permissions = this.getSubjectPermissions(subject, roles);
    const assetTypes = new Set<AssetType>();

    for (const permission of permissions) {
      if (permission.assetTypes) {
        permission.assetTypes.forEach(a => assetTypes.add(a));
      }
    }

    return Array.from(assetTypes);
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  /**
   * Check if permission matches action and resource
   */
  private permissionMatches(
    permission: Permission,
    action: GovernanceAction,
    resource: GovernanceResource
  ): boolean {
    // Action must match
    if (permission.action !== action) {
      return false;
    }

    // Scope must match
    if (!this.scopeMatchesPermission(permission, resource)) {
      return false;
    }

    // Engine constraint (if specified)
    if (permission.engines && permission.engines.length > 0) {
      if (!resource.engine || !permission.engines.includes(resource.engine)) {
        return false;
      }
    }

    // Asset type constraint (if specified)
    if (permission.assetTypes && permission.assetTypes.length > 0) {
      if (!resource.assetType || !permission.assetTypes.includes(resource.assetType)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if scope matches
   */
  private scopeMatchesPermission(permission: Permission, resource: GovernanceResource): boolean {
    // Global permissions match everything
    if (permission.scope === 'global') {
      return true;
    }

    // Tenant scope
    if (permission.scope === 'tenant') {
      return permission.tenantId === resource.tenantId;
    }

    // Facility scope
    if (permission.scope === 'facility') {
      return (
        permission.tenantId === resource.tenantId &&
        permission.facilityId === resource.facilityId
      );
    }

    // Room scope
    if (permission.scope === 'room') {
      return (
        permission.tenantId === resource.tenantId &&
        permission.facilityId === resource.facilityId &&
        permission.roomId === resource.roomId
      );
    }

    // Engine scope
    if (permission.scope === 'engine') {
      return permission.tenantId === resource.tenantId;
    }

    // Asset type scope
    if (permission.scope === 'asset-type') {
      return permission.tenantId === resource.tenantId;
    }

    return false;
  }

  /**
   * Check if subject and resource scopes match
   */
  private scopeMatches(subject: GovernanceSubject, resource: GovernanceResource): boolean {
    // Tenant must match
    if (subject.tenantId !== resource.tenantId) {
      return false;
    }

    // If subject is facility-scoped, facility must match
    if (subject.facilityId && resource.facilityId && subject.facilityId !== resource.facilityId) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate permission conditions
   */
  private evaluateConditions(
    conditions: Permission['conditions'],
    subject: GovernanceSubject
  ): { passed: boolean; reasons: string[] } {
    if (!conditions || conditions.length === 0) {
      return { passed: true, reasons: [] };
    }

    const reasons: string[] = [];

    for (const condition of conditions) {
      switch (condition.type) {
        case 'time-window':
          if (!this.evaluateTimeWindow(condition.params)) {
            reasons.push('Action not permitted outside allowed time window');
          }
          break;

        case 'approval-required':
          if (!this.evaluateApprovalRequired(condition.params, subject)) {
            reasons.push('Action requires approval before execution');
          }
          break;

        case 'training-required':
          if (!this.evaluateTrainingRequired(condition.params, subject)) {
            reasons.push('Subject must complete required training before performing this action');
          }
          break;

        case 'compliance-status':
          if (!this.evaluateComplianceStatus(condition.params, subject)) {
            reasons.push('Subject does not meet compliance requirements for this action');
          }
          break;
      }
    }

    return {
      passed: reasons.length === 0,
      reasons
    };
  }

  /**
   * Evaluate time window condition
   */
  private evaluateTimeWindow(params: Record<string, unknown>): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

    if (params.startHour !== undefined && params.endHour !== undefined) {
      const startHour = Number(params.startHour);
      const endHour = Number(params.endHour);
      if (currentHour < startHour || currentHour >= endHour) {
        return false;
      }
    }

    if (params.allowedDays !== undefined) {
      const allowedDays = params.allowedDays as number[];
      if (!allowedDays.includes(currentDay)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate approval required condition
   */
  private evaluateApprovalRequired(params: Record<string, unknown>, subject: GovernanceSubject): boolean {
    // In a real implementation, this would check if the subject has received approval
    // For now, we return false to indicate approval is required
    return params.approved === true;
  }

  /**
   * Evaluate training required condition
   */
  private evaluateTrainingRequired(params: Record<string, unknown>, subject: GovernanceSubject): boolean {
    // In a real implementation, this would check the subject's training records
    // For now, we assume training is complete if explicitly marked
    return params.trainingComplete === true;
  }

  /**
   * Evaluate compliance status condition
   */
  private evaluateComplianceStatus(params: Record<string, unknown>, subject: GovernanceSubject): boolean {
    // In a real implementation, this would check compliance records
    // For now, we assume compliance is met if explicitly marked
    return params.compliant === true;
  }
}

// ============================================================================
// PERMISSION UTILITIES
// ============================================================================

/**
 * Create a permission
 */
export function createPermission(
  action: GovernanceAction,
  scope: PermissionScope,
  description: string,
  tenantId?: string,
  facilityId?: string,
  roomId?: string
): Permission {
  return {
    id: `perm-${action}-${scope}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    action,
    scope,
    tenantId,
    facilityId,
    roomId,
    description
  };
}

/**
 * Check if two permissions are equivalent
 */
export function permissionsEqual(p1: Permission, p2: Permission): boolean {
  return (
    p1.action === p2.action &&
    p1.scope === p2.scope &&
    p1.tenantId === p2.tenantId &&
    p1.facilityId === p2.facilityId &&
    p1.roomId === p2.roomId
  );
}

/**
 * Merge permissions (remove duplicates)
 */
export function mergePermissions(permissions: Permission[]): Permission[] {
  const unique: Permission[] = [];

  for (const perm of permissions) {
    if (!unique.some(u => permissionsEqual(u, perm))) {
      unique.push(perm);
    }
  }

  return unique;
}

/**
 * Group permissions by action
 */
export function groupPermissionsByAction(permissions: Permission[]): Record<GovernanceAction, Permission[]> {
  const grouped: Partial<Record<GovernanceAction, Permission[]>> = {};

  for (const perm of permissions) {
    if (!grouped[perm.action]) {
      grouped[perm.action] = [];
    }
    grouped[perm.action]!.push(perm);
  }

  return grouped as Record<GovernanceAction, Permission[]>;
}

/**
 * Group permissions by scope
 */
export function groupPermissionsByScope(permissions: Permission[]): Record<PermissionScope, Permission[]> {
  const grouped: Partial<Record<PermissionScope, Permission[]>> = {};

  for (const perm of permissions) {
    if (!grouped[perm.scope]) {
      grouped[perm.scope] = [];
    }
    grouped[perm.scope]!.push(perm);
  }

  return grouped as Record<PermissionScope, Permission[]>;
}
