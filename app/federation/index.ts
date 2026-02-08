/**
 * Phase 73 Index
 * Central export point for all Phase 73 functionality
 */

// ============================================================================
// Type Exports
// ============================================================================
export type {
  Organization,
  VerificationRequest,
  FederationNode,
  TrustRelationship,
  FederationPolicy,
  MarketplaceExtension,
  ExtensionInstallation,
  ExtensionPricing,
  SharedInsight,
  FederatedModel,
  CrossOrgBenchmark,
  GovernanceProposal,
  Dispute,
  FederationAuditEvent,
  ExtensionManifest,
  ModelPackage,
  WorkflowBundle,
  CDNConfiguration,
} from './types';

// ============================================================================
// Federation Core Services
// ============================================================================
export { federationRegistry, FederationRegistry } from './services/FederationRegistry';
export { verificationEngine, OrganizationVerificationEngine } from './services/OrganizationVerificationEngine';
export { federationGraphBuilder, FederationGraphBuilder } from './services/FederationGraphBuilder';
export { trustScoreEngine, TrustScoreEngine } from './services/TrustScoreEngine';
export { policyEngine, FederationPolicyEngine } from './services/FederationPolicyEngine';

// ============================================================================
// Marketplace Services
// ============================================================================
export { marketplaceService, MarketplaceService } from '../marketplace/services/MarketplaceService';
export { submissionPipeline, SubmissionPipeline } from '../marketplace/services/SubmissionPipeline';
export { licensingEngine, LicensingEngine } from '../marketplace/services/LicensingEngine';

// ============================================================================
// Intelligence Exchange Services
// ============================================================================
export { secureAggregationEngine, SecureAggregationEngine } from '../intelligence/services/SecureAggregationEngine';

// ============================================================================
// UI Components
// ============================================================================
export { default as FederationDirectory } from './components/FederationDirectory';

// ============================================================================
// Constants
// ============================================================================
export const PHASE_73_VERSION = '1.0.0';
export const PHASE_73_NAME = 'Global Federation, Marketplace & Cross-Organization Intelligence Exchange';

// ============================================================================
// Quick Start Example
// ============================================================================
/**
 * Example: Register an organization and establish trust
 * 
 * ```typescript
 * import { federationRegistry, trustScoreEngine } from '@/app/federation';
 * 
 * // Register organization
 * const org = await federationRegistry.registerOrganization({
 *   name: 'Acme Mushrooms',
 *   type: 'grower',
 *   country: 'US',
 *   region: 'Pacific Northwest',
 *   metadata: {
 *     contactEmail: 'info@acme-mushrooms.com',
 *     description: 'Premium organic mushroom cultivation',
 *     size: 'medium',
 *     certifications: ['USDA Organic', 'GAP Certified'],
 *   },
 * });
 * 
 * // Calculate trust score
 * const trustScore = await trustScoreEngine.calculateTrustScore(org.id);
 * console.log('Trust Score:', trustScore.overall);
 * 
 * // Establish trust relationship
 * await federationRegistry.establishTrust(org.id, 'partner-org-id', 0.8);
 * ```
 * 
 * Example: Search and install marketplace extension
 * 
 * ```typescript
 * import { marketplaceService, licensingEngine } from '@/app/federation';
 * 
 * // Search extensions
 * const results = await marketplaceService.searchExtensions('yield prediction', {
 *   type: 'model',
 *   minRating: 4.0,
 * });
 * 
 * // Install extension
 * const installation = await marketplaceService.installExtension(
 *   results[0].id,
 *   'my-org-id',
 *   { threshold: 0.85 }
 * );
 * 
 * // Generate license
 * const license = await licensingEngine.generateLicense(
 *   results[0].id,
 *   'my-org-id',
 *   results[0].pricing
 * );
 * ```
 * 
 * Example: Aggregate data with privacy
 * 
 * ```typescript
 * import { secureAggregationEngine } from '@/app/federation';
 * 
 * const contributions = [
 *   { organizationId: 'org1', value: 12.5, timestamp: new Date() },
 *   { organizationId: 'org2', value: 14.2, timestamp: new Date() },
 *   { organizationId: 'org3', value: 11.8, timestamp: new Date() },
 * ];
 * 
 * // Aggregate with differential privacy
 * const result = await secureAggregationEngine.aggregateWithDP(
 *   contributions,
 *   1.0, // epsilon
 *   1e-5 // delta
 * );
 * 
 * console.log('Aggregated value:', result.result);
 * console.log('Privacy budget used:', result.privacyBudgetUsed);
 * ```
 */
