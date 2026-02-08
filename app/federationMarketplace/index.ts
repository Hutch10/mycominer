/**
 * Phase 62: Federation Marketplace - Public API
 * 
 * Central export point for all federation components
 */

// Core Engine
export { FederationEngine } from './federationEngine';

// Component Engines
export { FederationAggregator } from './federationAggregator';
export { FederationPolicyEngine } from './federationPolicyEngine';
export { FederationAnalyticsEngine } from './federationAnalyticsEngine';
export { FederationLog } from './federationLog';

// Types
export type {
  Federation,
  SharingAgreement,
  FederationDataCategory,
  FederationMetric,
  FederationBenchmark,
  FederationInsight,
  FederationInsightType,
  FederationQuery,
  FederationQueryType,
  FederationQueryResult,
  FederationResultData,
  FederationTrend,
  FederationComparison,
  AnonymizedTenant,
  FederationPolicyDecision,
  FederationContext,
  FederationLogEntry,
  AnonymizationResult,
} from './federationTypes';
