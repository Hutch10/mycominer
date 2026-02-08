/**
 * Phase 44: System Governance - Role Registry
 * 
 * Manages role definitions, role-permission mappings, and role lifecycle.
 * All operations are admin-only and fully audited.
 */

import {
  Role,
  Permission,
  PermissionScope,
  GovernanceAction,
  RoleTemplate
} from './governanceTypes';

// ============================================================================
// ROLE REGISTRY CLASS
// ============================================================================

export class RoleRegistry {
  private roles: Map<string, Role> = new Map();
  private tenantId: string;
  private facilityId?: string;

  constructor(tenantId: string = 'default-tenant', facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
    this.initializeBuiltInRoles();
  }

  /**
   * Create a new role (admin-only)
   */
  createRole(role: Partial<Role> & { name: string; description: string; scope: PermissionScope }): Role {
    const newRole: Role = {
      id: role.id || `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: role.name,
      description: role.description,
      tenantId: role.tenantId || this.tenantId,
      facilityId: role.facilityId || this.facilityId,
      scope: role.scope,
      permissions: role.permissions || [],
      policyPackIds: role.policyPackIds || [],
      active: role.active !== undefined ? role.active : true
    };

    this.roles.set(newRole.id, newRole);
    return newRole;
  }

  /**
   * Update an existing role (admin-only)
   */
  updateRole(
    roleId: string,
    updates: Partial<Pick<Role, 'name' | 'description' | 'permissions' | 'policyPackIds' | 'active'>>
  ): Role | null {
    const role = this.roles.get(roleId);
    if (!role) return null;

    const updatedRole: Role = {
      ...role,
      ...updates
    };

    this.roles.set(roleId, updatedRole);
    return updatedRole;
  }

  /**
   * Deactivate a role (admin-only)
   */
  deactivateRole(roleId: string): Role | null {
    const role = this.roles.get(roleId);
    if (!role) return null;

    const updatedRole: Role = {
      ...role,
      active: false
    };

    this.roles.set(roleId, updatedRole);
    return updatedRole;
  }

  /**
   * Get role by ID
   */
  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  /**
   * Get all roles
   */
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Get active roles
   */
  getActiveRoles(): Role[] {
    return Array.from(this.roles.values()).filter(r => r.active);
  }

  /**
   * Get roles by scope
   */
  getRolesByScope(scope: PermissionScope): Role[] {
    return Array.from(this.roles.values()).filter(r => r.scope === scope);
  }

  /**
   * Get roles by tenant
   */
  getRolesByTenant(tenantId: string): Role[] {
    return Array.from(this.roles.values()).filter(r => r.tenantId === tenantId);
  }

  /**
   * Get roles by facility
   */
  getRolesByFacility(facilityId: string): Role[] {
    return Array.from(this.roles.values()).filter(r => r.facilityId === facilityId);
  }

  /**
   * Add permission to role
   */
  addPermissionToRole(roleId: string, permission: Permission): Role | null {
    const role = this.roles.get(roleId);
    if (!role) return null;

    const updatedRole: Role = {
      ...role,
      permissions: [...role.permissions, permission]
    };

    this.roles.set(roleId, updatedRole);
    return updatedRole;
  }

  /**
   * Remove permission from role
   */
  removePermissionFromRole(roleId: string, permissionId: string): Role | null {
    const role = this.roles.get(roleId);
    if (!role) return null;

    const updatedRole: Role = {
      ...role,
      permissions: role.permissions.filter(p => p.id !== permissionId)
    };

    this.roles.set(roleId, updatedRole);
    return updatedRole;
  }

  /**
   * Assign policy pack to role
   */
  assignPolicyPack(roleId: string, policyPackId: string): Role | null {
    const role = this.roles.get(roleId);
    if (!role) return null;

    const currentPolicyPackIds = role.policyPackIds || [];
    if (currentPolicyPackIds.includes(policyPackId)) {
      return role; // Already assigned
    }

    const updatedRole: Role = {
      ...role,
      policyPackIds: [...currentPolicyPackIds, policyPackId]
    };

    this.roles.set(roleId, updatedRole);
    return updatedRole;
  }

  /**
   * Remove policy pack from role
   */
  removePolicyPack(roleId: string, policyPackId: string): Role | null {
    const role = this.roles.get(roleId);
    if (!role) return null;

    const updatedRole: Role = {
      ...role,
      policyPackIds: (role.policyPackIds || []).filter(id => id !== policyPackId)
    };

    this.roles.set(roleId, updatedRole);
    return updatedRole;
  }

  // ==========================================================================
  // BUILT-IN ROLES
  // ==========================================================================

  private initializeBuiltInRoles(): void {
    // Operator role
    this.roles.set('role-operator', createOperatorRole(this.tenantId, this.facilityId));
    
    // Supervisor role
    this.roles.set('role-supervisor', createSupervisorRole(this.tenantId, this.facilityId));
    
    // Facility Admin role
    this.roles.set('role-facility-admin', createFacilityAdminRole(this.tenantId, this.facilityId));
    
    // Tenant Admin role
    this.roles.set('role-tenant-admin', createTenantAdminRole(this.tenantId));
    
    // Compliance Officer role
    this.roles.set('role-compliance-officer', createComplianceOfficerRole(this.tenantId, this.facilityId));
    
    // Read-Only Auditor role
    this.roles.set('role-read-only-auditor', createReadOnlyAuditorRole(this.tenantId, this.facilityId));
    
    // Integration Service role
    this.roles.set('role-integration-service', createIntegrationServiceRole(this.tenantId));
    
    // Training Coordinator role
    this.roles.set('role-training-coordinator', createTrainingCoordinatorRole(this.tenantId, this.facilityId));
    
    // Marketplace Publisher role
    this.roles.set('role-marketplace-publisher', createMarketplacePublisherRole(this.tenantId));
    
    // Analytics Specialist role
    this.roles.set('role-analytics-specialist', createAnalyticsSpecialistRole(this.tenantId, this.facilityId));
  }
}

// ============================================================================
// ROLE FACTORIES
// ============================================================================

function createOperatorRole(tenantId: string, facilityId?: string): Role {
  return {
    id: 'role-operator',
    name: 'Operator',
    description: 'Standard facility operator with basic viewing and execution permissions',
    tenantId,
    facilityId,
    scope: 'facility',
    permissions: [
      createPermission('timeline:view-events', 'facility', 'View production timeline', tenantId, facilityId),
      createPermission('workflow:view-status', 'facility', 'View workflow status', tenantId, facilityId),
      createPermission('training:view-progress', 'facility', 'View training materials', tenantId, facilityId),
      createPermission('marketplace:publish-template', 'tenant', 'Browse marketplace', tenantId)
    ],
    policyPackIds: [],
    active: true
  };
}

function createSupervisorRole(tenantId: string, facilityId?: string): Role {
  return {
    id: 'role-supervisor',
    name: 'Supervisor',
    description: 'Facility supervisor with analytics, health monitoring, and incident management permissions',
    tenantId,
    facilityId,
    scope: 'facility',
    permissions: [
      // All operator permissions
      ...createOperatorRole(tenantId, facilityId).permissions,
      // Additional permissions
      createPermission('analytics:view-dashboards', 'facility', 'View analytics dashboards', tenantId, facilityId),
      createPermission('analytics:run-queries', 'facility', 'Run analytics queries', tenantId, facilityId),
      createPermission('timeline:create-incident', 'facility', 'Create incidents', tenantId, facilityId),
      createPermission('timeline:view-events', 'facility', 'View timeline events', tenantId, facilityId),
      createPermission('sop:view-all', 'facility', 'View SOPs', tenantId, facilityId),
      createPermission('workflow:view-status', 'facility', 'View workflows', tenantId, facilityId)
    ],
    policyPackIds: [],
    active: true
  };
}

function createFacilityAdminRole(tenantId: string, facilityId?: string): Role {
  return {
    id: 'role-facility-admin',
    name: 'Facility Admin',
    description: 'Facility administrator with full facility management permissions',
    tenantId,
    facilityId,
    scope: 'facility',
    permissions: [
      // All supervisor permissions
      ...createSupervisorRole(tenantId, facilityId).permissions,
      // Additional permissions
      createPermission('sop:approve-changes', 'facility', 'Approve SOPs', tenantId, facilityId),
      createPermission('workflow:approve-step', 'facility', 'Approve workflows', tenantId, facilityId),
      createPermission('tenant:manage-facilities', 'facility', 'Configure facility settings', tenantId, facilityId),
      createPermission('timeline:modify-events', 'facility', 'Modify timeline events', tenantId, facilityId),
      createPermission('compliance:modify-capa', 'facility', 'Modify CAPA records', tenantId, facilityId),
      createPermission('compliance:view-records', 'facility', 'View compliance records', tenantId, facilityId)
    ],
    policyPackIds: [],
    active: true
  };
}

function createTenantAdminRole(tenantId: string): Role {
  return {
    id: 'role-tenant-admin',
    name: 'Tenant Admin',
    description: 'Tenant administrator with full tenant-wide permissions',
    tenantId,
    scope: 'tenant',
    permissions: [
      // All facility admin permissions (tenant-scoped)
      createPermission('timeline:view-events', 'tenant', 'View all timelines', tenantId),
      createPermission('analytics:view-dashboards', 'tenant', 'View all analytics', tenantId),
      createPermission('compliance:view-records', 'tenant', 'View all compliance records', tenantId),
      createPermission('tenant:manage-roles', 'tenant', 'Manage roles', tenantId),
      createPermission('tenant:manage-users', 'tenant', 'Manage users', tenantId),
      createPermission('tenant:manage-facilities', 'tenant', 'Manage all facilities', tenantId),
      createPermission('analytics:export-data', 'tenant', 'Export compliance data', tenantId)
    ],
    policyPackIds: [],
    active: true
  };
}

function createComplianceOfficerRole(tenantId: string, facilityId?: string): Role {
  return {
    id: 'role-compliance-officer',
    name: 'Compliance Officer',
    description: 'Compliance specialist with full compliance and audit permissions',
    tenantId,
    facilityId,
    scope: facilityId ? 'facility' : 'tenant',
    permissions: [
      createPermission('compliance:view-records', facilityId ? 'facility' : 'tenant', 'View compliance records', tenantId, facilityId),
      createPermission('compliance:run-audit', facilityId ? 'facility' : 'tenant', 'Run compliance audits', tenantId, facilityId),
      createPermission('compliance:modify-capa', facilityId ? 'facility' : 'tenant', 'Modify CAPA records', tenantId, facilityId),
      createPermission('analytics:export-data', facilityId ? 'facility' : 'tenant', 'Export compliance data', tenantId, facilityId),
      createPermission('timeline:view-events', facilityId ? 'facility' : 'tenant', 'View timelines for audit', tenantId, facilityId),
      createPermission('analytics:view-dashboards', facilityId ? 'facility' : 'tenant', 'View analytics for compliance', tenantId, facilityId)
    ],
    policyPackIds: [],
    active: true
  };
}

function createReadOnlyAuditorRole(tenantId: string, facilityId?: string): Role {
  return {
    id: 'role-read-only-auditor',
    name: 'Read-Only Auditor',
    description: 'External auditor with read-only access to all systems',
    tenantId,
    facilityId,
    scope: facilityId ? 'facility' : 'tenant',
    permissions: [
      createPermission('timeline:view-events', facilityId ? 'facility' : 'tenant', 'View timelines', tenantId, facilityId),
      createPermission('analytics:view-dashboards', facilityId ? 'facility' : 'tenant', 'View analytics', tenantId, facilityId),
      createPermission('training:view-progress', facilityId ? 'facility' : 'tenant', 'View training', tenantId, facilityId),
      createPermission('compliance:view-records', facilityId ? 'facility' : 'tenant', 'View compliance', tenantId, facilityId),
      createPermission('sop:view-all', facilityId ? 'facility' : 'tenant', 'View SOPs', tenantId, facilityId),
      createPermission('workflow:view-status', facilityId ? 'facility' : 'tenant', 'View workflows', tenantId, facilityId)
    ],
    policyPackIds: [],
    active: true
  };
}

function createIntegrationServiceRole(tenantId: string): Role {
  return {
    id: 'role-integration-service',
    name: 'Integration Service',
    description: 'Service account for external integrations',
    tenantId,
    scope: 'tenant',
    permissions: [
      createPermission('api:read-data', 'tenant', 'Read timeline data', tenantId),
      createPermission('api:export-reports', 'tenant', 'Read analytics data', tenantId),
      createPermission('compliance:view-records', 'tenant', 'Read compliance data', tenantId),
      createPermission('analytics:export-data', 'tenant', 'Export data for integration', tenantId)
    ],
    policyPackIds: [],
    active: true
  };
}

function createTrainingCoordinatorRole(tenantId: string, facilityId?: string): Role {
  return {
    id: 'role-training-coordinator',
    name: 'Training Coordinator',
    description: 'Training specialist with full training management permissions',
    tenantId,
    facilityId,
    scope: facilityId ? 'facility' : 'tenant',
    permissions: [
      createPermission('training:view-progress', facilityId ? 'facility' : 'tenant', 'View training', tenantId, facilityId),
      createPermission('training:create-modules', facilityId ? 'facility' : 'tenant', 'Create training modules', tenantId, facilityId),
      createPermission('training:assign-users', facilityId ? 'facility' : 'tenant', 'Assign training to users', tenantId, facilityId),
      createPermission('training:issue-certificates', facilityId ? 'facility' : 'tenant', 'Issue training certificates', tenantId, facilityId),
      createPermission('analytics:view-dashboards', facilityId ? 'facility' : 'tenant', 'View training analytics', tenantId, facilityId),
      createPermission('timeline:view-events', facilityId ? 'facility' : 'tenant', 'View training history', tenantId, facilityId)
    ],
    policyPackIds: [],
    active: true
  };
}

function createMarketplacePublisherRole(tenantId: string): Role {
  return {
    id: 'role-marketplace-publisher',
    name: 'Marketplace Publisher',
    description: 'Publisher with marketplace asset management permissions',
    tenantId,
    scope: 'tenant',
    permissions: [
      createPermission('marketplace:publish-sop', 'tenant', 'Publish SOPs', tenantId),
      createPermission('marketplace:publish-template', 'tenant', 'Publish templates', tenantId),
      createPermission('marketplace:publish-analytics', 'tenant', 'Publish analytics', tenantId),
      createPermission('marketplace:manage-listings', 'tenant', 'Manage marketplace listings', tenantId),
      createPermission('analytics:view-dashboards', 'tenant', 'View asset analytics', tenantId)
    ],
    policyPackIds: [],
    active: true
  };
}

function createAnalyticsSpecialistRole(tenantId: string, facilityId?: string): Role {
  return {
    id: 'role-analytics-specialist',
    name: 'Analytics Specialist',
    description: 'Analytics expert with advanced analytics and insights permissions',
    tenantId,
    facilityId,
    scope: facilityId ? 'facility' : 'tenant',
    permissions: [
      createPermission('analytics:view-dashboards', facilityId ? 'facility' : 'tenant', 'View analytics', tenantId, facilityId),
      createPermission('analytics:run-queries', facilityId ? 'facility' : 'tenant', 'Run analytics queries', tenantId, facilityId),
      createPermission('analytics:create-custom', facilityId ? 'facility' : 'tenant', 'Create custom analytics', tenantId, facilityId),
      createPermission('analytics:export-data', facilityId ? 'facility' : 'tenant', 'Export analytics data', tenantId, facilityId),
      createPermission('timeline:view-events', facilityId ? 'facility' : 'tenant', 'View timeline data', tenantId, facilityId)
    ],
    policyPackIds: [],
    active: true
  };
}

// ============================================================================
// PERMISSION HELPER
// ============================================================================

function createPermission(
  action: GovernanceAction,
  scope: PermissionScope,
  description: string,
  tenantId?: string,
  facilityId?: string
): Permission {
  return {
    id: `perm-${action}-${scope}-${Date.now()}`,
    action,
    scope,
    tenantId,
    facilityId,
    description
  };
}

// ============================================================================
// ROLE TEMPLATE FACTORY
// ============================================================================

export function createRoleFromTemplate(
  template: RoleTemplate,
  tenantId: string,
  facilityId?: string
): Role {
  switch (template) {
    case 'operator':
      return createOperatorRole(tenantId, facilityId);
    case 'supervisor':
      return createSupervisorRole(tenantId, facilityId);
    case 'facility-admin':
      return createFacilityAdminRole(tenantId, facilityId);
    case 'tenant-admin':
      return createTenantAdminRole(tenantId);
    case 'compliance-officer':
      return createComplianceOfficerRole(tenantId, facilityId);
    case 'read-only-auditor':
      return createReadOnlyAuditorRole(tenantId, facilityId);
    case 'integration-service':
      return createIntegrationServiceRole(tenantId);
    case 'training-coordinator':
      return createTrainingCoordinatorRole(tenantId, facilityId);
    case 'marketplace-publisher':
      return createMarketplacePublisherRole(tenantId);
    case 'analytics-specialist':
      return createAnalyticsSpecialistRole(tenantId, facilityId);
    default:
      throw new Error(`Unknown role template: ${template}`);
  }
}
