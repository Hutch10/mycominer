/**
 * Phase 44: System Governance - Policy Pack Library
 * 
 * Pre-built, reusable policy packs for common governance scenarios.
 * Policy packs bundle roles, permissions, and constraints for specific use cases.
 */

import {
  PolicyPack,
  PolicyPackRule,
  GovernanceAction
} from './governanceTypes';

// ============================================================================
// POLICY PACK LIBRARY CLASS
// ============================================================================

export class PolicyPackLibrary {
  private packs: Map<string, PolicyPack> = new Map();

  constructor() {
    this.initializeBuiltInPacks();
  }

  /**
   * Get all policy packs
   */
  getAllPacks(): PolicyPack[] {
    return Array.from(this.packs.values());
  }

  /**
   * Get active policy packs
   */
  getActivePacks(): PolicyPack[] {
    return this.getAllPacks().filter(p => p.active);
  }

  /**
   * Get policy pack by ID
   */
  getPack(id: string): PolicyPack | undefined {
    return this.packs.get(id);
  }

  /**
   * Add or update policy pack
   */
  setPack(pack: PolicyPack): void {
    this.packs.set(pack.id, pack);
  }

  /**
   * Deactivate policy pack
   */
  deactivatePack(id: string): void {
    const pack = this.packs.get(id);
    if (pack) {
      pack.active = false;
    }
  }

  /**
   * Export policy pack
   */
  exportPack(id: string): string | undefined {
    const pack = this.packs.get(id);
    return pack ? JSON.stringify(pack, null, 2) : undefined;
  }

  /**
   * Import policy pack
   */
  importPack(json: string): PolicyPack {
    const pack = JSON.parse(json) as PolicyPack;
    this.packs.set(pack.id, pack);
    return pack;
  }

  // ==========================================================================
  // BUILT-IN POLICY PACKS
  // ==========================================================================

  private initializeBuiltInPacks(): void {
    this.packs.set('gmp-facility-operator', this.createGMPFacilityOperatorPack());
    this.packs.set('compliance-oversight', this.createComplianceOversightPack());
    this.packs.set('readonly-auditor', this.createReadOnlyAuditorPack());
    this.packs.set('integration-service', this.createIntegrationServicePack());
    this.packs.set('training-coordinator', this.createTrainingCoordinatorPack());
    this.packs.set('marketplace-publisher', this.createMarketplacePublisherPack());
    this.packs.set('analytics-specialist', this.createAnalyticsSpecialistPack());
    this.packs.set('tenant-admin', this.createTenantAdminPack());
  }

  private createGMPFacilityOperatorPack(): PolicyPack {
    return {
      id: 'gmp-facility-operator',
      name: 'GMP Facility Operator Pack',
      description: 'Full operational control of a GMP-compliant facility, with strict audit and approval requirements',
      scope: 'facility',
      active: true,
      rules: [
        {
          id: 'rule-1',
          action: 'workflow:execute-task',
          requiredRoleIds: ['facility-admin', 'supervisor'],
          requiredConditions: [
            {
              type: 'training-required',
              params: { trainingModuleId: 'gmp-basics' }
            }
          ],
          description: 'Execute workflow tasks after completing GMP training'
        },
        {
          id: 'rule-2',
          action: 'compliance:modify-capa',
          requiredRoleIds: ['facility-admin', 'compliance-officer'],
          requiredConditions: [
            {
              type: 'approval-required',
              params: { approverRole: 'compliance-officer' }
            }
          ],
          description: 'Modify CAPA records with compliance officer approval'
        },
        {
          id: 'rule-3',
          action: 'sop:modify-version',
          requiredRoleIds: ['facility-admin'],
          requiredConditions: [
            {
              type: 'approval-required',
              params: { approverRole: 'tenant-admin' }
            }
          ],
          description: 'Modify SOP versions with tenant admin approval'
        },
        {
          id: 'rule-4',
          action: 'timeline:create-incident',
          requiredRoleIds: ['facility-admin', 'supervisor', 'operator'],
          requiredConditions: [],
          description: 'Any facility staff can create incident records'
        }
      ],
      metadata: {
        industryStandard: 'GMP',
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  private createComplianceOversightPack(): PolicyPack {
    return {
      id: 'compliance-oversight',
      name: 'Compliance Oversight Pack',
      description: 'Full compliance monitoring and reporting for auditors and officers',
      scope: 'tenant',
      active: true,
      rules: [
        {
          id: 'rule-1',
          action: 'compliance:view-records',
          requiredRoleIds: ['compliance-officer', 'readonly-auditor'],
          requiredConditions: [],
          description: 'View all compliance records'
        },
        {
          id: 'rule-2',
          action: 'compliance:modify-capa',
          requiredRoleIds: ['compliance-officer'],
          requiredConditions: [],
          description: 'Modify CAPA records'
        },
        {
          id: 'rule-3',
          action: 'compliance:run-audit',
          requiredRoleIds: ['compliance-officer', 'readonly-auditor'],
          requiredConditions: [],
          description: 'Run compliance audits'
        },
        {
          id: 'rule-4',
          action: 'sop:view-all',
          requiredRoleIds: ['compliance-officer', 'readonly-auditor'],
          requiredConditions: [],
          description: 'View all SOPs'
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  private createReadOnlyAuditorPack(): PolicyPack {
    return {
      id: 'readonly-auditor',
      name: 'Read-Only Auditor Pack',
      description: 'View-only access to all tenant data for auditing and inspection',
      scope: 'tenant',
      active: true,
      rules: [
        {
          id: 'rule-1',
          action: 'compliance:view-records',
          requiredRoleIds: ['readonly-auditor'],
          requiredConditions: [],
          description: 'View compliance records'
        },
        {
          id: 'rule-2',
          action: 'timeline:view-events',
          requiredRoleIds: ['readonly-auditor'],
          requiredConditions: [],
          description: 'View timeline events'
        },
        {
          id: 'rule-3',
          action: 'workflow:view-status',
          requiredRoleIds: ['readonly-auditor'],
          requiredConditions: [],
          description: 'View workflow status'
        },
        {
          id: 'rule-4',
          action: 'analytics:view-dashboards',
          requiredRoleIds: ['readonly-auditor'],
          requiredConditions: [],
          description: 'View analytics dashboards'
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  private createIntegrationServicePack(): PolicyPack {
    return {
      id: 'integration-service',
      name: 'Integration Service Pack',
      description: 'API access for external integrations and automation',
      scope: 'tenant',
      active: true,
      rules: [
        {
          id: 'rule-1',
          action: 'api:read-data',
          requiredRoleIds: ['integration-service'],
          requiredConditions: [],
          description: 'Read data via API'
        },
        {
          id: 'rule-2',
          action: 'api:write-data',
          requiredRoleIds: ['integration-service'],
          requiredConditions: [
            {
              type: 'approval-required',
              params: { approverRole: 'tenant-admin' }
            }
          ],
          description: 'Write data via API with approval'
        },
        {
          id: 'rule-3',
          action: 'api:export-reports',
          requiredRoleIds: ['integration-service'],
          requiredConditions: [],
          description: 'Export reports via API'
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  private createTrainingCoordinatorPack(): PolicyPack {
    return {
      id: 'training-coordinator',
      name: 'Training Coordinator Pack',
      description: 'Manage training modules, track completion, and issue certifications',
      scope: 'tenant',
      active: true,
      rules: [
        {
          id: 'rule-1',
          action: 'training:create-modules',
          requiredRoleIds: ['training-coordinator'],
          requiredConditions: [],
          description: 'Create training modules'
        },
        {
          id: 'rule-2',
          action: 'training:assign-users',
          requiredRoleIds: ['training-coordinator'],
          requiredConditions: [],
          description: 'Assign training to users'
        },
        {
          id: 'rule-3',
          action: 'training:issue-certificates',
          requiredRoleIds: ['training-coordinator'],
          requiredConditions: [],
          description: 'Issue training certificates'
        },
        {
          id: 'rule-4',
          action: 'training:view-progress',
          requiredRoleIds: ['training-coordinator'],
          requiredConditions: [],
          description: 'View training progress'
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  private createMarketplacePublisherPack(): PolicyPack {
    return {
      id: 'marketplace-publisher',
      name: 'Marketplace Publisher Pack',
      description: 'Publish and manage marketplace content (SOPs, templates, analytics)',
      scope: 'tenant',
      active: true,
      rules: [
        {
          id: 'rule-1',
          action: 'marketplace:publish-sop',
          requiredRoleIds: ['marketplace-publisher'],
          requiredConditions: [],
          description: 'Publish SOPs to marketplace'
        },
        {
          id: 'rule-2',
          action: 'marketplace:publish-template',
          requiredRoleIds: ['marketplace-publisher'],
          requiredConditions: [],
          description: 'Publish templates to marketplace'
        },
        {
          id: 'rule-3',
          action: 'marketplace:publish-analytics',
          requiredRoleIds: ['marketplace-publisher'],
          requiredConditions: [],
          description: 'Publish analytics to marketplace'
        },
        {
          id: 'rule-4',
          action: 'marketplace:manage-listings',
          requiredRoleIds: ['marketplace-publisher'],
          requiredConditions: [],
          description: 'Manage marketplace listings'
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  private createAnalyticsSpecialistPack(): PolicyPack {
    return {
      id: 'analytics-specialist',
      name: 'Analytics Specialist Pack',
      description: 'Advanced analytics creation, custom queries, and data export',
      scope: 'tenant',
      active: true,
      rules: [
        {
          id: 'rule-1',
          action: 'analytics:create-custom',
          requiredRoleIds: ['analytics-specialist'],
          requiredConditions: [],
          description: 'Create custom analytics'
        },
        {
          id: 'rule-2',
          action: 'analytics:run-queries',
          requiredRoleIds: ['analytics-specialist'],
          requiredConditions: [],
          description: 'Run custom queries'
        },
        {
          id: 'rule-3',
          action: 'analytics:export-data',
          requiredRoleIds: ['analytics-specialist'],
          requiredConditions: [],
          description: 'Export analytics data'
        },
        {
          id: 'rule-4',
          action: 'analytics:view-dashboards',
          requiredRoleIds: ['analytics-specialist'],
          requiredConditions: [],
          description: 'View all dashboards'
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  private createTenantAdminPack(): PolicyPack {
    return {
      id: 'tenant-admin',
      name: 'Tenant Admin Pack',
      description: 'Full tenant administration including users, roles, and facilities',
      scope: 'tenant',
      active: true,
      rules: [
        {
          id: 'rule-1',
          action: 'tenant:manage-users',
          requiredRoleIds: ['tenant-admin'],
          requiredConditions: [],
          description: 'Manage tenant users'
        },
        {
          id: 'rule-2',
          action: 'tenant:manage-roles',
          requiredRoleIds: ['tenant-admin'],
          requiredConditions: [],
          description: 'Manage tenant roles'
        },
        {
          id: 'rule-3',
          action: 'tenant:manage-facilities',
          requiredRoleIds: ['tenant-admin'],
          requiredConditions: [],
          description: 'Manage facilities'
        },
        {
          id: 'rule-4',
          action: 'tenant:view-billing',
          requiredRoleIds: ['tenant-admin'],
          requiredConditions: [],
          description: 'View billing information'
        },
        {
          id: 'rule-5',
          action: 'governance:manage-policy-packs',
          requiredRoleIds: ['tenant-admin'],
          requiredConditions: [],
          description: 'Manage policy packs'
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }
}

// ============================================================================
// POLICY PACK UTILITIES
// ============================================================================

/**
 * Create a custom policy pack
 */
export function createPolicyPack(
  id: string,
  name: string,
  description: string,
  scope: PolicyPack['scope'],
  rules: PolicyPackRule[]
): PolicyPack {
  return {
    id,
    name,
    description,
    scope,
    rules,
    active: true,
    metadata: {
      createdAt: new Date().toISOString(),
      version: '1.0.0'
    }
  };
}

/**
 * Check if policy pack applies to action
 */
export function policyPackAppliesToAction(pack: PolicyPack, action: GovernanceAction): boolean {
  return pack.rules.some(r => r.action === action);
}

/**
 * Get required roles for action in policy pack
 */
export function getRequiredRolesForAction(pack: PolicyPack, action: GovernanceAction): string[] {
  const rule = pack.rules.find(r => r.action === action);
  return rule?.requiredRoleIds || [];
}

/**
 * Get required conditions for action in policy pack
 */
export function getRequiredConditionsForAction(pack: PolicyPack, action: GovernanceAction): PolicyPackRule['requiredConditions'] {
  const rule = pack.rules.find(r => r.action === action);
  return rule?.requiredConditions || [];
}
