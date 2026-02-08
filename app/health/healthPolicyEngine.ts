/**
 * Phase 43: System Health - Health Policy Engine
 * 
 * Enforces tenant isolation, federation rules, asset-type constraints,
 * cross-engine consistency, and compliance alignment.
 * All operations are read-only policy evaluations.
 */

import {
  HealthPolicy,
  HealthPolicyRule,
  HealthPolicyEvaluation,
  HealthPolicyRuleViolation,
  AffectedItem,
  HealthSeverity
} from './healthTypes';

// ============================================================================
// HEALTH POLICY ENGINE CLASS
// ============================================================================

export class HealthPolicyEngine {
  private policies: Map<string, HealthPolicy> = new Map();
  private tenantId: string;
  private facilityId?: string;

  constructor(tenantId: string, facilityId?: string) {
    this.tenantId = tenantId;
    this.facilityId = facilityId;
    this.initializeDefaultPolicies();
  }

  /**
   * Load custom policies
   */
  loadPolicies(policies: HealthPolicy[]): void {
    policies.forEach(policy => {
      if (policy.enabled) {
        this.policies.set(policy.id, policy);
      }
    });
  }

  /**
   * Evaluate all applicable policies
   */
  evaluateAll(context: Record<string, unknown>): HealthPolicyEvaluation[] {
    const evaluations: HealthPolicyEvaluation[] = [];

    for (const policy of this.policies.values()) {
      if (this.isPolicyApplicable(policy)) {
        const evaluation = this.evaluatePolicy(policy, context);
        evaluations.push(evaluation);
      }
    }

    return evaluations;
  }

  /**
   * Evaluate a specific policy
   */
  evaluatePolicy(
    policy: HealthPolicy,
    context: Record<string, unknown>
  ): HealthPolicyEvaluation {
    const violations: HealthPolicyRuleViolation[] = [];
    let evaluatedAssets = 0;

    for (const rule of policy.rules) {
      const ruleViolation = this.evaluateRule(rule, context);
      if (ruleViolation) {
        violations.push(ruleViolation);
      }
      evaluatedAssets++;
    }

    return {
      policyId: policy.id,
      timestamp: new Date().toISOString(),
      tenantId: this.tenantId,
      facilityId: this.facilityId,
      passed: violations.length === 0,
      violatedRules: violations,
      evaluatedAssets,
      context: {
        policyName: policy.name,
        policyType: policy.policyType,
        totalRules: policy.rules.length
      }
    };
  }

  // ==========================================================================
  // TENANT ISOLATION POLICIES
  // ==========================================================================

  /**
   * Check tenant isolation
   */
  checkTenantIsolation(
    resources: unknown[],
    expectedTenantId: string
  ): HealthPolicyRuleViolation | null {
    const affectedItems: AffectedItem[] = [];

    for (const resource of resources) {
      const resourceData = resource as Record<string, unknown>;
      const resourceTenantId = String(resourceData.tenantId || '');

      if (resourceTenantId !== expectedTenantId) {
        affectedItems.push({
          type: String(resourceData.type || 'resource'),
          id: String(resourceData.id),
          name: String(resourceData.name || resourceData.id),
          issue: `Resource belongs to tenant ${resourceTenantId}, expected ${expectedTenantId}`
        });
      }
    }

    if (affectedItems.length > 0) {
      return {
        ruleId: 'tenant-isolation-001',
        severity: 'critical',
        violationMessage: `Tenant isolation violated: ${affectedItems.length} resource(s) belong to wrong tenant`,
        affectedAssets: affectedItems
      };
    }

    return null;
  }

  /**
   * Check facility isolation
   */
  checkFacilityIsolation(
    resources: unknown[],
    expectedFacilityId?: string
  ): HealthPolicyRuleViolation | null {
    if (!expectedFacilityId) return null;

    const affectedItems: AffectedItem[] = [];

    for (const resource of resources) {
      const resourceData = resource as Record<string, unknown>;
      const resourceFacilityId = String(resourceData.facilityId || '');

      if (resourceFacilityId && resourceFacilityId !== expectedFacilityId) {
        affectedItems.push({
          type: String(resourceData.type || 'resource'),
          id: String(resourceData.id),
          name: String(resourceData.name || resourceData.id),
          issue: `Resource belongs to facility ${resourceFacilityId}, expected ${expectedFacilityId}`
        });
      }
    }

    if (affectedItems.length > 0) {
      return {
        ruleId: 'facility-isolation-001',
        severity: 'high',
        violationMessage: `Facility isolation violated: ${affectedItems.length} resource(s) belong to wrong facility`,
        affectedAssets: affectedItems
      };
    }

    return null;
  }

  // ==========================================================================
  // FEDERATION POLICIES
  // ==========================================================================

  /**
   * Check federation sharing rules
   */
  checkFederationRules(
    sharedResources: unknown[],
    federationConfig: {
      allowedTenants: Set<string>;
      allowedResourceTypes: Set<string>;
      requireApproval: boolean;
    }
  ): HealthPolicyRuleViolation | null {
    const affectedItems: AffectedItem[] = [];

    for (const resource of sharedResources) {
      const resourceData = resource as Record<string, unknown>;
      const targetTenantId = String(resourceData.targetTenantId || '');
      const resourceType = String(resourceData.type || '');
      const approved = Boolean(resourceData.federationApproved);

      if (!federationConfig.allowedTenants.has(targetTenantId)) {
        affectedItems.push({
          type: resourceType,
          id: String(resourceData.id),
          name: String(resourceData.name || resourceData.id),
          issue: `Sharing with unauthorized tenant: ${targetTenantId}`
        });
      }

      if (!federationConfig.allowedResourceTypes.has(resourceType)) {
        affectedItems.push({
          type: resourceType,
          id: String(resourceData.id),
          name: String(resourceData.name || resourceData.id),
          issue: `Resource type ${resourceType} not allowed for federation`
        });
      }

      if (federationConfig.requireApproval && !approved) {
        affectedItems.push({
          type: resourceType,
          id: String(resourceData.id),
          name: String(resourceData.name || resourceData.id),
          issue: 'Shared resource requires approval but is not approved'
        });
      }
    }

    if (affectedItems.length > 0) {
      return {
        ruleId: 'federation-rules-001',
        severity: 'high',
        violationMessage: `Federation policy violated: ${affectedItems.length} violation(s) detected`,
        affectedAssets: affectedItems
      };
    }

    return null;
  }

  // ==========================================================================
  // ASSET TYPE CONSTRAINTS
  // ==========================================================================

  /**
   * Check asset type constraints
   */
  checkAssetTypeConstraints(
    assets: unknown[],
    constraints: {
      requiredFields: Record<string, string[]>;
      allowedStatuses: Record<string, Set<string>>;
    }
  ): HealthPolicyRuleViolation | null {
    const affectedItems: AffectedItem[] = [];

    for (const asset of assets) {
      const assetData = asset as Record<string, unknown>;
      const assetType = String(assetData.type || '');
      const requiredFields = constraints.requiredFields[assetType] || [];
      const allowedStatuses = constraints.allowedStatuses[assetType];

      // Check required fields
      for (const field of requiredFields) {
        if (!(field in assetData) || assetData[field] === null || assetData[field] === undefined) {
          affectedItems.push({
            type: assetType,
            id: String(assetData.id),
            name: String(assetData.name || assetData.id),
            issue: `Missing required field: ${field}`
          });
        }
      }

      // Check allowed statuses
      if (allowedStatuses && assetData.status) {
        const status = String(assetData.status);
        if (!allowedStatuses.has(status)) {
          affectedItems.push({
            type: assetType,
            id: String(assetData.id),
            name: String(assetData.name || assetData.id),
            issue: `Invalid status: ${status}`
          });
        }
      }
    }

    if (affectedItems.length > 0) {
      return {
        ruleId: 'asset-constraints-001',
        severity: 'medium',
        violationMessage: `Asset type constraints violated: ${affectedItems.length} violation(s) detected`,
        affectedAssets: affectedItems
      };
    }

    return null;
  }

  // ==========================================================================
  // CROSS-ENGINE CONSISTENCY
  // ==========================================================================

  /**
   * Check cross-engine schema alignment
   */
  checkCrossEngineConsistency(
    entities: unknown[],
    schemaDefinitions: Map<string, Set<string>>
  ): HealthPolicyRuleViolation | null {
    const affectedItems: AffectedItem[] = [];

    for (const entity of entities) {
      const entityData = entity as Record<string, unknown>;
      const entityType = String(entityData.type || '');
      const requiredSchema = schemaDefinitions.get(entityType);

      if (!requiredSchema) continue;

      const entityFields = new Set(Object.keys(entityData));

      for (const requiredField of requiredSchema) {
        if (!entityFields.has(requiredField)) {
          affectedItems.push({
            type: entityType,
            id: String(entityData.id),
            name: String(entityData.name || entityData.id),
            issue: `Missing schema field: ${requiredField}`
          });
        }
      }
    }

    if (affectedItems.length > 0) {
      return {
        ruleId: 'cross-engine-consistency-001',
        severity: 'high',
        violationMessage: `Cross-engine schema inconsistency: ${affectedItems.length} violation(s) detected`,
        affectedAssets: affectedItems
      };
    }

    return null;
  }

  // ==========================================================================
  // COMPLIANCE ALIGNMENT
  // ==========================================================================

  /**
   * Check compliance alignment
   */
  checkComplianceAlignment(
    complianceRecords: unknown[],
    complianceRequirements: {
      requiredFields: string[];
      requiredApprovals: number;
      requireDocumentation: boolean;
    }
  ): HealthPolicyRuleViolation | null {
    const affectedItems: AffectedItem[] = [];

    for (const record of complianceRecords) {
      const recordData = record as Record<string, unknown>;
      const approvals = (recordData.approvals || []) as unknown[];
      const documentation = recordData.documentation;

      // Check required fields
      for (const field of complianceRequirements.requiredFields) {
        if (!(field in recordData) || recordData[field] === null || recordData[field] === undefined) {
          affectedItems.push({
            type: 'compliance-record',
            id: String(recordData.id),
            name: String(recordData.title || recordData.id),
            issue: `Missing required field: ${field}`
          });
        }
      }

      // Check approvals
      if (approvals.length < complianceRequirements.requiredApprovals) {
        affectedItems.push({
          type: 'compliance-record',
          id: String(recordData.id),
          name: String(recordData.title || recordData.id),
          issue: `Insufficient approvals: ${approvals.length}/${complianceRequirements.requiredApprovals}`
        });
      }

      // Check documentation
      if (complianceRequirements.requireDocumentation && !documentation) {
        affectedItems.push({
          type: 'compliance-record',
          id: String(recordData.id),
          name: String(recordData.title || recordData.id),
          issue: 'Missing required documentation'
        });
      }
    }

    if (affectedItems.length > 0) {
      return {
        ruleId: 'compliance-alignment-001',
        severity: 'critical',
        violationMessage: `Compliance alignment violated: ${affectedItems.length} violation(s) detected`,
        affectedAssets: affectedItems
      };
    }

    return null;
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  /**
   * Check if policy is applicable to current context
   */
  private isPolicyApplicable(policy: HealthPolicy): boolean {
    // Check tenant scope
    if (policy.tenantIds && !policy.tenantIds.includes(this.tenantId)) {
      return false;
    }

    // Check facility scope
    if (policy.facilityIds && this.facilityId && !policy.facilityIds.includes(this.facilityId)) {
      return false;
    }

    return policy.enabled;
  }

  /**
   * Evaluate a single policy rule
   */
  private evaluateRule(
    rule: HealthPolicyRule,
    context: Record<string, unknown>
  ): HealthPolicyRuleViolation | null {
    const { evaluationType, field, expectedValue } = rule;

    if (evaluationType === 'presence' && field) {
      if (!(field in context) || context[field] === null || context[field] === undefined) {
        return {
          ruleId: rule.id,
          severity: rule.severity,
          violationMessage: rule.violationMessage,
          affectedAssets: [{
            type: 'context',
            id: 'eval-context',
            name: 'Evaluation Context',
            issue: `Missing required field: ${field}`
          }]
        };
      }
    }

    if (evaluationType === 'value-match' && field && expectedValue !== undefined) {
      if (context[field] !== expectedValue) {
        return {
          ruleId: rule.id,
          severity: rule.severity,
          violationMessage: rule.violationMessage,
          affectedAssets: [{
            type: 'context',
            id: 'eval-context',
            name: 'Evaluation Context',
            issue: `Field ${field} has value ${context[field]}, expected ${expectedValue}`
          }]
        };
      }
    }

    return null;
  }

  /**
   * Initialize default policies
   */
  private initializeDefaultPolicies(): void {
    // Default tenant isolation policy
    this.policies.set('default-tenant-isolation', {
      id: 'default-tenant-isolation',
      name: 'Default Tenant Isolation',
      description: 'Ensures all resources belong to the correct tenant',
      enabled: true,
      policyType: 'tenant-isolation',
      rules: [
        {
          id: 'tenant-isolation-rule-001',
          description: 'All resources must have valid tenantId',
          severity: 'critical',
          evaluationType: 'presence',
          field: 'tenantId',
          violationMessage: 'Resource missing tenantId field'
        }
      ]
    });

    // Default federation policy
    this.policies.set('default-federation', {
      id: 'default-federation',
      name: 'Default Federation Rules',
      description: 'Ensures federation follows approval and authorization rules',
      enabled: true,
      policyType: 'federation-rule',
      rules: [
        {
          id: 'federation-rule-001',
          description: 'Federated resources must be approved',
          severity: 'high',
          evaluationType: 'value-match',
          field: 'federationApproved',
          expectedValue: true,
          violationMessage: 'Federated resource not approved'
        }
      ]
    });
  }
}

// ============================================================================
// POLICY UTILITIES
// ============================================================================

/**
 * Create a custom health policy
 */
export function createHealthPolicy(
  id: string,
  name: string,
  policyType: HealthPolicy['policyType'],
  rules: HealthPolicyRule[],
  enabled: boolean = true
): HealthPolicy {
  return {
    id,
    name,
    description: `Custom policy: ${name}`,
    enabled,
    policyType,
    rules
  };
}

/**
 * Create a policy rule
 */
export function createPolicyRule(
  id: string,
  description: string,
  severity: HealthSeverity,
  evaluationType: HealthPolicyRule['evaluationType'],
  violationMessage: string,
  field?: string,
  expectedValue?: unknown
): HealthPolicyRule {
  return {
    id,
    description,
    severity,
    evaluationType,
    field,
    expectedValue,
    violationMessage
  };
}
