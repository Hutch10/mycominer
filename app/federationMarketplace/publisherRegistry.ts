// Phase 41: Federation Marketplace v2
// publisherRegistry.ts
// Publisher functionality for registering and managing marketplace assets

import {
  MarketplaceAsset,
  MarketplaceAssetType,
  MarketplaceAssetStatus,
  MarketplaceListing,
} from './federationMarketplaceTypes';
import { logListingCreated, logListingUpdated, logListingArchived, logMarketplaceError } from './marketplaceLog';

// In-memory stores (in production: persist to database)
let marketplaceAssets: Map<string, MarketplaceAsset> = new Map();
let marketplaceListings: Map<string, MarketplaceListing> = new Map();

// ===== ASSET VALIDATION =====

export function validateAssetMetadata(asset: Partial<MarketplaceAsset>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!asset.name || asset.name.trim().length === 0) {
    errors.push('Asset name is required');
  }

  if (!asset.description || asset.description.trim().length < 10) {
    errors.push('Asset description must be at least 10 characters');
  }

  if (!asset.assetType) {
    errors.push('Asset type is required');
  }

  if (!asset.version || !asset.version.match(/^\d+\.\d+(\.\d+)?$/)) {
    errors.push('Asset version must be in format X.Y or X.Y.Z');
  }

  if (!asset.publisherTenantId) {
    errors.push('Publisher tenant ID is required');
  }

  if (!asset.sourceReferenceId) {
    errors.push('Source reference ID is required (must point to actual asset)');
  }

  if (!asset.category || asset.category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (asset.tags && asset.tags.length === 0) {
    errors.push('At least one tag is required');
  }

  return { valid: errors.length === 0, errors };
}

export function validateAssetTypeRules(assetType: MarketplaceAssetType, sourceReferenceId: string): { valid: boolean; error?: string } {
  // In production: validate that sourceReferenceId exists in the appropriate subsystem
  const validPrefixes: Record<MarketplaceAssetType, string[]> = {
    'sop-template': ['sop-', 'SOP-'],
    'workflow-template': ['wf-', 'workflow-'],
    'training-module': ['module-', 'training-'],
    'analytics-pattern-pack': ['pattern-', 'analytics-'],
    'sandbox-scenario': ['sandbox-', 'experiment-'],
    'forecast-guide': ['forecast-', 'prediction-'],
    'operator-playbook': ['playbook-', 'guide-'],
  };

  const prefixes = validPrefixes[assetType];
  const hasValidPrefix = prefixes.some((prefix) => sourceReferenceId.startsWith(prefix));

  if (!hasValidPrefix) {
    return {
      valid: false,
      error: `Source reference ID must start with one of: ${prefixes.join(', ')}`,
    };
  }

  return { valid: true };
}

// ===== ASSET REGISTRATION =====

export function registerAsset(
  assetData: Omit<MarketplaceAsset, 'assetId' | 'publishedAt' | 'status' | 'subscriberCount' | 'viewCount'>,
  operatorId: string
): MarketplaceAsset | null {
  // Validate metadata
  const validation = validateAssetMetadata(assetData);
  if (!validation.valid) {
    logMarketplaceError(assetData.publisherTenantId, `Asset validation failed: ${validation.errors.join(', ')}`);
    return null;
  }

  // Validate asset type rules
  const typeValidation = validateAssetTypeRules(assetData.assetType, assetData.sourceReferenceId);
  if (!typeValidation.valid) {
    logMarketplaceError(assetData.publisherTenantId, typeValidation.error || 'Asset type validation failed');
    return null;
  }

  // Create asset
  const asset: MarketplaceAsset = {
    assetId: `asset-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    publishedAt: new Date().toISOString(),
    status: 'draft', // starts as draft
    subscriberCount: 0,
    viewCount: 0,
    ...assetData,
  };

  marketplaceAssets.set(asset.assetId, asset);

  return asset;
}

export function publishAsset(assetId: string, tenantId: string, operatorId: string): MarketplaceListing | null {
  const asset = marketplaceAssets.get(assetId);

  if (!asset) {
    logMarketplaceError(tenantId, `Asset not found: ${assetId}`);
    return null;
  }

  // Validate tenant ownership
  if (asset.publisherTenantId !== tenantId) {
    logMarketplaceError(tenantId, `Unauthorized: tenant ${tenantId} cannot publish asset ${assetId}`);
    return null;
  }

  // Update asset status
  asset.status = 'published';
  marketplaceAssets.set(assetId, asset);

  // Create listing
  const listing: MarketplaceListing = {
    listingId: `listing-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    asset,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    isFeatured: false,
  };

  marketplaceListings.set(listing.listingId, listing);
  logListingCreated(listing, operatorId);

  return listing;
}

// ===== LISTING MANAGEMENT =====

export function updateListing(
  listingId: string,
  updates: Partial<Pick<MarketplaceListing, 'isActive' | 'isFeatured' | 'expiresAt' | 'prerequisites' | 'requiredPhases' | 'minimumComplianceLevel'>>,
  tenantId: string,
  operatorId: string
): MarketplaceListing | null {
  const listing = marketplaceListings.get(listingId);

  if (!listing) {
    logMarketplaceError(tenantId, `Listing not found: ${listingId}`);
    return null;
  }

  // Validate tenant ownership
  if (listing.asset.publisherTenantId !== tenantId) {
    logMarketplaceError(tenantId, `Unauthorized: tenant ${tenantId} cannot update listing ${listingId}`);
    return null;
  }

  // Apply updates
  const updatedListing: MarketplaceListing = {
    ...listing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  marketplaceListings.set(listingId, updatedListing);
  logListingUpdated(updatedListing, operatorId);

  return updatedListing;
}

export function archiveListing(listingId: string, tenantId: string, operatorId: string): boolean {
  const listing = marketplaceListings.get(listingId);

  if (!listing) {
    logMarketplaceError(tenantId, `Listing not found: ${listingId}`);
    return false;
  }

  // Validate tenant ownership
  if (listing.asset.publisherTenantId !== tenantId) {
    logMarketplaceError(tenantId, `Unauthorized: tenant ${tenantId} cannot archive listing ${listingId}`);
    return false;
  }

  // Update asset and listing status
  listing.asset.status = 'archived';
  listing.isActive = false;
  listing.updatedAt = new Date().toISOString();

  marketplaceAssets.set(listing.asset.assetId, listing.asset);
  marketplaceListings.set(listingId, listing);

  logListingArchived(listing, operatorId);

  return true;
}

// ===== QUERY FUNCTIONS =====

export function getAllListings(): MarketplaceListing[] {
  return Array.from(marketplaceListings.values());
}

export function getListingById(listingId: string): MarketplaceListing | undefined {
  return marketplaceListings.get(listingId);
}

export function getListingsByTenant(tenantId: string): MarketplaceListing[] {
  return Array.from(marketplaceListings.values()).filter(
    (listing) => listing.asset.publisherTenantId === tenantId
  );
}

export function getListingsByAssetType(assetType: MarketplaceAssetType): MarketplaceListing[] {
  return Array.from(marketplaceListings.values()).filter(
    (listing) => listing.asset.assetType === assetType
  );
}

export function getActiveListings(): MarketplaceListing[] {
  return Array.from(marketplaceListings.values()).filter(
    (listing) => listing.isActive && listing.asset.status === 'published'
  );
}

export function getFeaturedListings(): MarketplaceListing[] {
  return Array.from(marketplaceListings.values()).filter(
    (listing) => listing.isFeatured && listing.isActive
  );
}

export function searchListings(searchText: string): MarketplaceListing[] {
  const lowerSearch = searchText.toLowerCase();
  return Array.from(marketplaceListings.values()).filter((listing) => {
    return (
      listing.asset.name.toLowerCase().includes(lowerSearch) ||
      listing.asset.description.toLowerCase().includes(lowerSearch) ||
      listing.asset.tags.some((tag) => tag.toLowerCase().includes(lowerSearch)) ||
      listing.asset.category.toLowerCase().includes(lowerSearch)
    );
  });
}

export function filterListingsByTags(tags: string[]): MarketplaceListing[] {
  return Array.from(marketplaceListings.values()).filter((listing) => {
    return tags.some((tag) => listing.asset.tags.includes(tag));
  });
}

// ===== ASSET FUNCTIONS =====

export function getAssetById(assetId: string): MarketplaceAsset | undefined {
  return marketplaceAssets.get(assetId);
}

export function updateAssetMetadata(
  assetId: string,
  updates: Partial<Pick<MarketplaceAsset, 'name' | 'description' | 'tags' | 'category' | 'difficulty' | 'estimatedValue'>>,
  tenantId: string
): MarketplaceAsset | null {
  const asset = marketplaceAssets.get(assetId);

  if (!asset) {
    logMarketplaceError(tenantId, `Asset not found: ${assetId}`);
    return null;
  }

  // Validate tenant ownership
  if (asset.publisherTenantId !== tenantId) {
    logMarketplaceError(tenantId, `Unauthorized: tenant ${tenantId} cannot update asset ${assetId}`);
    return null;
  }

  // Apply updates
  const updatedAsset: MarketplaceAsset = {
    ...asset,
    ...updates,
  };

  marketplaceAssets.set(assetId, updatedAsset);

  // Update corresponding listing if exists
  const listing = Array.from(marketplaceListings.values()).find((l) => l.asset.assetId === assetId);
  if (listing) {
    listing.asset = updatedAsset;
    listing.updatedAt = new Date().toISOString();
    marketplaceListings.set(listing.listingId, listing);
  }

  return updatedAsset;
}

export function incrementAssetViewCount(assetId: string): void {
  const asset = marketplaceAssets.get(assetId);
  if (asset) {
    asset.viewCount += 1;
    asset.lastAccessedAt = new Date().toISOString();
    marketplaceAssets.set(assetId, asset);

    // Update corresponding listing
    const listing = Array.from(marketplaceListings.values()).find((l) => l.asset.assetId === assetId);
    if (listing) {
      listing.asset = asset;
      marketplaceListings.set(listing.listingId, listing);
    }
  }
}

export function incrementAssetSubscriberCount(assetId: string): void {
  const asset = marketplaceAssets.get(assetId);
  if (asset) {
    asset.subscriberCount += 1;
    marketplaceAssets.set(assetId, asset);

    // Update corresponding listing
    const listing = Array.from(marketplaceListings.values()).find((l) => l.asset.assetId === assetId);
    if (listing) {
      listing.asset = asset;
      marketplaceListings.set(listing.listingId, listing);
    }
  }
}

export function decrementAssetSubscriberCount(assetId: string): void {
  const asset = marketplaceAssets.get(assetId);
  if (asset) {
    asset.subscriberCount = Math.max(0, asset.subscriberCount - 1);
    marketplaceAssets.set(assetId, asset);

    // Update corresponding listing
    const listing = Array.from(marketplaceListings.values()).find((l) => l.asset.assetId === assetId);
    if (listing) {
      listing.asset = asset;
      marketplaceListings.set(listing.listingId, listing);
    }
  }
}

// ===== UTILITY FUNCTIONS =====

export function clearPublisherRegistry(): void {
  marketplaceAssets.clear();
  marketplaceListings.clear();
}
