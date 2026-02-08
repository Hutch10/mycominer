// Phase 41: Federation Marketplace v2
// subscriptionManager.ts
// Subscription workflow with tenant isolation and policy enforcement

import {
  MarketplaceSubscription,
  MarketplaceSubscriptionStatus,
  MarketplaceListing,
} from './federationMarketplaceTypes';
import {
  logSubscriptionRequested,
  logSubscriptionApproved,
  logSubscriptionRejected,
  logSubscriptionActivated,
  logSubscriptionCancelled,
  logMarketplaceError,
} from './marketplaceLog';
import { getListingById, incrementAssetSubscriberCount, decrementAssetSubscriberCount } from './publisherRegistry';
import { evaluateSubscriptionPolicy } from './marketplacePolicyEngine';

// In-memory subscription store (in production: persist to database)
let marketplaceSubscriptions: Map<string, MarketplaceSubscription> = new Map();

// ===== SUBSCRIPTION REQUEST =====

export function requestSubscription(
  listingId: string,
  subscriberTenantId: string,
  subscriberFacilityId: string | undefined,
  requestedBy: string,
  subscriberNotes?: string
): MarketplaceSubscription | null {
  const listing = getListingById(listingId);

  if (!listing) {
    logMarketplaceError(subscriberTenantId, `Listing not found: ${listingId}`);
    return null;
  }

  // Validate listing is active
  if (!listing.isActive || listing.asset.status !== 'published') {
    logMarketplaceError(subscriberTenantId, `Listing is not active: ${listingId}`);
    return null;
  }

  // Validate tenant is not subscribing to own asset
  if (listing.asset.publisherTenantId === subscriberTenantId) {
    logMarketplaceError(subscriberTenantId, `Cannot subscribe to own asset: ${listingId}`);
    return null;
  }

  // Check for existing subscription
  const existingSubscription = Array.from(marketplaceSubscriptions.values()).find(
    (sub) =>
      sub.listingId === listingId &&
      sub.subscriberTenantId === subscriberTenantId &&
      sub.approvalStatus !== 'rejected' &&
      sub.approvalStatus !== 'cancelled'
  );

  if (existingSubscription) {
    logMarketplaceError(subscriberTenantId, `Subscription already exists: ${existingSubscription.subscriptionId}`);
    return null;
  }

  // Evaluate policy
  const policyResult = evaluateSubscriptionPolicy(
    listing,
    subscriberTenantId,
    subscriberFacilityId
  );

  if (!policyResult.allowed) {
    logMarketplaceError(
      subscriberTenantId,
      `Subscription request denied by policy: ${policyResult.reason}`
    );
    return null;
  }

  // Determine approval status (auto-approve if policy allows)
  const initialStatus: MarketplaceSubscriptionStatus = policyResult.requiresApproval
    ? 'pending'
    : 'approved';

  // Create subscription
  const subscription: MarketplaceSubscription = {
    subscriptionId: `sub-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    listingId,
    assetId: listing.asset.assetId,
    subscriberTenantId,
    subscriberFacilityId,
    requestedBy,
    requestedAt: new Date().toISOString(),
    approvalStatus: initialStatus,
    isActive: false, // not active until approved
    accessCount: 0,
    subscriberNotes,
  };

  // If auto-approved, activate immediately
  if (initialStatus === 'approved') {
    subscription.isActive = true;
    subscription.approvedAt = new Date().toISOString();
    subscription.activatedAt = new Date().toISOString();
    subscription.approvedBy = 'system-auto-approval';
    incrementAssetSubscriberCount(listing.asset.assetId);
    logSubscriptionActivated(subscription);
  }

  marketplaceSubscriptions.set(subscription.subscriptionId, subscription);
  logSubscriptionRequested(subscription);

  return subscription;
}

// ===== SUBSCRIPTION APPROVAL =====

export function approveSubscription(
  subscriptionId: string,
  approverTenantId: string,
  approverId: string,
  approvalReason: string
): boolean {
  const subscription = marketplaceSubscriptions.get(subscriptionId);

  if (!subscription) {
    logMarketplaceError(approverTenantId, `Subscription not found: ${subscriptionId}`);
    return false;
  }

  // Validate approval authority (must be publisher tenant)
  const listing = getListingById(subscription.listingId);
  if (!listing || listing.asset.publisherTenantId !== approverTenantId) {
    logMarketplaceError(approverTenantId, `Unauthorized: tenant ${approverTenantId} cannot approve subscription ${subscriptionId}`);
    return false;
  }

  // Validate subscription is pending
  if (subscription.approvalStatus !== 'pending') {
    logMarketplaceError(approverTenantId, `Subscription is not pending: ${subscriptionId}`);
    return false;
  }

  // Approve subscription
  subscription.approvalStatus = 'approved';
  subscription.approvedBy = approverId;
  subscription.approvedAt = new Date().toISOString();
  subscription.isActive = true;
  subscription.activatedAt = new Date().toISOString();

  marketplaceSubscriptions.set(subscriptionId, subscription);
  incrementAssetSubscriberCount(subscription.assetId);

  logSubscriptionApproved(subscription, approverTenantId, approverId);
  logSubscriptionActivated(subscription);

  return true;
}

export function rejectSubscription(
  subscriptionId: string,
  approverTenantId: string,
  approverId: string,
  rejectionReason: string
): boolean {
  const subscription = marketplaceSubscriptions.get(subscriptionId);

  if (!subscription) {
    logMarketplaceError(approverTenantId, `Subscription not found: ${subscriptionId}`);
    return false;
  }

  // Validate approval authority (must be publisher tenant)
  const listing = getListingById(subscription.listingId);
  if (!listing || listing.asset.publisherTenantId !== approverTenantId) {
    logMarketplaceError(approverTenantId, `Unauthorized: tenant ${approverTenantId} cannot reject subscription ${subscriptionId}`);
    return false;
  }

  // Validate subscription is pending
  if (subscription.approvalStatus !== 'pending') {
    logMarketplaceError(approverTenantId, `Subscription is not pending: ${subscriptionId}`);
    return false;
  }

  // Reject subscription
  subscription.approvalStatus = 'rejected';
  subscription.approvedBy = approverId;
  subscription.approvedAt = new Date().toISOString();
  subscription.rejectedReason = rejectionReason;
  subscription.isActive = false;

  marketplaceSubscriptions.set(subscriptionId, subscription);

  logSubscriptionRejected(subscription, approverTenantId, approverId, rejectionReason);

  return true;
}

// ===== SUBSCRIPTION CANCELLATION =====

export function cancelSubscription(
  subscriptionId: string,
  tenantId: string,
  operatorId: string
): boolean {
  const subscription = marketplaceSubscriptions.get(subscriptionId);

  if (!subscription) {
    logMarketplaceError(tenantId, `Subscription not found: ${subscriptionId}`);
    return false;
  }

  // Validate tenant ownership (subscriber can cancel their own subscription)
  if (subscription.subscriberTenantId !== tenantId) {
    logMarketplaceError(tenantId, `Unauthorized: tenant ${tenantId} cannot cancel subscription ${subscriptionId}`);
    return false;
  }

  // Validate subscription is active
  if (!subscription.isActive) {
    logMarketplaceError(tenantId, `Subscription is not active: ${subscriptionId}`);
    return false;
  }

  // Cancel subscription
  subscription.approvalStatus = 'cancelled';
  subscription.isActive = false;

  marketplaceSubscriptions.set(subscriptionId, subscription);
  decrementAssetSubscriberCount(subscription.assetId);

  logSubscriptionCancelled(subscription, operatorId);

  return true;
}

// ===== SUBSCRIPTION ACCESS =====

export function recordSubscriptionAccess(subscriptionId: string): boolean {
  const subscription = marketplaceSubscriptions.get(subscriptionId);

  if (!subscription) {
    return false;
  }

  // Increment access count
  subscription.accessCount += 1;
  subscription.lastAccessedAt = new Date().toISOString();

  marketplaceSubscriptions.set(subscriptionId, subscription);

  return true;
}

export function canAccessAsset(assetId: string, tenantId: string): boolean {
  // Check if tenant has an active subscription to this asset
  const subscription = Array.from(marketplaceSubscriptions.values()).find(
    (sub) =>
      sub.assetId === assetId &&
      sub.subscriberTenantId === tenantId &&
      sub.isActive &&
      sub.approvalStatus === 'approved'
  );

  return subscription !== undefined;
}

// ===== QUERY FUNCTIONS =====

export function getAllSubscriptions(): MarketplaceSubscription[] {
  return Array.from(marketplaceSubscriptions.values());
}

export function getSubscriptionById(subscriptionId: string): MarketplaceSubscription | undefined {
  return marketplaceSubscriptions.get(subscriptionId);
}

export function getSubscriptionsByTenant(tenantId: string): MarketplaceSubscription[] {
  return Array.from(marketplaceSubscriptions.values()).filter(
    (sub) => sub.subscriberTenantId === tenantId
  );
}

export function getSubscriptionsByListing(listingId: string): MarketplaceSubscription[] {
  return Array.from(marketplaceSubscriptions.values()).filter(
    (sub) => sub.listingId === listingId
  );
}

export function getActiveSubscriptionsByTenant(tenantId: string): MarketplaceSubscription[] {
  return Array.from(marketplaceSubscriptions.values()).filter(
    (sub) => sub.subscriberTenantId === tenantId && sub.isActive
  );
}

export function getPendingSubscriptionsByPublisher(publisherTenantId: string): MarketplaceSubscription[] {
  const subscriptions = Array.from(marketplaceSubscriptions.values());
  const pendingSubscriptions: MarketplaceSubscription[] = [];

  for (const sub of subscriptions) {
    const listing = getListingById(sub.listingId);
    if (listing && listing.asset.publisherTenantId === publisherTenantId && sub.approvalStatus === 'pending') {
      pendingSubscriptions.push(sub);
    }
  }

  return pendingSubscriptions;
}

export function getSubscriptionsByAsset(assetId: string): MarketplaceSubscription[] {
  return Array.from(marketplaceSubscriptions.values()).filter(
    (sub) => sub.assetId === assetId
  );
}

export function getActiveSubscriptionsForAsset(assetId: string): MarketplaceSubscription[] {
  return Array.from(marketplaceSubscriptions.values()).filter(
    (sub) => sub.assetId === assetId && sub.isActive
  );
}

// ===== UTILITY FUNCTIONS =====

export function clearSubscriptionManager(): void {
  marketplaceSubscriptions.clear();
}
