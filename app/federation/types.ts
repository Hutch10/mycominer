/**
 * Phase 73: Global Federation, Marketplace & Cross-Organization Intelligence Exchange
 * Core Type Definitions
 * 
 * Defines types for:
 * - Federated organizations and verification
 * - Marketplace extensions and models
 * - Intelligence exchange and aggregation
 * - Trust scoring and governance
 */

// ============================================================================
// Federation Core Types
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  type: 'grower' | 'research' | 'supplier' | 'government' | 'cooperative';
  country: string;
  region: string;
  verificationStatus: 'pending' | 'verified' | 'suspended' | 'revoked';
  verificationLevel: 'basic' | 'standard' | 'premium' | 'certified';
  joinedAt: Date;
  verifiedAt?: Date;
  metadata: {
    website?: string;
    contactEmail: string;
    description: string;
    size: 'small' | 'medium' | 'large' | 'enterprise';
    certifications: string[];
  };
  trustScore: number; // 0-100
  reputationMetrics: ReputationMetrics;
}

export interface ReputationMetrics {
  contributionScore: number; // Data/model contributions
  usageScore: number; // How others use their contributions
  complianceScore: number; // Policy adherence
  communityScore: number; // Peer ratings
  recencyScore: number; // Active participation
  overallScore: number; // Composite
}

export interface VerificationRequest {
  organizationId: string;
  requestedLevel: 'basic' | 'standard' | 'premium' | 'certified';
  documents: {
    type: 'business_license' | 'certification' | 'insurance' | 'reference';
    url: string;
    expiresAt?: Date;
  }[];
  references?: {
    organizationId: string;
    contactEmail: string;
  }[];
  attestations: {
    type: string;
    value: string;
    signedBy: string;
  }[];
}

export interface FederationNode {
  organizationId: string;
  endpoint: string; // API endpoint
  capabilities: FederationCapability[];
  status: 'online' | 'offline' | 'degraded';
  lastHeartbeat: Date;
  version: string;
  regions: string[];
}

export type FederationCapability = 
  | 'data-sharing' 
  | 'model-hosting' 
  | 'insight-publishing'
  | 'marketplace-hosting'
  | 'compute-provider'
  | 'storage-provider';

export interface TrustRelationship {
  fromOrgId: string;
  toOrgId: string;
  trustLevel: number; // 0-1
  relationshipType: 'peer' | 'verified' | 'partner' | 'suspicious';
  establishedAt: Date;
  lastUpdated: Date;
  interactions: number;
  incidents: number;
}

export interface FederationPolicy {
  id: string;
  name: string;
  version: string;
  scope: 'global' | 'regional' | 'bilateral';
  organizations: string[]; // Empty = global
  rules: PolicyRule[];
  enforcementLevel: 'advisory' | 'warning' | 'blocking';
  createdAt: Date;
  effectiveAt: Date;
  expiresAt?: Date;
}

export interface PolicyRule {
  id: string;
  category: 'data-sharing' | 'model-exchange' | 'marketplace' | 'governance';
  condition: string; // JSONLogic expression
  action: 'allow' | 'deny' | 'require-approval' | 'audit';
  message?: string;
}

// ============================================================================
// Marketplace Types
// ============================================================================

export interface MarketplaceExtension {
  id: string;
  type: 'model' | 'workflow' | 'sop' | 'integration' | 'dashboard';
  name: string;
  slug: string;
  version: string;
  publisherId: string; // Organization ID
  publisherName: string;
  description: string;
  longDescription: string;
  category: string[];
  tags: string[];
  pricing: ExtensionPricing;
  stats: ExtensionStats;
  metadata: {
    icon?: string;
    screenshots: string[];
    documentation: string;
    repository?: string;
    license: string;
    compatibility: CompatibilityInfo;
    dependencies: ExtensionDependency[];
  };
  security: SecurityScan;
  publishedAt: Date;
  updatedAt: Date;
  status: 'draft' | 'review' | 'approved' | 'published' | 'deprecated' | 'removed';
}

export interface ExtensionPricing {
  model: 'free' | 'paid' | 'freemium' | 'subscription' | 'usage-based';
  currency?: string;
  price?: number; // One-time or monthly
  tiers?: {
    name: string;
    price: number;
    limits: Record<string, number>;
  }[];
  usageRates?: {
    metric: string;
    rate: number;
    unit: string;
  }[];
  trialDays?: number;
}

export interface ExtensionStats {
  installs: number;
  activeInstalls: number;
  rating: number; // 0-5
  reviewCount: number;
  downloads: number;
  revenue?: number;
}

export interface CompatibilityInfo {
  minVersion: string;
  maxVersion?: string;
  requiredFeatures: string[];
  supportedRegions?: string[];
}

export interface ExtensionDependency {
  extensionId: string;
  version: string;
  optional: boolean;
}

export interface SecurityScan {
  scanDate: Date;
  status: 'pending' | 'passed' | 'warning' | 'failed';
  findings: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    message: string;
  }[];
  sbom?: SoftwareBillOfMaterials;
  signatures: {
    type: 'pgp' | 'x509';
    value: string;
    verifiedBy: string;
  }[];
}

export interface SoftwareBillOfMaterials {
  format: 'cyclonedx' | 'spdx';
  version: string;
  components: {
    name: string;
    version: string;
    license: string;
    vulnerabilities?: number;
  }[];
}

export interface ExtensionSubmission {
  extensionId?: string; // Undefined for new submissions
  version: string;
  package: {
    url: string;
    size: number;
    checksum: string;
  };
  metadata: Partial<MarketplaceExtension>;
  submittedBy: string;
  submittedAt: Date;
  reviewStatus: 'pending' | 'in-review' | 'approved' | 'rejected';
  reviewNotes?: string;
}

export interface ExtensionInstallation {
  id: string;
  organizationId: string;
  extensionId: string;
  version: string;
  installedAt: Date;
  status: 'active' | 'disabled' | 'updating' | 'error';
  configuration: Record<string, unknown>;
  usage: {
    lastUsed: Date;
    invocations: number;
    metrics: Record<string, number>;
  };
  license?: {
    key: string;
    expiresAt?: Date;
  };
}

// ============================================================================
// Intelligence Exchange Types
// ============================================================================

export interface SharedInsight {
  id: string;
  publisherId: string;
  publisherName: string;
  type: 'yield-pattern' | 'contamination-alert' | 'market-trend' | 'best-practice';
  category: string;
  title: string;
  description: string;
  aggregationMethod: 'differential-privacy' | 'k-anonymity' | 'secure-mpc' | 'federated';
  privacyGuarantees: {
    epsilon?: number; // DP privacy budget
    delta?: number;
    k?: number; // k-anonymity
    participantCount: number;
  };
  data: {
    summary: Record<string, unknown>;
    confidence: number;
    timeRange: { start: Date; end: Date };
    regions?: string[];
  };
  access: {
    policy: 'public' | 'verified-only' | 'paid' | 'partner-only';
    price?: number;
    organizations?: string[];
  };
  explainability: ExplainabilityMetadata;
  publishedAt: Date;
  expiresAt?: Date;
}

export interface ExplainabilityMetadata {
  method: string;
  factors: {
    name: string;
    importance: number;
    description: string;
  }[];
  dataSources: {
    organizationId?: string; // Omitted for anonymized
    count: number;
    dateRange: { start: Date; end: Date };
  }[];
  limitations: string[];
}

export interface FederatedModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'timeseries' | 'detection';
  version: string;
  architecture: string;
  task: string;
  publishers: string[]; // Org IDs that contributed
  trainingStats: {
    rounds: number;
    participants: number;
    totalSamples: number; // Aggregated
    accuracy?: number;
    metrics: Record<string, number>;
  };
  privacyTechnique: 'federated-averaging' | 'secure-aggregation' | 'split-learning';
  package: {
    url: string;
    format: 'onnx' | 'tensorflow' | 'pytorch' | 'sklearn';
    size: number;
  };
  license: string;
  publishedAt: Date;
}

export interface CrossOrgBenchmark {
  id: string;
  name: string;
  metric: string;
  participants: {
    organizationId: string;
    anonymousId?: string; // For private benchmarks
    score: number;
    rank: number;
    percentile: number;
  }[];
  aggregateStats: {
    mean: number;
    median: number;
    stdDev: number;
    min: number;
    max: number;
  };
  timeRange: { start: Date; end: Date };
  category: string;
  publishedAt: Date;
}

// ============================================================================
// Governance Types
// ============================================================================

export interface GovernanceProposal {
  id: string;
  type: 'policy-change' | 'member-admission' | 'member-suspension' | 'fee-change';
  title: string;
  description: string;
  proposedBy: string; // Org ID
  proposedAt: Date;
  votingDeadline: Date;
  requiredQuorum: number; // Percentage
  requiredMajority: number; // Percentage
  status: 'draft' | 'voting' | 'passed' | 'rejected' | 'implemented';
  votes: {
    organizationId: string;
    vote: 'approve' | 'reject' | 'abstain';
    weight: number;
    castAt: Date;
  }[];
  implementation?: {
    implementedAt: Date;
    implementedBy: string;
    notes: string;
  };
}

export interface Dispute {
  id: string;
  type: 'policy-violation' | 'data-quality' | 'payment' | 'intellectual-property' | 'other';
  parties: {
    complainant: string; // Org ID
    respondent: string;
  };
  description: string;
  evidence: {
    type: string;
    url: string;
    submittedBy: string;
    submittedAt: Date;
  }[];
  status: 'filed' | 'investigating' | 'mediation' | 'arbitration' | 'resolved' | 'closed';
  resolution?: {
    outcome: string;
    actions: string[];
    resolvedAt: Date;
    resolvedBy: string;
  };
  timeline: {
    event: string;
    timestamp: Date;
    actor: string;
  }[];
  createdAt: Date;
}

export interface FederationAuditEvent {
  id: string;
  timestamp: Date;
  organizationId: string;
  eventType: string;
  category: 'federation' | 'marketplace' | 'intelligence' | 'governance';
  action: string;
  resource: {
    type: string;
    id: string;
  };
  details: Record<string, unknown>;
  outcome: 'success' | 'failure' | 'partial';
  ipAddress?: string;
  userAgent?: string;
  policyEvaluations?: {
    policyId: string;
    result: 'allow' | 'deny' | 'audit';
  }[];
}

// ============================================================================
// Developer Toolkit Types
// ============================================================================

export interface ExtensionManifest {
  name: string;
  version: string;
  description: string;
  author: {
    name: string;
    email: string;
    organization: string;
  };
  license: string;
  type: 'model' | 'workflow' | 'sop' | 'integration' | 'dashboard';
  entrypoint: string;
  capabilities: string[];
  permissions: {
    data: string[];
    models: string[];
    apis: string[];
  };
  compatibility: CompatibilityInfo;
  dependencies: ExtensionDependency[];
  configuration?: {
    schema: Record<string, unknown>; // JSON Schema
    defaults: Record<string, unknown>;
  };
}

export interface ModelPackage {
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'timeseries' | 'detection';
  framework: 'tensorflow' | 'pytorch' | 'sklearn' | 'onnx';
  artifacts: {
    model: string; // Path to model file
    weights?: string;
    config?: string;
  };
  metadata: {
    inputSchema: Record<string, unknown>;
    outputSchema: Record<string, unknown>;
    preprocessing?: string;
    postprocessing?: string;
  };
  performance: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    customMetrics?: Record<string, number>;
  };
  training: {
    dataset: string;
    samples: number;
    epochs: number;
    hyperparameters: Record<string, unknown>;
  };
}

export interface WorkflowBundle {
  name: string;
  version: string;
  description: string;
  steps: {
    id: string;
    name: string;
    type: string;
    config: Record<string, unknown>;
    dependencies: string[];
  }[];
  triggers: {
    type: 'manual' | 'schedule' | 'event';
    config: Record<string, unknown>;
  }[];
  variables: {
    name: string;
    type: string;
    default?: unknown;
    required: boolean;
  }[];
}

// ============================================================================
// CDN & Routing Types (Phase 73B)
// ============================================================================

export interface CDNConfiguration {
  id: string;
  organizationId: string;
  enabled: boolean;
  regions: {
    code: string;
    endpoint: string;
    weight: number;
  }[];
  cachePolicy: {
    defaultTTL: number;
    maxTTL: number;
    bypassPatterns: string[];
  };
  routing: {
    strategy: 'latency' | 'geo' | 'weighted' | 'failover';
    healthCheckInterval: number;
  };
  restrictions: {
    allowedCountries?: string[];
    blockedCountries?: string[];
    ipWhitelist?: string[];
    ipBlacklist?: string[];
  };
}

export interface EdgeCacheEntry {
  key: string;
  region: string;
  content: Buffer | string;
  contentType: string;
  size: number;
  cachedAt: Date;
  expiresAt: Date;
  hitCount: number;
}

export interface LatencyMetric {
  organizationId: string;
  region: string;
  targetRegion: string;
  latency: number; // ms
  timestamp: Date;
  packetLoss?: number;
  bandwidth?: number;
}
