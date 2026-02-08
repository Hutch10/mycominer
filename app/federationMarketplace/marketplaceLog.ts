// Phase 41: Federation Marketplace v2
// marketplaceLog.ts
// Comprehensive logging for all marketplace activities

import { 
  MarketplaceLogEntry, 
  MarketplaceLogEntryType,
  MarketplaceListing,
  MarketplaceSubscription,
  MarketplaceApproval,
  PolicyEvaluation,
} from './federationMarketplaceTypes';

// In-memory log store (in production: persist to database)
let marketplaceLog: MarketplaceLogEntry[] = [];

function createLogEntry(entry: Omit<MarketplaceLogEntry, 'logId' | 'timestamp'>): MarketplaceLogEntry {
  const logEntry: MarketplaceLogEntry = {
    logId: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  marketplaceLog.push(logEntry);
  return logEntry;
}

// ===== LISTING EVENTS =====

export function logListingCreated(listing: MarketplaceListing, operatorId: string): MarketplaceLogEntry {
  return createLogEntry({
    logType: 'listing-created',
    tenantId: listing.asset.publisherTenantId,
    facilityId: listing.asset.publisherFacilityId,
    operatorId,
    listingId: listing.listingId,
    assetId: listing.asset.assetId,
    action: 'create',
    result: 'success',
    metadata: {
      assetType: listing.asset.assetType,
      assetName: listing.asset.name,
      version: listing.asset.version,
    },
  });
}

export function logListingUpdated(listing: MarketplaceListing, operatorId: string): MarketplaceLogEntry {
  return createLogEntry({
    logType: 'listing-updated',
    tenantId: listing.asset.publisherTenantId,
    facilityId: listing.asset.publisherFacilityId,
    operatorId,
    listingId: listing.listingId,
    assetId: listing.asset.assetId,
    action: 'update',
    result: 'success',
    metadata: {
      updatedAt: listing.updatedAt,
    },
  });
}

export function logListingArchived(listing: MarketplaceListing, operatorId: string): MarketplaceLogEntry {
  return createLogEntry({
    logType: 'listing-archived',
    tenantId: listing.asset.publisherTenantId,
    facilityId: listing.asset.publisherFacilityId,
    operatorId,
    listingId: listing.listingId,
    assetId: listing.asset.assetId,
    action: 'archive',
    result: 'success',
  });
}

// ===== SUBSCRIPTION EVENTS =====

export function logSubscriptionRequested(subscription: MarketplaceSubscription): MarketplaceLogEntry {
  return createLogEntry({
    logType: 'subscription-requested',
    tenantId: subscription.subscriberTenantId,
    facilityId: subscription.subscriberFacilityId,
    operatorId: subscription.requestedBy,
    listingId: subscription.listingId,
    assetId: subscription.assetId,
    subscriptionId: subscription.subscriptionId,
    action: 'request',
    result: 'pending',
    metadata: {
      requestedAt: subscription.requestedAt,
      subscriberNotes: subscription.subscriberNotes,
    },
  });
}

export function logSubscriptionApproved(subscription: MarketplaceSubscription, approverTenantId: string, approverId: string): MarketplaceLogEntry {
  return createLogEntry({
    logType: 'subscription-approved',
    tenantId: approverTenantId,
    operatorId: approverId,
    listingId: subscription.listingId,
    assetId: subscription.assetId,
    subscriptionId: subscription.subscriptionId,
    action: 'approve',
    result: 'success',
    metadata: {
      subscriberTenantId: subscription.subscriberTenantId,
      approvedAt: subscription.approvedAt,
    },
  });
}

export function logSubscriptionRejected(subscription: MarketplaceSubscription, approverTenantId: string, approverId: string, reason: string): MarketplaceLogEntry {
  return createLogEntry({
    logType: 'subscription-rejected',
    tenantId: approverTenantId,
    operatorId: approverId,
    listingId: subscription.listingId,
    assetId: subscription.assetId,
    subscriptionId: subscription.subscriptionId,
    action: 'reject',
    result: 'success',
    metadata: {
      subscriberTenantId: subscription.subscriberTenantId,
      rejectedReason: reason,
    },
  });
}

export function logSubscriptionActivated(subscription: MarketplaceSubscription): MarketplaceLogEntry {
  return createLogEntry({
    logType: 'subscription-activated',
    tenantId: subscription.subscriberTenantId,
    facilityId: subscription.subscriberFacilityId,
    operatorId: subscription.requestedBy,
    listingId: subscription.listingId,
    assetId: subscription.assetId,
    subscriptionId: subscription.subscriptionId,
    action: 'activate',
    result: 'success',
    metadata: {
      activatedAt: subscription.activatedAt,
    },
  });
}

export function logSubscriptionCancelled(subscription: MarketplaceSubscription, operatorId: string): MarketplaceLogEntry {
  return createLogEntry({
    logType: 'subscription-cancelled',
    tenantId: subscription.subscriberTenantId,
    facilityId: subscription.subscriberFacilityId,
    operatorId,
    listingId: subscription.listingId,
    assetId: subscription.assetId,
    subscriptionId: subscription.subscriptionId,
    action: 'cancel',
    result: 'success',
  });
}

// ===== ASSET ACCESS EVENTS =====

export function logAssetAccessed(assetId: string, tenantId: string, facilityId: string | undefined, operatorId: string, subscriptionId?: string): MarketplaceLogEntry {
  return createLogEntry({
    logType: 'asset-accessed',
    tenantId,
    facilityId,
    operatorId,
    assetId,
    subscriptionId,
    action: 'access',
    result: 'success',
    metadata: {
      accessedAt: new Date().toISOString(),
    },
  });
}

// ===== POLICY EVENTS =====

export function logPolicyEvaluated(policyId: string, tenantId: string, evaluation: PolicyEvaluation, context: any): MarketplaceLogEntry {
  return createLogEntry({
    logType: 'policy-evaluated',
    tenantId,
    policyId,
    action: 'evaluate',
    result: evaluation.result === 'pass' ? 'success' : 'failure',
    metadata: {
      policyName: evaluation.policyName,
      evaluationResult: evaluation.result,
      evaluationReason: evaluation.reason,
      context,
    },
  });
}

// ===== INTEGRATION EVENTS =====

export function logExplainRequested(assetId: string, tenantId: string, operatorId: string): MarketplaceLogEntry {
  return createLogEntry({
    logType: 'explain-requested',
    tenantId,
    operatorId,
    assetId,
    action: 'explain',
    result: 'success',
    metadata: {
      integrationPhase: 'Phase 37',
    },
  });
}

export function logPatternViewed(assetId: string, tenantId: string, operatorId: string, patternPackId: string): MarketplaceLogEntry {
  return createLogEntry({
    logType: 'pattern-viewed',
    tenantId,
    operatorId,
    assetId,
    action: 'view-pattern',
    result: 'success',
    metadata: {
      integrationPhase: 'Phase 39',
      patternPackId,
    },
  });
}

export function logTrainingOpened(assetId: string, tenantId: string, operatorId: string, trainingModuleId: string): MarketplaceLogEntry {
  return createLogEntry({
    logType: 'training-opened',
    tenantId,
    operatorId,
    assetId,
    action: 'open-training',
    result: 'success',
    metadata: {
      integrationPhase: 'Phase 40',
      trainingModuleId,
    },
  });
}

// ===== ERROR EVENTS =====

export function logMarketplaceError(tenantId: string, errorMessage: string, context?: any): MarketplaceLogEntry {
  return createLogEntry({
    logType: 'error',
    tenantId,
    action: 'error',
    result: 'failure',
    errorMessage,
    metadata: context,
  });
}

// ===== RETRIEVAL FUNCTIONS =====

export function getMarketplaceLogs(): MarketplaceLogEntry[] {
  return [...marketplaceLog];
}

export function getMarketplaceLogsByTenant(tenantId: string): MarketplaceLogEntry[] {
  return marketplaceLog.filter((log) => log.tenantId === tenantId);
}

export function getMarketplaceLogsByType(logType: MarketplaceLogEntryType): MarketplaceLogEntry[] {
  return marketplaceLog.filter((log) => log.logType === logType);
}

export function getMarketplaceLogsByAsset(assetId: string): MarketplaceLogEntry[] {
  return marketplaceLog.filter((log) => log.assetId === assetId);
}

export function getMarketplaceLogsByListing(listingId: string): MarketplaceLogEntry[] {
  return marketplaceLog.filter((log) => log.listingId === listingId);
}

export function getMarketplaceLogsBySubscription(subscriptionId: string): MarketplaceLogEntry[] {
  return marketplaceLog.filter((log) => log.subscriptionId === subscriptionId);
}

export function getMarketplaceLogsByDateRange(startDate: string, endDate: string): MarketplaceLogEntry[] {
  return marketplaceLog.filter((log) => {
    const logDate = new Date(log.timestamp);
    return logDate >= new Date(startDate) && logDate <= new Date(endDate);
  });
}

export function clearMarketplaceLogs(): void {
  marketplaceLog = [];
}

export function filterMarketplaceLogs(predicate: (log: MarketplaceLogEntry) => boolean): MarketplaceLogEntry[] {
  return marketplaceLog.filter(predicate);
}
