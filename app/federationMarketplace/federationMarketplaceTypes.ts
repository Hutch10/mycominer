// Phase 41: Federation Marketplace v2
// federationMarketplaceTypes.ts
// Core type definitions for multi-tenant marketplace

// ===== ASSET TYPES =====

export type MarketplaceAssetType =
  | 'sop-template'
  | 'workflow-template'
  | 'training-module'
  | 'analytics-pattern-pack'
  | 'sandbox-scenario'
  | 'forecast-guide'
  | 'operator-playbook';

export type MarketplaceAssetStatus = 'draft' | 'published' | 'archived';
export type MarketplaceSubscriptionStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'cancelled';
export type MarketplaceApprovalStatus = 'pending' | 'approved' | 'rejected';
export type MarketplacePolicyAction = 'publish' | 'subscribe' | 'access';

// ===== MARKETPLACE ASSET =====

export interface MarketplaceAsset {
  assetId: string;
  assetType: MarketplaceAssetType;
  name: string;
  description: string;
  version: string;

  // Publisher information
  publisherTenantId: string;
  publisherFacilityId?: string;
  publishedBy: string; // operator ID
  publishedAt: string; // ISO timestamp

  // Asset content (read-only reference, NOT the actual data)
  sourceReferenceId: string; // ID of the source asset (e.g., SOP ID, workflow ID, training module ID)
  sourceReferenceType: MarketplaceAssetType;
  
  // Metadata
  tags: string[];
  category: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedValue?: string; // e.g., "time-saving", "quality-improvement", "compliance-support"

  // Policy & access
  isPublic: boolean; // if false, only approved subscribers can access
  allowedTenantIds?: string[]; // if specified, only these tenants can subscribe
  federationRequired: boolean; // if true, requires federation agreement between tenants

  // Status
  status: MarketplaceAssetStatus;
  
  // Stats
  subscriberCount: number;
  viewCount: number;
  lastAccessedAt?: string;
}

// ===== MARKETPLACE LISTING =====

export interface MarketplaceListing {
  listingId: string;
  asset: MarketplaceAsset;
  
  // Listing metadata
  createdAt: string;
  updatedAt: string;
  expiresAt?: string; // optional expiration date
  
  // Visibility & filtering
  isActive: boolean;
  isFeatured: boolean;
  
  // Requirements
  prerequisites?: string[];
  requiredPhases?: string[]; // e.g., ["Phase 33", "Phase 37"] - which phases must be enabled
  minimumComplianceLevel?: string;
}

// ===== MARKETPLACE SUBSCRIPTION =====

export interface MarketplaceSubscription {
  subscriptionId: string;
  listingId: string;
  assetId: string;
  
  // Subscriber information
  subscriberTenantId: string;
  subscriberFacilityId?: string;
  requestedBy: string; // operator ID
  requestedAt: string;
  
  // Approval workflow
  approvalStatus: MarketplaceSubscriptionStatus;
  approvedBy?: string; // operator ID from publisher side
  approvedAt?: string;
  rejectedReason?: string;
  
  // Access control
  isActive: boolean;
  activatedAt?: string;
  expiresAt?: string;
  
  // Usage tracking
  accessCount: number;
  lastAccessedAt?: string;
  
  // Notes
  subscriberNotes?: string;
  publisherNotes?: string;
}

// ===== MARKETPLACE POLICY =====

export interface MarketplacePolicy {
  policyId: string;
  tenantId: string; // tenant this policy applies to
  
  // Policy definition
  policyName: string;
  policyDescription: string;
  policyType: 'publisher' | 'subscriber' | 'global';
  
  // Rules
  allowedAssetTypes: MarketplaceAssetType[];
  canPublish: boolean;
  canSubscribe: boolean;
  requiresApproval: boolean; // if true, all subscriptions require manual approval
  
  // Restrictions
  maxPublishedAssets?: number;
  maxSubscriptions?: number;
  allowedPublisherTenants?: string[]; // which tenants can publish to this tenant
  allowedSubscriberTenants?: string[]; // which tenants can subscribe to this tenant's assets
  
  // Compliance & federation
  requiresFederationAgreement: boolean;
  minimumComplianceLevel?: string;
  
  // Status
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===== MARKETPLACE REQUEST =====

export interface MarketplaceRequest {
  requestId: string;
  requestType: 'publish' | 'subscribe' | 'access';
  
  // Request details
  tenantId: string;
  facilityId?: string;
  requestedBy: string; // operator ID
  requestedAt: string;
  
  // Target
  listingId?: string;
  assetId?: string;
  
  // Status
  status: MarketplaceApprovalStatus;
  processedBy?: string;
  processedAt?: string;
  
  // Reasoning
  requestReason?: string;
  responseReason?: string;
}

// ===== MARKETPLACE APPROVAL =====

export interface MarketplaceApproval {
  approvalId: string;
  requestId: string;
  
  // Approval details
  approverTenantId: string;
  approvedBy: string; // operator ID
  approvedAt: string;
  
  // Decision
  decision: 'approved' | 'rejected';
  reason: string;
  
  // Conditions
  expiresAt?: string;
  conditions?: string[];
  
  // Audit
  policyEvaluations: PolicyEvaluation[];
}

// ===== POLICY EVALUATION =====

export interface PolicyEvaluation {
  policyId: string;
  policyName: string;
  evaluatedAt: string;
  result: 'pass' | 'fail' | 'warning';
  reason: string;
}

// ===== MARKETPLACE LOG ENTRY =====

export type MarketplaceLogEntryType =
  | 'listing-created'
  | 'listing-updated'
  | 'listing-archived'
  | 'subscription-requested'
  | 'subscription-approved'
  | 'subscription-rejected'
  | 'subscription-activated'
  | 'subscription-cancelled'
  | 'asset-accessed'
  | 'policy-evaluated'
  | 'explain-requested'
  | 'pattern-viewed'
  | 'training-opened'
  | 'error';

export interface MarketplaceLogEntry {
  logId: string;
  timestamp: string;
  logType: MarketplaceLogEntryType;
  
  // Context
  tenantId: string;
  facilityId?: string;
  operatorId?: string;
  
  // Targets
  listingId?: string;
  assetId?: string;
  subscriptionId?: string;
  policyId?: string;
  
  // Details
  action?: string;
  result?: 'success' | 'failure' | 'pending';
  metadata?: Record<string, any>;
  errorMessage?: string;
}

// ===== QUERY & RESULT TYPES =====

export interface MarketplaceQuery {
  queryId: string;
  tenantId: string;
  facilityId?: string;
  
  // Filters
  assetType?: MarketplaceAssetType;
  category?: string;
  tags?: string[];
  publisherTenantId?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isPublic?: boolean;
  isFeatured?: boolean;
  
  // Search
  searchText?: string;
  
  // Pagination
  limit?: number;
  offset?: number;
}

export interface MarketplaceQueryResult {
  resultId: string;
  query: MarketplaceQuery;
  listings: MarketplaceListing[];
  totalCount: number;
  executionTimeMs: number;
  createdAt: string;
}

// ===== MARKETPLACE ENGINE INTERFACE =====

export interface FederationMarketplaceEngine {
  initializeMarketplace: (tenantId: string) => void;
  queryListings: (query: MarketplaceQuery) => MarketplaceQueryResult;
  getListing: (listingId: string, tenantId: string) => MarketplaceListing | null;
  publishAsset: (asset: MarketplaceAsset, tenantId: string) => MarketplaceListing | null;
  requestSubscription: (listingId: string, tenantId: string, operatorId: string, notes?: string) => MarketplaceSubscription | null;
  approveSubscription: (subscriptionId: string, approverTenantId: string, approverId: string, reason: string) => boolean;
  rejectSubscription: (subscriptionId: string, approverTenantId: string, approverId: string, reason: string) => boolean;
  getSubscriptions: (tenantId: string) => MarketplaceSubscription[];
  cancelSubscription: (subscriptionId: string, tenantId: string) => boolean;
  accessAsset: (assetId: string, tenantId: string) => boolean;
  getMarketplaceStats: (tenantId: string) => MarketplaceStats;
}

export interface MarketplaceStats {
  totalListings: number;
  activeListings: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  pendingApprovals: number;
  publishedAssets: number;
  subscribedAssets: number;
  assetTypeBreakdown: Record<MarketplaceAssetType, number>;
}
