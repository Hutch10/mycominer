// Phase 41: Federation Marketplace v2
// federationMarketplaceEngine.ts
// Master orchestrator for federation marketplace

import {
  MarketplaceQuery,
  MarketplaceQueryResult,
  MarketplaceListing,
  MarketplaceAsset,
  MarketplaceSubscription,
  MarketplaceStats,
  MarketplaceAssetType,
  FederationMarketplaceEngine as IFederationMarketplaceEngine,
} from './federationMarketplaceTypes';
import {
  registerAsset,
  publishAsset as publishAssetToRegistry,
  getAllListings,
  getListingById,
  getListingsByTenant,
  getListingsByAssetType,
  getActiveListings,
  getFeaturedListings,
  searchListings,
  filterListingsByTags,
  incrementAssetViewCount,
} from './publisherRegistry';
import {
  requestSubscription as requestSubscriptionFromManager,
  approveSubscription as approveSubscriptionInManager,
  rejectSubscription as rejectSubscriptionInManager,
  cancelSubscription as cancelSubscriptionInManager,
  getSubscriptionsByTenant,
  getActiveSubscriptionsByTenant,
  getPendingSubscriptionsByPublisher,
  canAccessAsset,
  recordSubscriptionAccess,
} from './subscriptionManager';
import {
  initializeDefaultPolicies,
  evaluatePublishPolicy,
} from './marketplacePolicyEngine';
import { logAssetAccessed, logMarketplaceError } from './marketplaceLog';

// ===== ENGINE INITIALIZATION =====

const initializedTenants: Set<string> = new Set();

export function initializeMarketplace(tenantId: string): void {
  if (initializedTenants.has(tenantId)) {
    return; // Already initialized
  }

  // Initialize default policies
  initializeDefaultPolicies(tenantId);

  initializedTenants.add(tenantId);
}

// ===== QUERY LISTINGS =====

export function queryListings(query: MarketplaceQuery): MarketplaceQueryResult {
  const startTime = Date.now();

  // Get all active listings
  let listings = getActiveListings();

  // Filter by asset type
  if (query.assetType) {
    listings = listings.filter((listing) => listing.asset.assetType === query.assetType);
  }

  // Filter by category
  if (query.category) {
    listings = listings.filter((listing) => listing.asset.category === query.category);
  }

  // Filter by tags
  if (query.tags && query.tags.length > 0) {
    listings = listings.filter((listing) =>
      query.tags!.some((tag) => listing.asset.tags.includes(tag))
    );
  }

  // Filter by publisher tenant
  if (query.publisherTenantId) {
    listings = listings.filter(
      (listing) => listing.asset.publisherTenantId === query.publisherTenantId
    );
  }

  // Filter by difficulty
  if (query.difficulty) {
    listings = listings.filter((listing) => listing.asset.difficulty === query.difficulty);
  }

  // Filter by public/private
  if (query.isPublic !== undefined) {
    listings = listings.filter((listing) => listing.asset.isPublic === query.isPublic);
  }

  // Filter by featured
  if (query.isFeatured) {
    listings = listings.filter((listing) => listing.isFeatured);
  }

  // Search by text
  if (query.searchText) {
    const searchResults = searchListings(query.searchText);
    const searchListingIds = new Set(searchResults.map((l) => l.listingId));
    listings = listings.filter((listing) => searchListingIds.has(listing.listingId));
  }

  // Apply tenant-specific visibility rules
  listings = listings.filter((listing) => {
    // If asset has allowed tenant IDs, check if querying tenant is in the list
    if (listing.asset.allowedTenantIds && listing.asset.allowedTenantIds.length > 0) {
      return listing.asset.allowedTenantIds.includes(query.tenantId);
    }
    // If asset is public, allow all tenants to see it
    if (listing.asset.isPublic) {
      return true;
    }
    // If asset is private and no allowed list, only show to publisher
    return listing.asset.publisherTenantId === query.tenantId;
  });

  // Apply pagination
  const totalCount = listings.length;
  if (query.offset !== undefined && query.limit !== undefined) {
    listings = listings.slice(query.offset, query.offset + query.limit);
  } else if (query.limit !== undefined) {
    listings = listings.slice(0, query.limit);
  }

  const executionTimeMs = Date.now() - startTime;

  const result: MarketplaceQueryResult = {
    resultId: `result-${query.queryId}`,
    query,
    listings,
    totalCount,
    executionTimeMs,
    createdAt: new Date().toISOString(),
  };

  return result;
}

export function getListing(listingId: string, tenantId: string): MarketplaceListing | null {
  const listing = getListingById(listingId);

  if (!listing) {
    logMarketplaceError(tenantId, `Listing not found: ${listingId}`);
    return null;
  }

  // Validate tenant can view this listing
  if (listing.asset.allowedTenantIds && listing.asset.allowedTenantIds.length > 0) {
    if (!listing.asset.allowedTenantIds.includes(tenantId)) {
      logMarketplaceError(tenantId, `Unauthorized: tenant ${tenantId} cannot view listing ${listingId}`);
      return null;
    }
  }

  // If asset is private and tenant is not publisher, deny access
  if (!listing.asset.isPublic && listing.asset.publisherTenantId !== tenantId) {
    logMarketplaceError(tenantId, `Unauthorized: tenant ${tenantId} cannot view private listing ${listingId}`);
    return null;
  }

  // Increment view count
  incrementAssetViewCount(listing.asset.assetId);

  return listing;
}

// ===== PUBLISH ASSET =====

export function publishAsset(
  assetData: Omit<MarketplaceAsset, 'assetId' | 'publishedAt' | 'status' | 'subscriberCount' | 'viewCount'>,
  tenantId: string,
  operatorId: string
): MarketplaceListing | null {
  // Evaluate publish policy
  const policyResult = evaluatePublishPolicy(tenantId, assetData.assetType);

  if (!policyResult.allowed) {
    logMarketplaceError(tenantId, `Publishing denied by policy: ${policyResult.reason}`);
    return null;
  }

  // Register asset
  const asset = registerAsset(assetData, operatorId);

  if (!asset) {
    return null;
  }

  // Publish asset (creates listing)
  const listing = publishAssetToRegistry(asset.assetId, tenantId, operatorId);

  return listing;
}

// ===== SUBSCRIPTION MANAGEMENT =====

export function requestSubscription(
  listingId: string,
  tenantId: string,
  facilityId: string | undefined,
  operatorId: string,
  notes?: string
): MarketplaceSubscription | null {
  return requestSubscriptionFromManager(listingId, tenantId, facilityId, operatorId, notes);
}

export function approveSubscription(
  subscriptionId: string,
  approverTenantId: string,
  approverId: string,
  reason: string
): boolean {
  return approveSubscriptionInManager(subscriptionId, approverTenantId, approverId, reason);
}

export function rejectSubscription(
  subscriptionId: string,
  approverTenantId: string,
  approverId: string,
  reason: string
): boolean {
  return rejectSubscriptionInManager(subscriptionId, approverTenantId, approverId, reason);
}

export function getSubscriptions(tenantId: string): MarketplaceSubscription[] {
  return getSubscriptionsByTenant(tenantId);
}

export function getActiveSubscriptions(tenantId: string): MarketplaceSubscription[] {
  return getActiveSubscriptionsByTenant(tenantId);
}

export function getPendingApprovals(publisherTenantId: string): MarketplaceSubscription[] {
  return getPendingSubscriptionsByPublisher(publisherTenantId);
}

export function cancelSubscription(
  subscriptionId: string,
  tenantId: string,
  operatorId: string
): boolean {
  return cancelSubscriptionInManager(subscriptionId, tenantId, operatorId);
}

// ===== ASSET ACCESS =====

export function accessAsset(
  assetId: string,
  tenantId: string,
  facilityId: string | undefined,
  operatorId: string
): boolean {
  // Check if tenant has access to this asset
  const hasAccess = canAccessAsset(assetId, tenantId);

  if (!hasAccess) {
    logMarketplaceError(tenantId, `Unauthorized: tenant ${tenantId} does not have access to asset ${assetId}`);
    return false;
  }

  // Record access
  const subscriptions = getActiveSubscriptionsByTenant(tenantId).filter(
    (sub) => sub.assetId === assetId
  );

  for (const subscription of subscriptions) {
    recordSubscriptionAccess(subscription.subscriptionId);
  }

  // Log access
  logAssetAccessed(assetId, tenantId, facilityId, operatorId);

  return true;
}

// ===== STATS =====

export function getMarketplaceStats(tenantId: string): MarketplaceStats {
  const allListings = getAllListings();
  const activeListings = getActiveListings();
  const publishedListings = getListingsByTenant(tenantId);
  const subscriptions = getSubscriptionsByTenant(tenantId);
  const activeSubscriptions = getActiveSubscriptionsByTenant(tenantId);
  const pendingApprovals = getPendingSubscriptionsByPublisher(tenantId);

  // Calculate asset type breakdown
  const assetTypeBreakdown: Record<MarketplaceAssetType, number> = {
    'sop-template': 0,
    'workflow-template': 0,
    'training-module': 0,
    'analytics-pattern-pack': 0,
    'sandbox-scenario': 0,
    'forecast-guide': 0,
    'operator-playbook': 0,
  };

  for (const listing of activeListings) {
    assetTypeBreakdown[listing.asset.assetType] += 1;
  }

  return {
    totalListings: allListings.length,
    activeListings: activeListings.length,
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: activeSubscriptions.length,
    pendingApprovals: pendingApprovals.length,
    publishedAssets: publishedListings.length,
    subscribedAssets: activeSubscriptions.length,
    assetTypeBreakdown,
  };
}

// ===== ENGINE INTERFACE =====

export const FederationMarketplaceEngine: IFederationMarketplaceEngine = {
  initializeMarketplace,
  queryListings,
  getListing,
  publishAsset,
  requestSubscription,
  approveSubscription,
  rejectSubscription,
  getSubscriptions,
  cancelSubscription,
  accessAsset,
  getMarketplaceStats,
};
