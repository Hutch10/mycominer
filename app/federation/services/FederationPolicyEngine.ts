/**
 * Federation Policy Engine
 * 
 * Enforces cross-organization policies:
 * - Data sharing rules and restrictions
 * - Model exchange policies
 * - Marketplace transaction policies
 * - Governance and compliance rules
 * - Uses JSONLogic for flexible rule evaluation
 */

import { FederationPolicy, PolicyRule } from '../types';
import { federationRegistry } from './FederationRegistry';

export interface PolicyEvaluationContext {
  actor: {
    organizationId: string;
    verificationLevel?: string;
    trustScore?: number;
    country?: string;
  };
  action: string;
  resource: {
    type: string;
    id?: string;
    owner?: string;
    classification?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  policy: string; // Policy ID
  rule: string; // Rule ID
  action: 'allow' | 'deny' | 'require-approval' | 'audit';
  message?: string;
  requiresApproval?: boolean;
}

export class FederationPolicyEngine {
  private policies: Map<string, FederationPolicy> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
  }

  /**
   * Initialize default federation policies
   */
  private initializeDefaultPolicies(): void {
    // Global data sharing policy
    this.addPolicy({
      id: 'global-data-sharing',
      name: 'Global Data Sharing Policy',
      version: '1.0',
      scope: 'global',
      organizations: [],
      enforcementLevel: 'blocking',
      rules: [
        {
          id: 'require-verification',
          category: 'data-sharing',
          condition: JSON.stringify({
            '>=': [{ var: 'actor.trustScore' }, 50]
          }),
          action: 'allow',
          message: 'Organization must have trust score >= 50',
        },
        {
          id: 'block-unverified',
          category: 'data-sharing',
          condition: JSON.stringify({
            '!=': [{ var: 'actor.verificationLevel' }, 'pending']
          }),
          action: 'allow',
          message: 'Organization must be verified',
        },
      ],
      createdAt: new Date(),
      effectiveAt: new Date(),
    });

    // Marketplace policy
    this.addPolicy({
      id: 'marketplace-publishing',
      name: 'Marketplace Publishing Policy',
      version: '1.0',
      scope: 'global',
      organizations: [],
      enforcementLevel: 'blocking',
      rules: [
        {
          id: 'verified-publishers',
          category: 'marketplace',
          condition: JSON.stringify({
            in: [{ var: 'actor.verificationLevel' }, ['standard', 'premium', 'certified']]
          }),
          action: 'allow',
          message: 'Publishers must have standard verification or higher',
        },
        {
          id: 'security-scan-required',
          category: 'marketplace',
          condition: JSON.stringify({
            '==': [{ var: 'resource.securityScanPassed' }, true]
          }),
          action: 'allow',
          message: 'Extensions must pass security scan',
        },
      ],
      createdAt: new Date(),
      effectiveAt: new Date(),
    });

    // Model exchange policy
    this.addPolicy({
      id: 'model-exchange',
      name: 'Federated Model Exchange Policy',
      version: '1.0',
      scope: 'global',
      organizations: [],
      enforcementLevel: 'warning',
      rules: [
        {
          id: 'privacy-preserved',
          category: 'model-exchange',
          condition: JSON.stringify({
            in: [{ var: 'resource.privacyTechnique' }, ['differential-privacy', 'secure-aggregation', 'federated-averaging']]
          }),
          action: 'allow',
          message: 'Models must use privacy-preserving techniques',
        },
      ],
      createdAt: new Date(),
      effectiveAt: new Date(),
    });
  }

  /**
   * Add or update a policy
   */
  addPolicy(policy: FederationPolicy): void {
    this.policies.set(policy.id, policy);
  }

  /**
   * Get policy by ID
   */
  getPolicy(id: string): FederationPolicy | undefined {
    return this.policies.get(id);
  }

  /**
   * List all active policies
   */
  listPolicies(filters?: {
    scope?: string;
    category?: string;
    organizationId?: string;
  }): FederationPolicy[] {
    let policies = Array.from(this.policies.values());

    // Filter expired policies
    const now = new Date();
    policies = policies.filter(p => !p.expiresAt || p.expiresAt > now);

    // Filter by effective date
    policies = policies.filter(p => p.effectiveAt <= now);

    if (filters?.scope) {
      policies = policies.filter(p => p.scope === filters.scope);
    }

    if (filters?.category) {
      policies = policies.filter(p =>
        p.rules.some(r => r.category === filters.category)
      );
    }

    if (filters?.organizationId) {
      policies = policies.filter(p =>
        p.scope === 'global' ||
        p.organizations.includes(filters.organizationId!)
      );
    }

    return policies;
  }

  /**
   * Evaluate policies for an action
   */
  async evaluate(context: PolicyEvaluationContext): Promise<PolicyEvaluationResult[]> {
    // Get applicable policies
    const policies = this.listPolicies({
      organizationId: context.actor.organizationId,
    });

    const results: PolicyEvaluationResult[] = [];

    for (const policy of policies) {
      // Find relevant rules
      const relevantRules = policy.rules.filter(rule => {
        // Match action type to rule category
        if (context.action.includes('share') || context.action.includes('access')) {
          return rule.category === 'data-sharing';
        }
        if (context.action.includes('publish') || context.action.includes('install')) {
          return rule.category === 'marketplace';
        }
        if (context.action.includes('model') || context.action.includes('train')) {
          return rule.category === 'model-exchange';
        }
        return rule.category === 'governance';
      });

      for (const rule of relevantRules) {
        const result = await this.evaluateRule(policy, rule, context);
        results.push(result);
      }
    }

    // If no specific rules matched, default to allow with audit
    if (results.length === 0) {
      results.push({
        allowed: true,
        policy: 'default',
        rule: 'default',
        action: 'audit',
        message: 'No specific policy rules matched',
      });
    }

    return results;
  }

  /**
   * Evaluate a single rule
   */
  private async evaluateRule(
    policy: FederationPolicy,
    rule: PolicyRule,
    context: PolicyEvaluationContext
  ): Promise<PolicyEvaluationResult> {
    // Enhance context with organization details
    const org = await federationRegistry.getOrganization(context.actor.organizationId);
    const enhancedContext = {
      actor: {
        ...context.actor,
        verificationLevel: org?.verificationLevel,
        trustScore: org?.trustScore,
        country: org?.country,
      },
      action: context.action,
      resource: context.resource,
      ...context.metadata,
    };

    // Evaluate JSONLogic condition
    let conditionMet = true;
    try {
      conditionMet = this.evaluateJsonLogic(rule.condition, enhancedContext);
    } catch (error) {
      console.error('[PolicyEngine] Error evaluating rule:', error);
      conditionMet = false;
    }

    const allowed = conditionMet && rule.action === 'allow';
    const requiresApproval = rule.action === 'require-approval';

    return {
      allowed,
      policy: policy.id,
      rule: rule.id,
      action: rule.action,
      message: rule.message,
      requiresApproval,
    };
  }

  /**
   * Simple JSONLogic evaluator
   * In production, use the jsonlogic package
   */
  private evaluateJsonLogic(condition: string, data: any): boolean {
    try {
      const logic = JSON.parse(condition);
      return this.applyLogic(logic, data);
    } catch {
      return true; // Default to allow if parsing fails
    }
  }

  /**
   * Apply JSONLogic operators
   */
  private applyLogic(logic: any, data: any): boolean {
    // Var operator
    if (logic.var) {
      const path = logic.var.split('.');
      let value = data;
      for (const key of path) {
        value = value?.[key];
      }
      return value;
    }

    // Comparison operators
    if (logic['==']) {
      const [left, right] = logic['=='];
      return this.applyLogic(left, data) == this.applyLogic(right, data);
    }

    if (logic['!=']) {
      const [left, right] = logic['!='];
      return this.applyLogic(left, data) != this.applyLogic(right, data);
    }

    if (logic['>=']) {
      const [left, right] = logic['>='];
      return this.applyLogic(left, data) >= this.applyLogic(right, data);
    }

    if (logic['>']) {
      const [left, right] = logic['>'];
      return this.applyLogic(left, data) > this.applyLogic(right, data);
    }

    if (logic['<=']) {
      const [left, right] = logic['<='];
      return this.applyLogic(left, data) <= this.applyLogic(right, data);
    }

    if (logic['<']) {
      const [left, right] = logic['<'];
      return this.applyLogic(left, data) < this.applyLogic(right, data);
    }

    // Array operators
    if (logic.in) {
      const [item, array] = logic.in;
      const itemValue = this.applyLogic(item, data);
      const arrayValue = this.applyLogic(array, data);
      return Array.isArray(arrayValue) && arrayValue.includes(itemValue);
    }

    // Logical operators
    if (logic.and) {
      return logic.and.every((condition: any) => this.applyLogic(condition, data));
    }

    if (logic.or) {
      return logic.or.some((condition: any) => this.applyLogic(condition, data));
    }

    if (logic['!']) {
      return !this.applyLogic(logic['!'], data);
    }

    // Literal values
    return logic;
  }

  /**
   * Check if action is allowed (convenience method)
   */
  async isAllowed(context: PolicyEvaluationContext): Promise<boolean> {
    const results = await this.evaluate(context);
    
    // Check enforcement level and results
    const blockingDenials = results.filter(r => {
      const policy = this.policies.get(r.policy);
      return !r.allowed && policy?.enforcementLevel === 'blocking';
    });

    return blockingDenials.length === 0;
  }

  /**
   * Get policy violations
   */
  async getViolations(context: PolicyEvaluationContext): Promise<PolicyEvaluationResult[]> {
    const results = await this.evaluate(context);
    return results.filter(r => !r.allowed);
  }

  /**
   * Create custom policy for bilateral agreement
   */
  async createBilateralPolicy(
    org1Id: string,
    org2Id: string,
    rules: PolicyRule[],
    name: string
  ): Promise<FederationPolicy> {
    const policy: FederationPolicy = {
      id: `bilateral-${org1Id}-${org2Id}-${Date.now()}`,
      name,
      version: '1.0',
      scope: 'bilateral',
      organizations: [org1Id, org2Id],
      rules,
      enforcementLevel: 'blocking',
      createdAt: new Date(),
      effectiveAt: new Date(),
    };

    this.addPolicy(policy);
    return policy;
  }

  /**
   * Audit policy enforcement
   */
  async auditPolicyEnforcement(
    context: PolicyEvaluationContext,
    result: PolicyEvaluationResult[]
  ): Promise<void> {
    // Log to audit trail (integrate with Phase 50)
    console.log('[PolicyAudit]', {
      timestamp: new Date(),
      organizationId: context.actor.organizationId,
      action: context.action,
      resource: context.resource,
      results: result.map(r => ({
        policy: r.policy,
        rule: r.rule,
        allowed: r.allowed,
      })),
    });
  }

  /**
   * Get policy statistics
   */
  async getStatistics(): Promise<{
    totalPolicies: number;
    activePolicies: number;
    policiesByScope: Record<string, number>;
    policiesByCategory: Record<string, number>;
  }> {
    const all = Array.from(this.policies.values());
    const now = new Date();
    const active = all.filter(p => 
      p.effectiveAt <= now && (!p.expiresAt || p.expiresAt > now)
    );

    const byScope: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    for (const policy of active) {
      byScope[policy.scope] = (byScope[policy.scope] || 0) + 1;
      
      for (const rule of policy.rules) {
        byCategory[rule.category] = (byCategory[rule.category] || 0) + 1;
      }
    }

    return {
      totalPolicies: all.length,
      activePolicies: active.length,
      policiesByScope: byScope,
      policiesByCategory: byCategory,
    };
  }
}

// Singleton instance
export const policyEngine = new FederationPolicyEngine();
