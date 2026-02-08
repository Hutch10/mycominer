// Phase 41: Federation Marketplace v2
// marketplacePolicyEngine.ts
// Policy enforcement for marketplace publishing and subscription

import {
  MarketplacePolicy,
  MarketplaceAssetType,
  MarketplaceListing,
  PolicyEvaluation,
} from './federationMarketplaceTypes';
import { logPolicyEvaluated, logMarketplaceError } from './marketplaceLog';

// In-memory policy store (in production: persist to database)
let marketplacePolicies: Map<string, MarketplacePolicy> = new Map();

// ===== POLICY DEFINITION =====

export function definePolicy(policyData: Omit<MarketplacePolicy, 'policyId' | 'createdAt' | 'updatedAt'>): MarketplacePolicy {
  const policy: MarketplacePolicy = {
    policyId: `policy-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...policyData,
  };

  marketplacePolicies.set(policy.policyId, policy);

  return policy;
}

export function updatePolicy(
  policyId: string,
  updates: Partial<Omit<MarketplacePolicy, 'policyId' | 'tenantId' | 'createdAt'>>,
  tenantId: string
): MarketplacePolicy | null {
  const policy = marketplacePolicies.get(policyId);

  if (!policy) {
    logMarketplaceError(tenantId, `Policy not found: ${policyId}`);
    return null;
  }

  // Validate tenant ownership
  if (policy.tenantId !== tenantId) {
    logMarketplaceError(tenantId, `Unauthorized: tenant ${tenantId} cannot update policy ${policyId}`);
    return null;
  }

  const updatedPolicy: MarketplacePolicy = {
    ...policy,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  marketplacePolicies.set(policyId, updatedPolicy);

  return updatedPolicy;
}

export function deletePolicy(policyId: string, tenantId: string): boolean {
  const policy = marketplacePolicies.get(policyId);

  if (!policy) {
    logMarketplaceError(tenantId, `Policy not found: ${policyId}`);
    return false;
  }

  // Validate tenant ownership
  if (policy.tenantId !== tenantId) {
    logMarketplaceError(tenantId, `Unauthorized: tenant ${tenantId} cannot delete policy ${policyId}`);
    return false;
  }

  marketplacePolicies.delete(policyId);

  return true;
}

// ===== POLICY EVALUATION =====

export function evaluatePublishPolicy(
  tenantId: string,
  assetType: MarketplaceAssetType
): { allowed: boolean; reason: string; evaluations: PolicyEvaluation[] } {
  const policies = getPoliciesByTenant(tenantId).filter(
    (p) => p.isActive && (p.policyType === 'publisher' || p.policyType === 'global')
  );

  const evaluations: PolicyEvaluation[] = [];
  let allowed = true;
  let reason = 'Publishing allowed';

  // If no policies, allow by default
  if (policies.length === 0) {
    return { allowed: true, reason: 'No policies defined, allowing by default', evaluations: [] };
  }

  for (const policy of policies) {
    // Check if tenant can publish
    if (!policy.canPublish) {
      const evaluation: PolicyEvaluation = {
        policyId: policy.policyId,
        policyName: policy.policyName,
        evaluatedAt: new Date().toISOString(),
        result: 'fail',
        reason: `Policy ${policy.policyName} does not allow publishing`,
      };
      evaluations.push(evaluation);
      logPolicyEvaluated(policy.policyId, tenantId, evaluation, { action: 'publish', assetType });
      allowed = false;
      reason = evaluation.reason;
      break;
    }

    // Check if asset type is allowed
    if (!policy.allowedAssetTypes.includes(assetType)) {
      const evaluation: PolicyEvaluation = {
        policyId: policy.policyId,
        policyName: policy.policyName,
        evaluatedAt: new Date().toISOString(),
        result: 'fail',
        reason: `Policy ${policy.policyName} does not allow publishing asset type: ${assetType}`,
      };
      evaluations.push(evaluation);
      logPolicyEvaluated(policy.policyId, tenantId, evaluation, { action: 'publish', assetType });
      allowed = false;
      reason = evaluation.reason;
      break;
    }

    // Check max published assets limit
    if (policy.maxPublishedAssets !== undefined) {
      // In production: query actual published asset count
      const publishedCount = 0; // Placeholder
      if (publishedCount >= policy.maxPublishedAssets) {
        const evaluation: PolicyEvaluation = {
          policyId: policy.policyId,
          policyName: policy.policyName,
          evaluatedAt: new Date().toISOString(),
          result: 'fail',
          reason: `Policy ${policy.policyName}: max published assets limit reached (${policy.maxPublishedAssets})`,
        };
        evaluations.push(evaluation);
        logPolicyEvaluated(policy.policyId, tenantId, evaluation, { action: 'publish', assetType });
        allowed = false;
        reason = evaluation.reason;
        break;
      }
    }

    // All checks passed for this policy
    const evaluation: PolicyEvaluation = {
      policyId: policy.policyId,
      policyName: policy.policyName,
      evaluatedAt: new Date().toISOString(),
      result: 'pass',
      reason: `Policy ${policy.policyName} allows publishing`,
    };
    evaluations.push(evaluation);
    logPolicyEvaluated(policy.policyId, tenantId, evaluation, { action: 'publish', assetType });
  }

  return { allowed, reason, evaluations };
}

export function evaluateSubscriptionPolicy(
  listing: MarketplaceListing,
  subscriberTenantId: string,
  subscriberFacilityId?: string
): { allowed: boolean; requiresApproval: boolean; reason: string; evaluations: PolicyEvaluation[] } {
  const publisherTenantId = listing.asset.publisherTenantId;
  const assetType = listing.asset.assetType;

  // Get subscriber policies
  const subscriberPolicies = getPoliciesByTenant(subscriberTenantId).filter(
    (p) => p.isActive && (p.policyType === 'subscriber' || p.policyType === 'global')
  );

  // Get publisher policies
  const publisherPolicies = getPoliciesByTenant(publisherTenantId).filter(
    (p) => p.isActive && (p.policyType === 'publisher' || p.policyType === 'global')
  );

  const evaluations: PolicyEvaluation[] = [];
  let allowed = true;
  let requiresApproval = false;
  let reason = 'Subscription allowed';

  // Evaluate subscriber policies
  for (const policy of subscriberPolicies) {
    // Check if tenant can subscribe
    if (!policy.canSubscribe) {
      const evaluation: PolicyEvaluation = {
        policyId: policy.policyId,
        policyName: policy.policyName,
        evaluatedAt: new Date().toISOString(),
        result: 'fail',
        reason: `Policy ${policy.policyName} does not allow subscribing`,
      };
      evaluations.push(evaluation);
      logPolicyEvaluated(policy.policyId, subscriberTenantId, evaluation, { action: 'subscribe', assetType, publisherTenantId });
      allowed = false;
      reason = evaluation.reason;
      break;
    }

    // Check if asset type is allowed
    if (!policy.allowedAssetTypes.includes(assetType)) {
      const evaluation: PolicyEvaluation = {
        policyId: policy.policyId,
        policyName: policy.policyName,
        evaluatedAt: new Date().toISOString(),
        result: 'fail',
        reason: `Policy ${policy.policyName} does not allow subscribing to asset type: ${assetType}`,
      };
      evaluations.push(evaluation);
      logPolicyEvaluated(policy.policyId, subscriberTenantId, evaluation, { action: 'subscribe', assetType, publisherTenantId });
      allowed = false;
      reason = evaluation.reason;
      break;
    }

    // Check allowed publisher tenants
    if (policy.allowedPublisherTenants && policy.allowedPublisherTenants.length > 0) {
      if (!policy.allowedPublisherTenants.includes(publisherTenantId)) {
        const evaluation: PolicyEvaluation = {
          policyId: policy.policyId,
          policyName: policy.policyName,
          evaluatedAt: new Date().toISOString(),
          result: 'fail',
          reason: `Policy ${policy.policyName} does not allow subscribing to assets from publisher: ${publisherTenantId}`,
        };
        evaluations.push(evaluation);
        logPolicyEvaluated(policy.policyId, subscriberTenantId, evaluation, { action: 'subscribe', assetType, publisherTenantId });
        allowed = false;
        reason = evaluation.reason;
        break;
      }
    }

    // Check max subscriptions limit
    if (policy.maxSubscriptions !== undefined) {
      // In production: query actual subscription count
      const subscriptionCount = 0; // Placeholder
      if (subscriptionCount >= policy.maxSubscriptions) {
        const evaluation: PolicyEvaluation = {
          policyId: policy.policyId,
          policyName: policy.policyName,
          evaluatedAt: new Date().toISOString(),
          result: 'fail',
          reason: `Policy ${policy.policyName}: max subscriptions limit reached (${policy.maxSubscriptions})`,
        };
        evaluations.push(evaluation);
        logPolicyEvaluated(policy.policyId, subscriberTenantId, evaluation, { action: 'subscribe', assetType, publisherTenantId });
        allowed = false;
        reason = evaluation.reason;
        break;
      }
    }

    // Check if approval is required
    if (policy.requiresApproval) {
      requiresApproval = true;
    }

    // All checks passed for this policy
    const evaluation: PolicyEvaluation = {
      policyId: policy.policyId,
      policyName: policy.policyName,
      evaluatedAt: new Date().toISOString(),
      result: 'pass',
      reason: `Policy ${policy.policyName} allows subscribing`,
    };
    evaluations.push(evaluation);
    logPolicyEvaluated(policy.policyId, subscriberTenantId, evaluation, { action: 'subscribe', assetType, publisherTenantId });
  }

  if (!allowed) {
    return { allowed, requiresApproval, reason, evaluations };
  }

  // Evaluate publisher policies
  for (const policy of publisherPolicies) {
    // Check allowed subscriber tenants
    if (policy.allowedSubscriberTenants && policy.allowedSubscriberTenants.length > 0) {
      if (!policy.allowedSubscriberTenants.includes(subscriberTenantId)) {
        const evaluation: PolicyEvaluation = {
          policyId: policy.policyId,
          policyName: policy.policyName,
          evaluatedAt: new Date().toISOString(),
          result: 'fail',
          reason: `Policy ${policy.policyName} does not allow subscriptions from tenant: ${subscriberTenantId}`,
        };
        evaluations.push(evaluation);
        logPolicyEvaluated(policy.policyId, publisherTenantId, evaluation, { action: 'subscribe', assetType, subscriberTenantId });
        allowed = false;
        reason = evaluation.reason;
        break;
      }
    }

    // Check if approval is required
    if (policy.requiresApproval) {
      requiresApproval = true;
    }

    // Check federation requirement
    if (policy.requiresFederationAgreement || listing.asset.federationRequired) {
      // In production: check if federation agreement exists between tenants
      const hasFederationAgreement = true; // Placeholder (would call Phase 33 federation engine)
      if (!hasFederationAgreement) {
        const evaluation: PolicyEvaluation = {
          policyId: policy.policyId,
          policyName: policy.policyName,
          evaluatedAt: new Date().toISOString(),
          result: 'fail',
          reason: `Policy ${policy.policyName} requires federation agreement between tenants`,
        };
        evaluations.push(evaluation);
        logPolicyEvaluated(policy.policyId, publisherTenantId, evaluation, { action: 'subscribe', assetType, subscriberTenantId });
        allowed = false;
        reason = evaluation.reason;
        break;
      }
    }

    // All checks passed for this policy
    const evaluation: PolicyEvaluation = {
      policyId: policy.policyId,
      policyName: policy.policyName,
      evaluatedAt: new Date().toISOString(),
      result: 'pass',
      reason: `Policy ${policy.policyName} allows subscriptions`,
    };
    evaluations.push(evaluation);
    logPolicyEvaluated(policy.policyId, publisherTenantId, evaluation, { action: 'subscribe', assetType, subscriberTenantId });
  }

  // Check asset-specific restrictions
  if (listing.asset.allowedTenantIds && listing.asset.allowedTenantIds.length > 0) {
    if (!listing.asset.allowedTenantIds.includes(subscriberTenantId)) {
      allowed = false;
      reason = `Asset restricts access to specific tenants, and ${subscriberTenantId} is not in the allow-list`;
    }
  }

  // If asset is not public, require approval
  if (!listing.asset.isPublic) {
    requiresApproval = true;
  }

  return { allowed, requiresApproval, reason, evaluations };
}

// ===== QUERY FUNCTIONS =====

export function getAllPolicies(): MarketplacePolicy[] {
  return Array.from(marketplacePolicies.values());
}

export function getPolicyById(policyId: string): MarketplacePolicy | undefined {
  return marketplacePolicies.get(policyId);
}

export function getPoliciesByTenant(tenantId: string): MarketplacePolicy[] {
  return Array.from(marketplacePolicies.values()).filter(
    (policy) => policy.tenantId === tenantId
  );
}

export function getActivePoliciesByTenant(tenantId: string): MarketplacePolicy[] {
  return Array.from(marketplacePolicies.values()).filter(
    (policy) => policy.tenantId === tenantId && policy.isActive
  );
}

export function getPoliciesByType(policyType: 'publisher' | 'subscriber' | 'global'): MarketplacePolicy[] {
  return Array.from(marketplacePolicies.values()).filter(
    (policy) => policy.policyType === policyType
  );
}

// ===== INITIALIZATION =====

export function initializeDefaultPolicies(tenantId: string): void {
  // Define default publisher policy
  definePolicy({
    tenantId,
    policyName: `${tenantId} - Default Publisher Policy`,
    policyDescription: 'Default policy for publishing marketplace assets',
    policyType: 'publisher',
    allowedAssetTypes: [
      'sop-template',
      'workflow-template',
      'training-module',
      'analytics-pattern-pack',
      'sandbox-scenario',
      'forecast-guide',
      'operator-playbook',
    ],
    canPublish: true,
    canSubscribe: false,
    requiresApproval: true, // require approval for all subscriptions by default
    requiresFederationAgreement: true,
    isActive: true,
  });

  // Define default subscriber policy
  definePolicy({
    tenantId,
    policyName: `${tenantId} - Default Subscriber Policy`,
    policyDescription: 'Default policy for subscribing to marketplace assets',
    policyType: 'subscriber',
    allowedAssetTypes: [
      'sop-template',
      'workflow-template',
      'training-module',
      'analytics-pattern-pack',
      'sandbox-scenario',
      'forecast-guide',
      'operator-playbook',
    ],
    canPublish: false,
    canSubscribe: true,
    requiresApproval: false, // allow auto-approval for subscribers
    requiresFederationAgreement: false,
    isActive: true,
  });
}

// ===== UTILITY FUNCTIONS =====

export function clearPolicyEngine(): void {
  marketplacePolicies.clear();
}
